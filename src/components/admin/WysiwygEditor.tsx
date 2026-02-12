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
  Smile, Link2, Italic, Underline, Strikethrough, ZoomIn, ZoomOut, RotateCcw, Trash2,
  ArrowUp, ArrowDown, GripVertical
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
        // NOTE: Make images non-editable and draggable to avoid caret/text inside image blocks.
        return `<img src="${src}" alt="${alt}" class="editor-image" draggable="true" contenteditable="false"${style} />`;
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
  
  // CRITICAL: Strip ALL inline styles first - this prevents raw HTML from appearing on public pages
  // Remove style attributes entirely from all tags
  markdown = markdown.replace(/\s+style="[^"]*"/gi, '');
  markdown = markdown.replace(/\s+style='[^']*'/gi, '');
  
  // Remove class attributes that aren't our editor classes
  markdown = markdown.replace(/\s+class="(?!editor-)[^"]*"/gi, '');
  markdown = markdown.replace(/\s+class='(?!editor-)[^']*'/gi, '');
  
  // Remove other common attributes that shouldn't be in content
  markdown = markdown.replace(/\s+data-[a-z-]+="[^"]*"/gi, '');
  markdown = markdown.replace(/\s+id="[^"]*"/gi, '');
  markdown = markdown.replace(/\s+lang="[^"]*"/gi, '');
  markdown = markdown.replace(/\s+dir="[^"]*"/gi, '');
  
  // Remove font tags entirely (keep content)
  markdown = markdown.replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, '$1');
  
  // Remove span tags with any attributes (keep content) - these often have inline styles
  markdown = markdown.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  
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
  markdown = markdown.replace(/<div[^>]*>/gi, '\n');
  markdown = markdown.replace(/<\/div>/gi, '');
  
  // Convert headings (allow multiline content with [\s\S])
  markdown = markdown.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n');
  
  // Convert images - extract width style if present
  // Use a more robust approach: capture the whole img tag and parse attributes
  markdown = markdown.replace(/<img[^>]*\/?>/gi, (imgTag) => {
    // Extract src
    const srcMatch = imgTag.match(/src="([^"]+)"/i);
    const src = srcMatch ? srcMatch[1] : '';
    
    // Extract alt
    const altMatch = imgTag.match(/alt="([^"]*)"/i);
    const alt = altMatch ? altMatch[1] : 'imagem';
    
    // Extract width from style (may have been stripped, but check anyway)
    const widthMatch = imgTag.match(/width:\s*(\d+)%/i) || imgTag.match(/width="(\d+)%"/i);
    const width = widthMatch ? widthMatch[1] : null;
    
    if (!src) return ''; // Invalid image, remove

    // Force images to be stored as their own block line(s) so public/admin never wraps text over them.
    const token = width ? `![${alt}](${src}){width=${width}%}` : `![${alt}](${src})`;
    return `\n\n${token}\n\n`;
  });
  
  // Convert videos
  markdown = markdown.replace(/<div[^>]*class="editor-video"[^>]*data-src="([^"]+)"[^>]*>[\s\S]*?<\/div>/gi, '[video]($1)');
  
  // Convert links (allow multiline content)
  markdown = markdown.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Convert formatting WITH attributes first (e.g., <strong style="...">)
  markdown = markdown.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  markdown = markdown.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~');
  markdown = markdown.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, '~~$1~~');
  markdown = markdown.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '~~$1~~');
  markdown = markdown.replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '<u>$1</u>');
  
  // Convert paragraphs with any attributes and breaks
  markdown = markdown.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
  markdown = markdown.replace(/<p[^>]*>/gi, '');
  markdown = markdown.replace(/<\/p>/gi, '\n');
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove any remaining HTML tags that weren't handled (safety net)
  // This catches orphaned tags like <font>, <span>, etc.
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&amp;/g, '&');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&quot;/g, '"');
  
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
  const [draggingImage, setDraggingImage] = useState<HTMLImageElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const { toast } = useToast();

  const createEmptyParagraph = useCallback(() => {
    const p = document.createElement('p');
    p.className = 'editor-paragraph';
    p.appendChild(document.createElement('br'));
    return p;
  }, []);

  const setCaretToStart = useCallback((el: HTMLElement) => {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const hasMeaningfulContent = useCallback((nodes: ChildNode[]) => {
    return nodes.some((n) => {
      if (n.nodeType === Node.TEXT_NODE) return !!n.textContent?.trim();
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as HTMLElement;
        if (el.tagName === 'BR') return false;
        if (el.tagName === 'IMG') return false;
        if (el.classList.contains('editor-video')) return true;
        // Any other element counts if it has real content.
        return !!el.textContent?.trim() || !!el.querySelector('img, .editor-video');
      }
      return false;
    });
  }, []);

  // Hard guarantee: images are always isolated in their own paragraph, never mixed with text.
  const normalizeImageBlocks = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;

    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    for (const img of imgs) {
      img.classList.add('editor-image');
      img.setAttribute('draggable', 'true');
      img.setAttribute('contenteditable', 'false');

      let p = img.closest('p') as HTMLParagraphElement | null;
      if (!p) {
        const wrapper = document.createElement('p');
        wrapper.className = 'editor-paragraph';
        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        p = wrapper;
      } else {
        p.classList.add('editor-paragraph');
      }

      const children = Array.from(p.childNodes);
      const imgIndex = children.indexOf(img);
      if (imgIndex < 0) continue;

      const before = children.slice(0, imgIndex);
      const after = children.slice(imgIndex + 1);
      const beforeMeaningful = hasMeaningfulContent(before);
      const afterMeaningful = hasMeaningfulContent(after);
      if (!beforeMeaningful && !afterMeaningful) {
        // Ensure there's always a paragraph after an image block for continued typing.
        const nextEl = p.nextElementSibling as HTMLElement | null;
        if (!nextEl || nextEl.tagName !== 'P') {
          p.parentNode?.insertBefore(createEmptyParagraph(), p.nextSibling);
        }
        continue;
      }

      // Create an isolated paragraph for the image.
      const imageP = document.createElement('p');
      imageP.className = 'editor-paragraph';
      imageP.appendChild(img); // moves img out of current paragraph

      const parent = p.parentNode;
      if (!parent) continue;

      // Move the after-nodes into a new paragraph (if needed)
      let afterP: HTMLParagraphElement | null = null;
      if (afterMeaningful) {
        afterP = document.createElement('p');
        afterP.className = 'editor-paragraph';
        for (const node of after) afterP.appendChild(node);
        if (!afterP.textContent?.trim() && !afterP.querySelector('img, .editor-video')) {
          afterP.appendChild(document.createElement('br'));
        }
      }

      // Place image block: between before and after content.
      if (beforeMeaningful) {
        parent.insertBefore(imageP, p.nextSibling);
      } else {
        parent.insertBefore(imageP, p);
      }

      if (afterP) {
        parent.insertBefore(afterP, imageP.nextSibling);
      }

      // Clean up empty original paragraph.
      if (!p.textContent?.trim() && !p.querySelector('img, .editor-video')) {
        p.remove();
      }

      // Ensure there's always a paragraph after the image.
      const nextEl = imageP.nextElementSibling as HTMLElement | null;
      if (!nextEl || nextEl.tagName !== 'P') {
        parent.insertBefore(createEmptyParagraph(), imageP.nextSibling);
      }
    }
  }, [createEmptyParagraph, hasMeaningfulContent]);

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

  // Move image up (before previous paragraph)
  const moveImageUp = (img: HTMLImageElement) => {
    const container = img.parentElement;
    if (!container) return;
    
    // Find previous sibling element
    const prevSibling = container.previousElementSibling;
    if (prevSibling && editorRef.current) {
      container.parentNode?.insertBefore(container, prevSibling);
      handleInput();
      toast({ title: 'Imagem movida para cima' });
    }
  };

  // Move image down (after next paragraph)
  const moveImageDown = (img: HTMLImageElement) => {
    const container = img.parentElement;
    if (!container) return;
    
    // Find next sibling element
    const nextSibling = container.nextElementSibling;
    if (nextSibling && editorRef.current) {
      container.parentNode?.insertBefore(nextSibling, container);
      handleInput();
      toast({ title: 'Imagem movida para baixo' });
    }
  };

  // Handle input change - moved up so drag handlers can use it
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      normalizeImageBlocks();
      const html = editorRef.current.innerHTML;
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    }
  }, [normalizeImageBlocks, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') return;
    const root = editorRef.current;
    if (!root) return;

    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    let node: Node | null = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    if (!(node instanceof HTMLElement)) return;

    const p = node.closest('p.editor-paragraph') as HTMLParagraphElement | null;
    if (!p) return;

    const hasImg = !!p.querySelector('img.editor-image');
    if (!hasImg) return;

    // If paragraph is effectively an image block, Enter should create a new paragraph below (never inside the image block).
    const meaningful = hasMeaningfulContent(Array.from(p.childNodes).filter((n) => {
      if (n.nodeType === Node.TEXT_NODE) return !!n.textContent?.trim();
      if (n.nodeType === Node.ELEMENT_NODE) {
        const el = n as HTMLElement;
        if (el.tagName === 'IMG') return false;
        if (el.tagName === 'BR') return false;
        return !!el.textContent?.trim() || !!el.querySelector('img, .editor-video');
      }
      return false;
    }));

    if (!meaningful) {
      e.preventDefault();
      const empty = createEmptyParagraph();
      p.parentNode?.insertBefore(empty, p.nextSibling);
      setCaretToStart(empty);
      handleInput();
    }
  }, [createEmptyParagraph, handleInput, hasMeaningfulContent, setCaretToStart]);

  // Handle drag start for image repositioning
  const handleImageDragStart = useCallback((e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.classList.contains('editor-image')) {
      e.stopPropagation();
      setDraggingImage(target as HTMLImageElement);
      target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'image-reorder');
    }
  }, []);

  // Handle drag end for image repositioning
  const handleImageDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      target.classList.remove('dragging');
    }
    setDraggingImage(null);
    // Remove all drop target indicators
    editorRef.current?.querySelectorAll('.editor-image-drop-target').forEach(el => {
      el.classList.remove('editor-image-drop-target');
    });
  }, []);

  // Handle drag over for showing drop indicator
  const handleEditorDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    // If we're dragging an internal image for repositioning
    if (draggingImage) {
      e.dataTransfer.dropEffect = 'move';
      
      // Find the closest paragraph or block element to show drop indicator
      const target = e.target as HTMLElement;
      const editorEl = editorRef.current;
      if (!editorEl) return;
      
      // Remove previous indicators
      editorEl.querySelectorAll('.editor-image-drop-target').forEach(el => {
        el.classList.remove('editor-image-drop-target');
      });
      
      // Find the block element we're hovering over
      let blockEl: HTMLElement | null = target;
      while (blockEl && blockEl !== editorEl) {
        if (blockEl.tagName === 'P' || blockEl.classList.contains('editor-paragraph') || 
            blockEl.tagName === 'H1' || blockEl.tagName === 'H2' ||
            blockEl.classList.contains('editor-spacer')) {
          blockEl.classList.add('editor-image-drop-target');
          break;
        }
        blockEl = blockEl.parentElement;
      }
    }
  }, [draggingImage]);

  // Handle drop for image repositioning or new file upload
  const handleEditorDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    
    // Remove drop indicators
    editorRef.current?.querySelectorAll('.editor-image-drop-target').forEach(el => {
      el.classList.remove('editor-image-drop-target');
    });
    
    // If we're repositioning an existing image
    if (draggingImage && e.dataTransfer.getData('text/plain') === 'image-reorder') {
      const target = e.target as HTMLElement;
      const editorEl = editorRef.current;
      if (!editorEl) return;
      
      // Find the block element we're dropping on
      let dropTarget: HTMLElement | null = target;
      while (dropTarget && dropTarget !== editorEl) {
        if (dropTarget.tagName === 'P' || dropTarget.classList.contains('editor-paragraph') || 
            dropTarget.tagName === 'H1' || dropTarget.tagName === 'H2' ||
            dropTarget.classList.contains('editor-spacer')) {
          break;
        }
        dropTarget = dropTarget.parentElement;
      }
      
      if (dropTarget && dropTarget !== editorEl) {
        // Get the image's parent container (usually a <p>)
        const imageContainer = draggingImage.parentElement;
        
        // Insert the image (wrapped in its own paragraph) before the drop target
        const newParagraph = document.createElement('p');
        newParagraph.className = 'editor-paragraph';
        newParagraph.appendChild(draggingImage.cloneNode(true));
        
        dropTarget.parentNode?.insertBefore(newParagraph, dropTarget);
        
        // Remove the old image container if it's now empty or only has the image
        if (imageContainer) {
          // Remove original image
          draggingImage.remove();
          // If container is now empty, remove it too
          if (!imageContainer.textContent?.trim() && !imageContainer.querySelector('img, video, .editor-video')) {
            imageContainer.remove();
          }
        }
        
        handleInput();
        toast({
          title: 'Imagem reposicionada',
          description: 'A imagem foi movida para a nova posição'
        });
      }
      
      setDraggingImage(null);
      return;
    }
    
    // Otherwise, handle new file upload
    const files = e.dataTransfer?.files;
    if (!files?.length) return;

    const file = files[0];
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = await uploadFile(file, { preserveOriginalName: true });
      if (url) {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        insertMedia(url, type);
      }
    }
  }, [draggingImage, handleInput, toast]);

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
    saveSelection();
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
    
    restoreSelection();
    
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

      const isAlreadyExistsError = (err: any) => {
        const msg = String(err?.message || '');
        const status = (err?.statusCode ?? err?.status) as number | undefined;
        return status === 409 || /already exists|existente|exists/i.test(msg);
      };

      const attemptUpload = async (upsert: boolean) => {
        return await supabase.storage
          .from('media')
          .upload(filePath, file, {
            upsert,
            cacheControl: '3600',
          });
      };

      const { error: uploadError } = await attemptUpload(false);

      // Se já existir e estamos preservando o nome original, substitui automaticamente.
      if (uploadError) {
        if (preserveOriginalName && isAlreadyExistsError(uploadError)) {
          const { error: overwriteError } = await attemptUpload(true);
          if (overwriteError) throw overwriteError;
          toast({
            title: 'Arquivo substituído',
            description: `O arquivo existente foi atualizado: ${fileName}`,
          });
        } else {
          throw uploadError;
        }
      } else {
        toast({
          title: 'Upload concluído',
          description: `Arquivo salvo como: ${fileName}`
        });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      const msg = String(error?.message || 'Erro no upload');
      toast({ title: 'Erro no upload', description: msg, variant: 'destructive' });
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
      if (!editorRef.current) return;

      // Restore cursor to where the user was when opening the dialog.
      restoreSelection();
      editorRef.current.focus();

      const root = editorRef.current;
      const selection = window.getSelection();

      const createImageParagraph = () => {
        const p = document.createElement('p');
        p.className = 'editor-paragraph';
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'imagem';
        img.className = 'editor-image';
        img.setAttribute('draggable', 'true');
        img.setAttribute('contenteditable', 'false');
        p.appendChild(img);
        return p;
      };

      const createVideoParagraph = () => {
        const p = document.createElement('p');
        p.className = 'editor-paragraph';
        const div = document.createElement('div');
        div.className = 'editor-video';
        div.setAttribute('data-src', url);
        div.setAttribute('contenteditable', 'false');
        div.textContent = `[Vídeo: ${url.includes('youtube') ? 'YouTube' : 'Vídeo'}]`;
        p.appendChild(div);
        return p;
      };

      const block = type === 'image' ? createImageParagraph() : createVideoParagraph();

      // Default: append at end.
      let insertAfterEl: HTMLElement | null = null;
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        let n: Node | null = range.startContainer;
        if (n.nodeType === Node.TEXT_NODE) n = n.parentNode;
        if (n instanceof HTMLElement) {
          insertAfterEl = (n.closest('p.editor-paragraph, h1, h2, .editor-spacer') as HTMLElement | null);
        }

        // If we're inside a paragraph, split it at cursor so text-after goes below the inserted block.
        if (insertAfterEl?.tagName === 'P' && insertAfterEl.classList.contains('editor-paragraph') && selection.rangeCount) {
          const p = insertAfterEl as HTMLParagraphElement;
          if (p.contains(range.startContainer)) {
            const afterRange = range.cloneRange();
            afterRange.setEnd(p, p.childNodes.length);
            const afterFrag = afterRange.extractContents();
            const hasAfter = hasMeaningfulContent(Array.from(afterFrag.childNodes));
            if (hasAfter) {
              const afterP = document.createElement('p');
              afterP.className = 'editor-paragraph';
              afterP.appendChild(afterFrag);
              p.parentNode?.insertBefore(afterP, p.nextSibling);
              // Insert the media block between before and after.
              p.parentNode?.insertBefore(block, afterP);
              setCaretToStart(afterP);
              handleInput();
              return;
            }
          }
        }
      }

      if (insertAfterEl && insertAfterEl.parentNode) {
        insertAfterEl.parentNode.insertBefore(block, insertAfterEl.nextSibling);
      } else {
        root.appendChild(block);
      }

      // Ensure there's always a paragraph below to continue typing.
      const empty = createEmptyParagraph();
      block.parentNode?.insertBefore(empty, block.nextSibling);
      setCaretToStart(empty);
      
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
        <div className="flex flex-wrap items-center gap-1 p-2 bg-primary/10 border border-primary/30 rounded-lg mb-2">
          <span className="text-xs font-medium text-primary mr-2 flex items-center gap-1">
            <GripVertical className="h-3 w-3" />
            Imagem selecionada:
          </span>
          
          {/* Move buttons */}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => moveImageUp(selectedImage)}
            title="Mover para cima"
            className="h-7 px-2"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => moveImageDown(selectedImage)}
            title="Mover para baixo"
            className="h-7 px-2"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          
          <div className="w-px h-5 bg-border mx-1" />
          
          {/* Size buttons */}
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
          
          <span className="text-[10px] text-muted-foreground ml-auto hidden sm:inline">
            💡 Arraste a imagem para reposicionar
          </span>
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
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onDrop={handleEditorDrop}
          onDragOver={handleEditorDragOver}
          onDragStart={handleImageDragStart}
          onDragEnd={handleImageDragEnd}
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
        /* CRITICAL: Images always as block elements, never inline with text */
        [contenteditable] .editor-image {
          display: block !important;
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem auto;
          cursor: grab;
          transition: outline 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }
        [contenteditable] .editor-image:active {
          cursor: grabbing;
        }
        [contenteditable] .editor-image:hover {
          outline: 2px solid hsl(var(--primary) / 0.3);
          outline-offset: 2px;
        }
        [contenteditable] .editor-image-selected {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        [contenteditable] .editor-image.dragging {
          opacity: 0.5;
          transform: scale(0.98);
        }
        [contenteditable] .editor-image-drop-target {
          border-top: 3px solid hsl(var(--primary));
          padding-top: 0.5rem;
        }
        [contenteditable] .editor-video {
          display: block;
          background: hsl(var(--secondary));
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
          margin: 1rem auto;
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
