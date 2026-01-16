import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomepageSlide {
  id: string;
  image_url: string;
  title: string | null;
  link: string | null;
  display_order: number;
  active: boolean;
  image_position: string | null;
}

export function HomepageSlider() {
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlides() {
      const { data } = await supabase
        .from('homepage_slides')
        .select('*')
        .eq('active', true)
        .order('display_order');
      
      setSlides(data || []);
      setLoading(false);
    }
    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [slides.length, nextSlide]);

  if (loading || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  const getObjectPosition = (position: string | null) => {
    // If it's a number (percentage), use it directly
    const numPos = parseInt(position || '50');
    if (!isNaN(numPos)) {
      return `center ${numPos}%`;
    }
    // Fallback for old values
    switch (position) {
      case 'top': return 'center 0%';
      case 'bottom': return 'center 100%';
      default: return 'center 50%';
    }
  };

  const SlideContent = () => (
    <div className="relative aspect-[16/6] md:aspect-[16/5] w-full overflow-hidden rounded-lg">
      <img
        src={currentSlide.image_url}
        alt={currentSlide.title || 'Slide'}
        className="w-full h-full object-cover"
        style={{ objectPosition: getObjectPosition(currentSlide.image_position) }}
      />
      
      {/* Overlay with title */}
      {currentSlide.title && (
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent flex items-end">
          <div className="p-4 md:p-6">
            <h2 className="text-white text-lg md:text-2xl font-display font-bold drop-shadow-lg">
              {currentSlide.title}
            </h2>
          </div>
        </div>
      )}

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full h-10 w-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full h-10 w-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // If slide has a link, wrap in Link component
  if (currentSlide.link) {
    const isExternal = currentSlide.link.startsWith('http');
    
    if (isExternal) {
      return (
        <a 
          href={currentSlide.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group cursor-pointer"
        >
          <SlideContent />
        </a>
      );
    }
    
    return (
      <Link to={currentSlide.link} className="block group cursor-pointer">
        <SlideContent />
      </Link>
    );
  }

  return <SlideContent />;
}
