import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Image, Video, Upload, Link, Loader2, X, Youtube, Bold, Heading1, Heading2, Smile, Link2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}

const COMMON_EMOJIS = [
  '😀', '😊', '🎉', '👏', '🚀', '✨', '💡', '🔥', '❤️', '👍',
  '📢', '📌', '✅', '⭐', '🏆', '💼', '📊', '🎯', '💪', '🤝',
  '📅', '📍', '🔗', '📧', '📞', '🏢', '👥', '🎓', '📰', '🗓️'
];

export function RichEditor({ value, onChange, placeholder = "Escreva seu conteúdo aqui...", minRows = 10 }: RichEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [urlInput, setUrlInput] = useState('');
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const insertAtCursor = (text: string, wrapStart = '', wrapEnd = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText: string;
    if (wrapStart && wrapEnd) {
      // Wrap selected text
      newText = value.substring(0, start) + wrapStart + selectedText + wrapEnd + value.substring(end);
    } else {
      // Just insert
      newText = value.substring(0, start) + text + value.substring(end);
    }
    
    onChange(newText);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = wrapStart ? start + wrapStart.length + selectedText.length + wrapEnd.length : start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const formatBold = () => {
    insertAtCursor('', '**', '**');
  };

  const formatHeading1 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const beforeLine = value.substring(0, lineStart);
    const afterLineStart = value.substring(lineStart);
    
    // Add heading prefix
    const newValue = beforeLine + '# ' + afterLineStart;
    onChange(newValue);
  };

  const formatHeading2 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const beforeLine = value.substring(0, lineStart);
    const afterLineStart = value.substring(lineStart);
    
    const newValue = beforeLine + '## ' + afterLineStart;
    onChange(newValue);
  };

  const insertEmoji = (emoji: string) => {
    insertAtCursor(emoji);
    setEmojiOpen(false);
  };

  const openLinkDialog = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      setLinkText(selectedText);
    }
    setLinkUrl('');
    setLinkDialogOpen(true);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) {
      toast({ title: 'URL obrigatória', description: 'Digite a URL do link', variant: 'destructive' });
      return;
    }
    
    const text = linkText.trim() || linkUrl;
    insertAtCursor(`[${text}](${linkUrl})`);
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
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value;

    let mediaTag = '';
    if (type === 'image') {
      mediaTag = `\n![imagem](${url})\n`;
    } else {
      mediaTag = `\n[video](${url})\n`;
    }

    const newValue = text.substring(0, start) + mediaTag + text.substring(end);
    onChange(newValue);
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
      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const url = await uploadFile(file);
          if (url) {
            const type = file.type.startsWith('video/') ? 'video' : 'image';
            insertMedia(url, type);
          }
        }
        return;
      }
    }
  }, [value, uploadFile]);

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
  }, [value, uploadFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-2 bg-secondary/30 rounded-t-lg border border-b-0">
        {/* Formatting buttons */}
        <Button type="button" variant="ghost" size="sm" onClick={formatBold} title="Negrito (selecione o texto)">
          <Bold className="h-4 w-4" />
        </Button>
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
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors outline-none"
                  onClick={() => fileInputRef.current?.click()}
                  onPaste={async (e) => {
                    const items = e.clipboardData?.items;
                    if (!items) return;
                    for (const item of items) {
                      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
                        e.preventDefault();
                        const file = item.getAsFile();
                        if (file) {
                          const url = await uploadFile(file);
                          if (url) {
                            const type = file.type.startsWith('video/') ? 'video' : 'image';
                            insertMedia(url, type);
                          }
                        }
                        return;
                      }
                    }
                  }}
                  onDrop={async (e) => {
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
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  tabIndex={0}
                  role="button"
                  aria-label="Área de upload - clique, arraste ou cole com Ctrl+V"
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique, arraste ou cole com <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Ctrl+V</kbd>
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
          💡 Cole imagem com Ctrl+V ou arraste arquivos
        </span>
      </div>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          placeholder={placeholder}
          rows={minRows}
          className="rounded-t-none min-h-[200px] font-mono text-sm"
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

      {/* Preview das mídias inseridas */}
      <ContentPreview content={value} />
    </div>
  );
}

function ContentPreview({ content }: { content: string }) {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const videoRegex = /\[video\]\((.*?)\)/g;
  
  const images: string[] = [];
  const videos: string[] = [];
  
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  while ((match = videoRegex.exec(content)) !== null) {
    videos.push(match[1]);
  }

  if (images.length === 0 && videos.length === 0) return null;

  return (
    <div className="space-y-2 p-3 bg-secondary/20 rounded-lg">
      <p className="text-xs font-medium text-muted-foreground">Mídia no conteúdo:</p>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={`img-${i}`} className="relative group">
            <img src={url} alt="" className="h-16 w-16 object-cover rounded" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
              <Image className="h-4 w-4 text-white" />
            </div>
          </div>
        ))}
        {videos.map((url, i) => (
          <div key={`vid-${i}`} className="relative h-16 w-24 bg-secondary rounded flex items-center justify-center">
            <Video className="h-6 w-6 text-muted-foreground" />
            <span className="absolute bottom-1 text-[10px] text-muted-foreground">
              {url.includes('youtube') ? 'YouTube' : url.includes('vimeo') ? 'Vimeo' : 'Vídeo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
