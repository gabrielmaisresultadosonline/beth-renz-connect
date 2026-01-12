import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BlogCardProps {
  title: string;
  summary?: string;
  imageUrl?: string;
  date?: string;
  category?: string;
  featured?: boolean;
  onClick?: () => void;
  index?: number;
}

export function BlogCard({ 
  title, 
  summary, 
  imageUrl, 
  date, 
  category,
  featured = false,
  onClick,
  index = 0 
}: BlogCardProps) {
  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        onClick={onClick}
        className="group relative overflow-hidden rounded-2xl cursor-pointer"
      >
        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.7 }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-primary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          {category && (
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-4"
            >
              {category}
            </motion.span>
          )}
          
          <h2 className="text-2xl md:text-4xl font-display font-bold text-background mb-3 group-hover:text-primary transition-colors duration-300">
            {title}
          </h2>
          
          {summary && (
            <p className="text-background/80 text-sm md:text-base max-w-2xl mb-4 line-clamp-2">
              {summary}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {date && (
              <div className="flex items-center gap-2 text-background/70 text-sm">
                <Calendar className="h-4 w-4" />
                {format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            )}
            
            <motion.div
              className="flex items-center gap-2 text-primary font-semibold"
              whileHover={{ x: 5 }}
            >
              Ler mais <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl mb-4">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={title}
            className="w-full aspect-[4/3] object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6 }}
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-display font-bold text-primary/30">BR</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-300" />
        
        {category && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {category}
          </span>
        )}
        
        <motion.div
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
        >
          <ArrowRight className="h-5 w-5 text-primary-foreground" />
        </motion.div>
      </div>
      
      {date && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>
      )}
      
      <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
        {title}
      </h3>
      
      {summary && (
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
          {summary}
        </p>
      )}
    </motion.article>
  );
}
