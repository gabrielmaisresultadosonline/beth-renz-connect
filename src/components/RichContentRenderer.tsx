import { useMemo } from 'react';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

// Pre-process content to normalize formatting and clean up any raw HTML tags
function preprocessContent(content: string): string {
  let processed = content;
  
  // FIRST: Clean up any raw HTML tags that shouldn't be in the content
  // Remove editor-specific divs and convert to newlines
  processed = processed.replace(/<div[^>]*class="editor-spacer"[^>]*><\/div>/gi, '\n');
  processed = processed.replace(/<div[^>]*class='editor-spacer'[^>]*><\/div>/gi, '\n');
  
  // Remove editor-paragraph p tags and keep content with newlines
  processed = processed.replace(/<p[^>]*class="editor-paragraph"[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');
  processed = processed.replace(/<p[^>]*class='editor-paragraph'[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');
  
  // Clean generic divs
  processed = processed.replace(/<div[^>]*>/gi, '\n');
  processed = processed.replace(/<\/div>/gi, '');
  
  // Clean generic paragraphs
  processed = processed.replace(/<p[^>]*>/gi, '');
  processed = processed.replace(/<\/p>/gi, '\n');
  
  // Convert br tags to newlines
  processed = processed.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean span tags with inline styles (keep content)
  processed = processed.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  
  // IMPORTANT: Clean strong/em/b/i tags WITH attributes/styles first (convert to markdown)
  // This handles cases like <strong style="...">text</strong>
  processed = processed.replace(/<strong[^>]+>([\s\S]*?)<\/strong>/gi, '**$1**');
  processed = processed.replace(/<b[^>]+>([\s\S]*?)<\/b>/gi, '**$1**');
  processed = processed.replace(/<em[^>]+>([\s\S]*?)<\/em>/gi, '*$1*');
  processed = processed.replace(/<i[^>]+>([\s\S]*?)<\/i>/gi, '*$1*');
  processed = processed.replace(/<u[^>]+>([\s\S]*?)<\/u>/gi, '<u>$1</u>');
  
  // Clean up any whitespace/newlines inside HTML tags (without attributes)
  processed = processed.replace(/<(strong|em|b|i|u|del|s|strike)>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => {
    const cleanedInner = inner.trim();
    return `<${tag}>${cleanedInner}</${tag}>`;
  });
  
  // Convert nested HTML+markdown combos first
  processed = processed.replace(/<em>\*\*([\s\S]*?)\*\*<\/em>/gi, '*$1*');
  processed = processed.replace(/<i>\*\*([\s\S]*?)\*\*<\/i>/gi, '*$1*');
  processed = processed.replace(/<strong>\*([\s\S]*?)\*<\/strong>/gi, '**$1**');
  processed = processed.replace(/<b>\*([\s\S]*?)\*<\/b>/gi, '**$1**');
  
  // Convert standalone HTML tags to markdown (without attributes - simpler tags)
  processed = processed.replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**');
  processed = processed.replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**');
  processed = processed.replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*');
  processed = processed.replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*');
  processed = processed.replace(/<del>([\s\S]*?)<\/del>/gi, '~~$1~~');
  processed = processed.replace(/<s>([\s\S]*?)<\/s>/gi, '~~$1~~');
  processed = processed.replace(/<strike>([\s\S]*?)<\/strike>/gi, '~~$1~~');
  
  // Keep <u>text</u> as is but clean internal whitespace
  processed = processed.replace(/<u>([\s\S]*?)<\/u>/gi, (match, inner) => `<u>${inner.trim()}</u>`);
  
  // Convert anchor tags to markdown links
  processed = processed.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  
  // Clean up orphaned/broken tags including with attributes
  processed = processed.replace(/<(strong|em|b|i|del|s|strike)[^>]*>\s*$/gim, '');
  processed = processed.replace(/^\s*<\/(strong|em|b|i|del|s|strike)>/gim, '');
  
  // Remove incomplete/broken HTML tags that might appear as raw text
  // e.g., <strong style="..."> without closing
  processed = processed.replace(/<(strong|em|b|i|u|del|s|strike|span)[^>]*>(?![^<]*<\/\1>)/gi, '');
  
  // Remove any remaining empty formatting
  processed = processed.replace(/\*\*\s*\*\*/g, '');
  processed = processed.replace(/\*\s*\*/g, '');
  processed = processed.replace(/~~\s*~~/g, '');
  
  // Clean up multiple consecutive newlines
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  // Clean HTML entities
  processed = processed.replace(/&nbsp;/g, ' ');
  processed = processed.replace(/&amp;/g, '&');
  processed = processed.replace(/&lt;/g, '<');
  processed = processed.replace(/&gt;/g, '>');
  
  return processed;
}

export function RichContentRenderer({ content, className = '' }: RichContentRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) return [];

    // Pre-process to normalize HTML/markdown formatting
    const processedContent = preprocessContent(content);
    
    const lines = processedContent.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Empty line = extra vertical spacing
      if (!trimmedLine) {
        elements.push(<div key={key++} className="h-4" />);
        continue;
      }

      // Heading 1: # Title
      if (trimmedLine.startsWith('# ')) {
        elements.push(
          <h2 key={key++} className="text-2xl md:text-3xl font-display font-bold text-foreground mt-8 mb-4 first:mt-0">
            {processInlineFormatting(trimmedLine.slice(2))}
          </h2>
        );
        continue;
      }

      // Heading 2: ## Subtitle
      if (trimmedLine.startsWith('## ')) {
        elements.push(
          <h3 key={key++} className="text-xl md:text-2xl font-display font-semibold text-foreground mt-6 mb-3">
            {processInlineFormatting(trimmedLine.slice(3))}
          </h3>
        );
        continue;
      }

      // Image: ![alt](url) or ![alt](url){width=50%} - standalone on its own line
      const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{width=(\d+)%\})?$/);
      if (imageMatch) {
        const altText = imageMatch[1];
        const imageUrl = imageMatch[2];
        const widthPercent = imageMatch[3];
        const hasCaption = altText && altText.toLowerCase() !== 'imagem' && altText.toLowerCase() !== 'image';
        
        const imageStyle = widthPercent 
          ? { width: `${widthPercent}%`, maxWidth: '100%' }
          : {};
        
        elements.push(
          <figure key={key++} className="my-6">
            <img
              src={imageUrl}
              alt={altText || 'Imagem'}
              className={`mx-auto rounded-lg shadow-md ${!widthPercent ? 'w-full max-w-2xl' : ''}`}
              style={imageStyle}
              loading="lazy"
            />
            {hasCaption && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                {altText}
              </figcaption>
            )}
          </figure>
        );
        continue;
      }

      // Check if line contains an image mixed with text - separate them
      // Updated regex to support optional {width=X%}
      const inlineImageRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:\{width=(\d+)%\})?/g;
      const hasInlineImage = inlineImageRegex.test(trimmedLine);
      
      if (hasInlineImage) {
        // Reset regex
        inlineImageRegex.lastIndex = 0;
        
        // Split the line by images and render each part separately
        let lastIndex = 0;
        let match;
        
        while ((match = inlineImageRegex.exec(trimmedLine)) !== null) {
          // Text before the image
          const textBefore = trimmedLine.slice(lastIndex, match.index).trim();
          if (textBefore) {
            elements.push(
              <p key={key++} className="text-base md:text-lg leading-relaxed text-muted-foreground mb-3">
                {processInlineFormatting(textBefore)}
              </p>
            );
          }
          
          // The image itself - as a block element
          const altText = match[1];
          const imageUrl = match[2];
          const widthPercent = match[3];
          const hasCaption = altText && altText.toLowerCase() !== 'imagem' && altText.toLowerCase() !== 'image';
          
          const imageStyle = widthPercent 
            ? { width: `${widthPercent}%`, maxWidth: '100%' }
            : {};
          
          elements.push(
            <figure key={key++} className="my-6">
              <img
                src={imageUrl}
                alt={altText || 'Imagem'}
                className={`mx-auto rounded-lg shadow-md ${!widthPercent ? 'w-full max-w-2xl' : ''}`}
                style={imageStyle}
                loading="lazy"
              />
              {hasCaption && (
                <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                  {altText}
                </figcaption>
              )}
            </figure>
          );
          
          lastIndex = match.index + match[0].length;
        }
        
        // Text after the last image
        const textAfter = trimmedLine.slice(lastIndex).trim();
        if (textAfter) {
          elements.push(
            <p key={key++} className="text-base md:text-lg leading-relaxed text-muted-foreground mb-3">
              {processInlineFormatting(textAfter)}
            </p>
          );
        }
        continue;
      }

      // Video embed: [video](url)
      const videoMatch = trimmedLine.match(/^\[video\]\(([^)]+)\)$/);
      if (videoMatch) {
        const videoUrl = videoMatch[1];
        const isYoutube = videoUrl.includes('youtube.com/embed') || videoUrl.includes('youtu.be');
        const isVimeo = videoUrl.includes('vimeo.com');

        if (isYoutube || isVimeo) {
          elements.push(
            <div key={key++} className="my-6 aspect-video max-w-3xl mx-auto">
              <iframe
                src={videoUrl}
                className="w-full h-full rounded-lg shadow-md"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          );
        } else {
          elements.push(
            <div key={key++} className="my-6 max-w-3xl mx-auto">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg shadow-md"
              />
            </div>
          );
        }
        continue;
      }

      // Each line becomes its own paragraph - respects line breaks from editor
      elements.push(
        <p key={key++} className="text-base md:text-lg leading-relaxed text-muted-foreground mb-3">
          {processInlineFormatting(trimmedLine)}
        </p>
      );
    }

    return elements;
  }, [content]);

  return (
    <div className={`rich-content ${className}`}>
      {renderedContent}
    </div>
  );
}

// Process inline formatting with line breaks preserved as <br/>
function processInlineFormattingWithBreaks(text: string): React.ReactNode {
  const lines = text.split('\n');
  const parts: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    if (i > 0) {
      parts.push(<br key={`br-${key++}`} />);
    }
    parts.push(<span key={key++}>{processInlineFormatting(lines[i])}</span>);
  }

  return <>{parts}</>;
}

// Process inline formatting like **bold**, *italic*, and [links](url)
// Note: Images should be on their own line, not inline with text
function processInlineFormatting(text: string): React.ReactNode {
  return processLinksAndFormatting(text);
}

// Process links [text](url), [url], and plain URLs then text formatting
function processLinksAndFormatting(text: string): React.ReactNode {
  // First handle markdown links: [text](url) - but not images which start with !
  const markdownLinkRegex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  // Then handle bracketed URLs: [https://...]
  const bracketedUrlRegex = /\[(https?:\/\/[^\]]+)\]/g;
  // Finally handle plain URLs
  const plainUrlRegex = /(https?:\/\/[^\s<>\[\]"']+)/g;
  
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let key = 0;

  // First pass: handle markdown links [text](url)
  const markdownMatches = [...text.matchAll(markdownLinkRegex)];
  if (markdownMatches.length > 0) {
    for (const match of markdownMatches) {
      if (match.index! > lastIndex) {
        parts.push(
          <span key={key++}>
            {processUrlsAndFormatting(text.slice(lastIndex, match.index))}
          </span>
        );
      }
      parts.push(
        <a
          key={key++}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index! + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(
        <span key={key++}>
          {processUrlsAndFormatting(text.slice(lastIndex))}
        </span>
      );
    }
    return <>{parts}</>;
  }

  return processUrlsAndFormatting(text);
}

// Process bracketed URLs [url] and plain URLs
function processUrlsAndFormatting(text: string): React.ReactNode {
  // Combined regex for bracketed URLs [https://...] and plain URLs
  const urlRegex = /\[(https?:\/\/[^\]]+)\]|(https?:\/\/[^\s<>\[\]"'()]+)/g;
  
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let key = 0;

  const urlMatches = [...text.matchAll(urlRegex)];
  if (urlMatches.length > 0) {
    for (const match of urlMatches) {
      if (match.index! > lastIndex) {
        parts.push(
          <span key={key++}>
            {processTextFormatting(text.slice(lastIndex, match.index))}
          </span>
        );
      }
      // match[1] is bracketed URL, match[2] is plain URL
      const url = match[1] || match[2];
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors break-all"
        >
          {url}
        </a>
      );
      lastIndex = match.index! + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(
        <span key={key++}>
          {processTextFormatting(text.slice(lastIndex))}
        </span>
      );
    }
    return <>{parts}</>;
  }

  return processTextFormatting(text);
}

function processTextFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;

  // First process underline <u>...</u>
  const underlineParts = text.split(/(<u>[^<]+<\/u>)/gi);
  
  for (const underlinePart of underlineParts) {
    if (underlinePart.toLowerCase().startsWith('<u>') && underlinePart.toLowerCase().endsWith('</u>')) {
      const underlineText = underlinePart.slice(3, -4);
      parts.push(
        <u key={key++} className="underline underline-offset-2">
          {underlineText}
        </u>
      );
    } else if (underlinePart) {
      // Process strikethrough ~~text~~
      const strikeParts = underlinePart.split(/(~~[^~]+~~)/g);
      
      for (const strikePart of strikeParts) {
        if (strikePart.startsWith('~~') && strikePart.endsWith('~~')) {
          const strikeText = strikePart.slice(2, -2);
          parts.push(
            <del key={key++} className="line-through text-muted-foreground/70">
              {strikeText}
            </del>
          );
        } else if (strikePart) {
          // Process **bold** - more flexible regex
          const boldParts = strikePart.split(/(\*\*[^*]+\*\*)/g);
          
          for (const part of boldParts) {
            if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
              const boldText = part.slice(2, -2);
              parts.push(
                <strong key={key++} className="font-semibold text-foreground">
                  {boldText}
                </strong>
              );
            } else if (part) {
              // Check for *italic* in non-bold parts
              const italicParts = part.split(/(?<!\*)\*([^*]+)\*(?!\*)/g);
              let isContent = false;
              for (const italicPart of italicParts) {
                if (isContent && italicPart) {
                  parts.push(<em key={key++}>{italicPart}</em>);
                } else if (italicPart) {
                  parts.push(<span key={key++}>{italicPart}</span>);
                }
                isContent = !isContent;
              }
            }
          }
        }
      }
    }
  }

  return <>{parts}</>;
}
