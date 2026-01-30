import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Image, Video, Upload, Link, Loader2, Youtube, Bold, Heading1, Heading2, 
  Smile, Link2, Italic, Underline, Strikethrough, ZoomIn, ZoomOut, RotateCcw, Trash2
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// Image size presets (percentage of container width)
const IMAGE_SIZES = [25, 50, 75, 100] as const;

const COMMON_EMOJIS = [
  '😀', '😊', '🎉', '👏', '🚀', '✨', '💡', '🔥', '❤️', '👍',
  '📢', '📌', '✅', '⭐', '🏆', '💼', '📊', '🎯', '💪', '🤝',
  '📅', '📍', '🔗', '📧', '📞', '🏢', '👥', '🎓', '📰', '🗓️'
];

// Convert markdown to HTML for display
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Split by lines and process each
  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  
  for (const line of lines) {
    let processedLine = line;
    
    // Convert headings
    if (processedLine.match(/^# (.+)$/)) {
      processedLine = processedLine.replace(/^# (.+)$/, '<h1>$1</h1>');
      htmlParts.push(processedLine);
      continue;
    }
    if (processedLine.match(/^## (.+)$/)) {
      processedLine = processedLine.replace(/^## (.+)$/, '<h2>$1</h2>');
      htmlParts.push(processedLine);
      continue;
    }
    
    // Convert images with optional size: ![alt](url){width=50%}
    processedLine = processedLine.replace(
      /!\[([^\]]*)\]\(([^)]+)\)(?:\{width=(\d+)%\})?/g, 
      (_, alt, src, width) => {
        const style = width ? ` style="width: ${width}%;"` : '';
        return `<img src="${src}" alt="${alt}" class="editor-image"${style} />`;
      }
    );
    
    // Convert videos
    processedLine = processedLine.replace(/\[video\]\(([^)]+)\)/g, '<div class="editor-video" data-src="$1">[Vídeo]</div>');
    
    // Convert links
    processedLine = processedLine.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Convert bold **text**
    processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic *text*
    processedLine = processedLine.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Convert strikethrough ~~text~~
    processedLine = processedLine.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    
    // Empty line = spacer div, non-empty = paragraph
    if (processedLine.trim() === '') {
      htmlParts.push('<div class="editor-spacer"></div>');
    } else {
      htmlParts.push(`<p class="editor-paragraph">${processedLine}</p>`);
    }
  }
  
  return htmlParts.join('');
}

// Convert HTML back to markdown for storage
function htmlToMarkdown(html: string): string {
  if (!html) return '';
  
  let markdown = html;
  
  // First, normalize the HTML - remove line breaks inside formatting tags
  markdown = markdown.replace(/<(strong|b|em|i|del|s|strike|u)>\s*/gi, '<$1>');
  markdown = markdown.replace(/\s*<\/(strong|b|em|i|del|s|strike|u)>/gi, '</$1>');
  
  // Handle our custom editor classes FIRST (before general div/p handling)
  // Convert editor-spacer divs to empty lines
  markdown = markdown.replace(/<div[^>]*class="editor-spacer"[^>]*><\/div>/gi, '\n');
  markdown = markdown.replace(/<div[^>]*class='editor-spacer'[^>]*><\/div>/gi, '\n');
  
  // Convert editor-paragraph p tags to lines with newline
  markdown = markdown.replace(/<p[^>]*class="editor-paragraph"[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');
  markdown = markdown.replace(/<p[^>]*class='editor-paragraph'[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');
  
  // Remove contenteditable artifacts
  markdown = markdown.replace(/<div><br><\/div>/gi, '\n');
  markdown = markdown.replace(/<div>/gi, '\n');
  markdown = markdown.replace(/<\/div>/gi, '');
  
  // Convert headings (allow multiline content with [\s\S])
  markdown = markdown.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n');
  
  // Convert images - extract width style if present
  markdown = markdown.replace(
    /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*(?:style="[^"]*width:\s*(\d+)%[^"]*")?[^>]*\/?>/gi,
    (_, src, alt, width) => width ? `![${alt}](${src}){width=${width}%}` : `![${alt}](${src})`
  );
  markdown = markdown.replace(
    /<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*(?:style="[^"]*width:\s*(\d+)%[^"]*")?[^>]*\/?>/gi,
    (_, alt, src, width) => width ? `![${alt}](${src}){width=${width}%}` : `![${alt}](${src})`
  );
  // Also handle when style comes before src/alt
  markdown = markdown.replace(
    /<img[^>]*style="[^"]*width:\s*(\d+)%[^"]*"[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    (_, width, src, alt) => `![${alt}](${src}){width=${width}%}`
  );
  markdown = markdown.replace(
    /<img[^>]*style="[^"]*width:\s*(\d+)%[^"]*"[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/gi,
    (_, width, alt, src) => `![${alt}](${src}){width=${width}%}`
  );
  
  // Convert videos
  markdown = markdown.replace(/<div[^>]*class="editor-video"[^>]*data-src="([^"]+)"[^>]*>[\s\S]*?<\/div>/gi, '[video]($1)');
  
  // Convert links (allow multiline content)
  markdown = markdown.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Convert formatting (use [\s\S]*? for multiline support, but be non-greedy)
  markdown = markdown.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');
  markdown = markdown.replace(/<del>([\s\S]*?)<\/del>/gi, '~~$1~~');
  markdown = markdown.replace(/<strike>([\s\S]*?)<\/strike>/gi, '~~$1~~');
  markdown = markdown.replace(/<s>([\s\S]*?)<\/s>/gi, '~~$1~~');
  // Keep underline as HTML tag
  
  // Convert paragraphs and breaks
  markdown = markdown.replace(/<\/p><p>/gi, '\n\n');
  markdown = markdown.replace(/<p>/gi, '');
  markdown = markdown.replace(/<\/p>/gi, '\n');
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/&nbsp;/g, ' ');
  
  // Remove multiple consecutive newlines (more than 2)
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  markdown = markdown.trim();
  
  return markdown;
}

export function WysiwygEditor({ value, onChange, placeholder = "Escreva seu conteúdo aqui...", minHeight = 200 }: WysiwygEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [urlInput, setUrlInput] = useState('');
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const { toast } = useToast();

  // Handle click on images to select them for resizing
  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.classList.contains('editor-image')) {
      // Select this image
      setSelectedImage(target as HTMLImageElement);
      // Add selected class
      editorRef.current?.querySelectorAll('.editor-image').forEach(img => {
        img.classList.remove('editor-image-selected');
      });
      target.classList.add('editor-image-selected');
    } else {
      // Deselect
      setSelectedImage(null);
      editorRef.current?.querySelectorAll('.editor-image').forEach(img => {
        img.classList.remove('editor-image-selected');
      });
    }
  }, []);

  // Get current image size percentage
  const getImageSizePercent = (img: HTMLImageElement): number => {
    const style = img.style.width;
    if (style && style.endsWith('%')) {
      return parseInt(style, 10);
    }
    return 100; // Default full width
  };

  // Set image size
  const setImageSize = (percent: number) => {
    if (!selectedImage) return;
    selectedImage.style.width = `${percent}%`;
    selectedImage.style.height = 'auto';
    handleInput();
  };

  // Increase image size
  const increaseImageSize = () => {
    if (!selectedImage) return;
    const current = getImageSizePercent(selectedImage);
    const nextSize = IMAGE_SIZES.find(s => s > current) || 100;
    setImageSize(nextSize);
  };

  // Decrease image size
  const decreaseImageSize = () => {
    if (!selectedImage) return;
    const current = getImageSizePercent(selectedImage);
    const prevSize = [...IMAGE_SIZES].reverse().find(s => s < current) || 25;
    setImageSize(prevSize);
  };

  // Reset image size
  const resetImageSize = () => {
    if (!selectedImage) return;
    selectedImage.style.width = '';
    selectedImage.style.height = '';
    handleInput();
  };

  // Delete selected image
  const deleteSelectedImage = () => {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
    handleInput();
  };

  // Save cursor position before opening dialogs
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  // Restore cursor position after dialog closes
  const restoreSelection = useCallback(() => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  }, []);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value) {
      const html = markdownToHtml(value);
      if (editorRef.current.innerHTML !== html) {
        editorRef.current.innerHTML = html;
      }
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    }
  }, [onChange]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatUnderline = () => execCommand('underline');
  const formatStrikethrough = () => execCommand('strikeThrough');

  const formatHeading1 = () => {
    execCommand('formatBlock', 'h1');
  };

  const formatHeading2 = () => {
    execCommand('formatBlock', 'h2');
  };

  const insertEmoji = (emoji: string) => {
    execCommand('insertText', emoji);
    setEmojiOpen(false);
  };

  const openLinkDialog = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setLinkText(selection.toString());
    } else {
      setLinkText('');
    }
    setLinkUrl('');
    setLinkDialogOpen(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) {
      toast({ title: 'URL obrigatória', description: 'Digite a URL do link', variant: 'destructive' });
      return;
    }
    
    if (linkText) {
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
    } else {
      execCommand('createLink', linkUrl);
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const uploadFile = async (
    file: File,
    options?: { preserveOriginalName?: boolean }
  ): Promise<string | null> => {
    if (file.size > 16 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 16MB', variant: 'destructive' });
      return null;
    }

    setUploading(true);
    try {
      const preserveOriginalName = !!options?.preserveOriginalName;

      const fileExt = file.name.split('.').pop();
      const fileName = preserveOriginalName
        ? file.name
        : `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      toast({
        title: 'Upload concluído',
        description: `Arquivo salvo como: ${fileName}`
      });
      
      return publicUrl;
    } catch (error: any) {
      // If user asked to preserve name, collisions are expected.
      const msg = String(error?.message || 'Erro no upload');
      const alreadyExists = /already exists|existente|exists/i.test(msg);
      if (options?.preserveOriginalName && alreadyExists) {
        toast({
          title: 'Esse nome já existe',
          description: 'Renomeie o arquivo no seu computador e tente novamente (Upload mantém o nome original).',
          variant: 'destructive'
        });
      } else {
        toast({ title: 'Erro no upload', description: msg, variant: 'destructive' });
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const insertMedia = (url: string, type: 'image' | 'video') => {
    // Close dialog first
    setMediaDialogOpen(false);
    setUrlInput('');
    setVideoEmbedUrl('');
    
    // Small delay to ensure dialog closes and focus is restored
    setTimeout(() => {
      // Try to restore saved cursor position
      if (savedSelectionRef.current && editorRef.current) {
        editorRef.current.focus();
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedSelectionRef.current);
        }
      } else if (editorRef.current) {
        // If no saved selection, place cursor at end
        editorRef.current.focus();
        const selection = window.getSelection();
        if (selection) {
          selection.selectAllChildren(editorRef.current);
          selection.collapseToEnd();
        }
      }
      
      // Now insert the content
      if (type === 'image') {
        document.execCommand('insertHTML', false, `<img src="${url}" alt="imagem" class="editor-image" />`);
      } else {
        document.execCommand('insertHTML', false, `<div class="editor-video" data-src="${url}">[Vídeo: ${url.includes('youtube') ? 'YouTube' : 'Vídeo'}]</div>`);
      }
      
      // Trigger input event to update state
      handleInput();
    }, 100);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload via seletor: manter o nome original no link
    const url = await uploadFile(file, { preserveOriginalName: true });
    if (url) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      insertMedia(url, type);
    }
    e.target.value = '';
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          // Colar (Ctrl+V): manter a renomeação automática
          const url = await uploadFile(file, { preserveOriginalName: false });
          if (url) {
            insertMedia(url, 'image');
          }
        }
        return;
      }
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    const file = files[0];
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      // Arrastar e soltar: manter o nome original no link
      const url = await uploadFile(file, { preserveOriginalName: true });
      if (url) {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        insertMedia(url, type);
      }
    }
  }, []);

  const parseYoutubeUrl = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  const parseVimeoUrl = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
    return null;
  };

  const handleEmbedUrl = () => {
    if (!videoEmbedUrl.trim()) return;
    
    let embedUrl = parseYoutubeUrl(videoEmbedUrl) || parseVimeoUrl(videoEmbedUrl);
    if (embedUrl) {
      insertMedia(embedUrl, 'video');
    } else {
      toast({ title: 'URL inválida', description: 'Use um link do YouTube ou Vimeo', variant: 'destructive' });
    }
  };

  const handleUrlInsert = () => {
    if (!urlInput.trim()) return;
    insertMedia(urlInput, mediaType);
  };

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-secondary/30 rounded-t-lg border border-b-0">
        <Button type="button" variant="ghost" size="sm" onClick={formatBold} title="Negrito">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={formatItalic} title="Itálico">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={formatUnderline} title="Sublinhado">
          <Underline className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={formatStrikethrough} title="Riscado">
          <Strikethrough className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1 self-center" />
        
        <Button type="button" variant="ghost" size="sm" onClick={formatHeading1} title="Título Grande">
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={formatHeading2} title="Subtítulo">
          <Heading2 className="h-4 w-4" />
        </Button>
        
        {/* Emoji picker */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" title="Inserir Emoji">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="grid grid-cols-6 gap-1">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="p-2 text-lg hover:bg-secondary rounded transition-colors"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Link button */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" onClick={openLinkDialog} title="Inserir Link">
              <Link2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Inserir Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Texto do Link</Label>
                <Input 
                  value={linkText} 
                  onChange={(e) => setLinkText(e.target.value)} 
                  placeholder="Texto que aparecerá no link" 
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input 
                  value={linkUrl} 
                  onChange={(e) => setLinkUrl(e.target.value)} 
                  placeholder="https://..." 
                />
              </div>
              <Button onClick={insertLink} className="w-full">
                Inserir Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="w-px h-6 bg-border mx-1 self-center" />

        {/* Media buttons */}
        <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" onClick={() => { saveSelection(); setMediaType('image'); }}>
              <Image className="h-4 w-4 mr-1" />
              Imagem
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" onClick={() => { saveSelection(); setMediaType('video'); }}>
              <Video className="h-4 w-4 mr-1" />
              Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {mediaType === 'image' ? 'Adicionar Imagem' : 'Adicionar Vídeo'}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url">
                  <Link className="h-4 w-4 mr-1" />
                  URL
                </TabsTrigger>
                {mediaType === 'video' && (
                  <TabsTrigger value="embed">
                    <Youtube className="h-4 w-4 mr-1" />
                    YouTube/Vimeo
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mediaType === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP4, WebM (máx 16MB)'}
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label>URL da {mediaType === 'image' ? 'imagem' : 'vídeo'}</Label>
                  <Input 
                    value={urlInput} 
                    onChange={(e) => setUrlInput(e.target.value)} 
                    placeholder="https://..." 
                  />
                </div>
                <Button onClick={handleUrlInsert} className="w-full">
                  Inserir
                </Button>
              </TabsContent>
              
              {mediaType === 'video' && (
                <TabsContent value="embed" className="space-y-4">
                  <div>
                    <Label>Link do YouTube ou Vimeo</Label>
                    <Input 
                      value={videoEmbedUrl} 
                      onChange={(e) => setVideoEmbedUrl(e.target.value)} 
                      placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..." 
                    />
                  </div>
                  <Button onClick={handleEmbedUrl} className="w-full">
                    Inserir Vídeo
                  </Button>
                </TabsContent>
              )}
            </Tabs>
          </DialogContent>
        </Dialog>

        <span className="text-xs text-muted-foreground self-center ml-auto">
          💡 Cole imagem com Ctrl+V
        </span>
      </div>

      {/* Image resize toolbar - shows when image is selected */}
      {selectedImage && (
        <div className="flex items-center gap-1 p-2 bg-primary/10 border border-primary/30 rounded-lg mb-2">
          <span className="text-xs font-medium text-primary mr-2">📷 Imagem selecionada:</span>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={decreaseImageSize}
            title="Diminuir tamanho"
            className="h-7 px-2"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          {IMAGE_SIZES.map(size => (
            <Button
              key={size}
              type="button"
              variant={getImageSizePercent(selectedImage) === size ? "default" : "outline"}
              size="sm"
              onClick={() => setImageSize(size)}
              className="h-7 px-2 text-xs"
            >
              {size}%
            </Button>
          ))}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={increaseImageSize}
            title="Aumentar tamanho"
            className="h-7 px-2"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={resetImageSize}
            title="Tamanho original"
            className="h-7 px-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button 
            type="button" 
            variant="destructive" 
            size="sm" 
            onClick={deleteSelectedImage}
            title="Remover imagem"
            className="h-7 px-2"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Editor Area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          className="w-full rounded-b-lg border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-auto prose prose-sm max-w-none"
          style={{ minHeight: `${minHeight}px` }}
          onInput={handleInput}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleEditorClick}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-b-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Enviando arquivo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Styles for the editor */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
        [contenteditable] p,
        [contenteditable] .editor-paragraph {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        [contenteditable] .editor-spacer {
          height: 1rem;
        }
        [contenteditable] .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
          cursor: pointer;
          transition: outline 0.15s ease;
        }
        [contenteditable] .editor-image:hover {
          outline: 2px solid hsl(var(--primary) / 0.3);
          outline-offset: 2px;
        }
        [contenteditable] .editor-image-selected {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        [contenteditable] .editor-video {
          background: hsl(var(--secondary));
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          margin: 0.5rem 0;
          color: hsl(var(--muted-foreground));
        }
        [contenteditable] h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem;
        }
        [contenteditable] h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
        }
        [contenteditable] a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
