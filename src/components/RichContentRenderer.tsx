import { useMemo } from 'react';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export function RichContentRenderer({ content, className = '' }: RichContentRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Empty line = paragraph break
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

      // Image: ![alt](url)
      const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        elements.push(
          <figure key={key++} className="my-6">
            <img
              src={imageMatch[2]}
              alt={imageMatch[1] || 'Imagem'}
              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
              loading="lazy"
            />
            {imageMatch[1] && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
                {imageMatch[1]}
              </figcaption>
            )}
          </figure>
        );
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

      // Regular paragraph with inline formatting
      elements.push(
        <p key={key++} className="text-base md:text-lg leading-relaxed text-muted-foreground mb-4">
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

// Process inline formatting like **bold**, *italic*, and [links](url)
function processInlineFormatting(text: string): React.ReactNode {
  // Process inline images that might be in the middle of text
  const inlineImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let key = 0;

  // First handle inline images
  const imageMatches = [...text.matchAll(inlineImageRegex)];
  if (imageMatches.length > 0) {
    for (const match of imageMatches) {
      if (match.index! > lastIndex) {
        parts.push(
          <span key={key++}>
            {processLinksAndFormatting(text.slice(lastIndex, match.index))}
          </span>
        );
      }
      parts.push(
        <img
          key={key++}
          src={match[2]}
          alt={match[1] || 'Imagem'}
          className="inline-block max-h-64 rounded my-2"
        />
      );
      lastIndex = match.index! + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(
        <span key={key++}>
          {processLinksAndFormatting(text.slice(lastIndex))}
        </span>
      );
    }
    return <>{parts}</>;
  }

  return processLinksAndFormatting(text);
}

// Process links [text](url) and then text formatting
function processLinksAndFormatting(text: string): React.ReactNode {
  // Link regex: [text](url) - but not images which start with !
  const linkRegex = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let key = 0;

  const linkMatches = [...text.matchAll(linkRegex)];
  if (linkMatches.length > 0) {
    for (const match of linkMatches) {
      if (match.index! > lastIndex) {
        parts.push(
          <span key={key++}>
            {processTextFormatting(text.slice(lastIndex, match.index))}
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
  const underlineParts = text.split(/(<u>[^<]+<\/u>)/g);
  
  for (const underlinePart of underlineParts) {
    if (underlinePart.startsWith('<u>') && underlinePart.endsWith('</u>')) {
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
          // Process **bold**
          const boldParts = strikePart.split(/(\*\*[^*]+\*\*)/g);
          
          for (const part of boldParts) {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldText = part.slice(2, -2);
              parts.push(
                <strong key={key++} className="font-semibold text-foreground">
                  {boldText}
                </strong>
              );
            } else if (part) {
              // Check for *italic* in non-bold parts
              const italicParts = part.split(/(\*[^*]+\*)/g);
              for (const italicPart of italicParts) {
                if (italicPart.startsWith('*') && italicPart.endsWith('*') && !italicPart.startsWith('**')) {
                  const italicText = italicPart.slice(1, -1);
                  parts.push(<em key={key++}>{italicText}</em>);
                } else if (italicPart) {
                  parts.push(<span key={key++}>{italicPart}</span>);
                }
              }
            }
          }
        }
      }
    }
  }

  return <>{parts}</>;
}