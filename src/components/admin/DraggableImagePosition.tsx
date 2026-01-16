import { useState, useRef, useCallback, useEffect } from 'react';
import { Move } from 'lucide-react';

interface DraggableImagePositionProps {
  imageUrl: string;
  position: number; // 0-100
  onChange: (position: number) => void;
}

export function DraggableImagePosition({ imageUrl, position, onChange }: DraggableImagePositionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // Calculate position as percentage (0 = top, 100 = bottom)
    const newPosition = Math.max(0, Math.min(100, (y / height) * 100));
    onChange(Math.round(newPosition));
  }, [isDragging, onChange]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const y = touch.clientY - rect.top;
    const height = rect.height;
    
    const newPosition = Math.max(0, Math.min(100, (y / height) * 100));
    onChange(Math.round(newPosition));
  }, [isDragging, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  return (
    <div className="space-y-2">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[16/6] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing border-2 border-dashed border-primary/50 bg-secondary"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-full object-cover pointer-events-none select-none"
          style={{ objectPosition: `center ${position}%` }}
          draggable={false}
        />
        
        {/* Overlay with instructions */}
        <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-background/90 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
            <Move className="h-4 w-4" />
            Arraste para posicionar
          </div>
        </div>

        {/* Position indicator line */}
        <div 
          className="absolute left-0 right-0 h-0.5 bg-primary shadow-lg pointer-events-none"
          style={{ top: `${position}%` }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Arraste a imagem para ajustar qual parte fica visível no slider
      </p>
    </div>
  );
}
