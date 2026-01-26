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
  Smile, Link2, Italic, Underline, Strikethrough 
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const COMMON_EMOJIS = [
  '😀', '😊', '🎉', '👏', '🚀', '✨', '💡', '🔥', '❤️', '👍',
  '📢', '📌', '✅', '⭐', '🏆', '💼', '📊', '🎯', '💪', '🤝',
  '📅', '📍', '🔗', '📧', '📞', '🏢', '👥', '🎓', '📰', '🗓️'
];

// Convert markdown to HTML for display
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Convert headings
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  
  // Convert images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="editor-image" />');
  
  // Convert videos
  html = html.replace(/\[video\]\(([^)]+)\)/g, '<div class="editor-video" data-src="$1">[Vídeo]</div>');
  
  // Convert links
  html = html.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Convert bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic *text*
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Convert strikethrough ~~text~~
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  
  // Convert underline <u>text</u> (keep as is)
  
  // Convert line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br/>');
  
  // Wrap in paragraphs if not already wrapped
  if (!html.startsWith('<h1>') && !html.startsWith('<h2>') && !html.startsWith('<p>')) {
    html = `<p>${html}</p>`;
  }
  
  return html;
}

// Convert HTML back to markdown for storage
function htmlToMarkdown(html: string): string {
  if (!html) return '';
  
  let markdown = html;
  
  // Remove contenteditable artifacts
  markdown = markdown.replace(/<div><br><\/div>/gi, '\n');
  markdown = markdown.replace(/<div>/gi, '\n');
  markdown = markdown.replace(/<\/div>/gi, '');
  
  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '## $1\n');
  
  // Convert images
  markdown = markdown.replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/gi, '![$1]($2)');
  
  // Convert videos
  markdown = markdown.replace(/<div[^>]*class="editor-video"[^>]*data-src="([^"]+)"[^>]*>[^<]*<\/div>/gi, '[video]($1)');
  
  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
  
  // Convert formatting
  markdown = markdown.replace(/<strong>([^<]+)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b>([^<]+)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em>([^<]+)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i>([^<]+)<\/i>/gi, '*$1*');
  markdown = markdown.replace(/<del>([^<]+)<\/del>/gi, '~~$1~~');
  markdown = markdown.replace(/<strike>([^<]+)<\/strike>/gi, '~~$1~~');
  markdown = markdown.replace(/<s>([^<]+)<\/s>/gi, '~~$1~~');
  // Keep underline as HTML tag
  
  // Convert paragraphs and breaks
  markdown = markdown.replace(/<\/p><p>/gi, '\n\n');
  markdown = markdown.replace(/<p>/gi, '');
  markdown = markdown.replace(/<\/p>/gi, '');
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/&nbsp;/g, ' ');
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
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > 16 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 16MB', variant: 'destructive' });
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const insertMedia = (url: string, type: 'image' | 'video') => {
    if (type === 'image') {
      execCommand('insertHTML', `<img src="${url}" alt="imagem" class="editor-image" />`);
    } else {
      execCommand('insertHTML', `<div class="editor-video" data-src="${url}">[Vídeo: ${url.includes('youtube') ? 'YouTube' : 'Vídeo'}]</div>`);
    }
    setMediaDialogOpen(false);
    setUrlInput('');
    setVideoEmbedUrl('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file);
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
          const url = await uploadFile(file);
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
      const url = await uploadFile(file);
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
            <Button type="button" variant="ghost" size="sm" onClick={() => setMediaType('image')}>
              <Image className="h-4 w-4 mr-1" />
              Imagem
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMediaType('video')}>
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
        [contenteditable] .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
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
