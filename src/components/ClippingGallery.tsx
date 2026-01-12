import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

interface ClippingItem {
  id: string;
  title: string;
  source?: string | null;
  image_url?: string | null;
  link?: string | null;
}

interface ClippingGalleryProps {
  items: ClippingItem[];
}

export function ClippingGallery({ items }: ClippingGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<ClippingItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Em breve, matérias publicadas na mídia</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.slice(0, 8).map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            onClick={() => setSelectedItem(item)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={item.image_url || heroBg}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-background text-sm font-medium line-clamp-2">{item.title}</p>
              {item.source && (
                <p className="text-background/70 text-xs mt-1">{item.source}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-foreground/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <img
                src={selectedItem.image_url || heroBg}
                alt={selectedItem.title}
                className="w-full max-h-[60vh] object-contain bg-muted"
              />
              
              <div className="p-6">
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {selectedItem.title}
                </h3>
                {selectedItem.source && (
                  <p className="text-muted-foreground text-sm mb-4">
                    Fonte: {selectedItem.source}
                  </p>
                )}
                {selectedItem.link && (
                  <Button asChild variant="outline">
                    <a href={selectedItem.link} target="_blank" rel="noopener noreferrer">
                      Ver publicação original
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
