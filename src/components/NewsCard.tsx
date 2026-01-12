import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import heroBg from '@/assets/hero-bg.jpg';

interface NewsCardProps {
  title: string;
  summary?: string;
  imageUrl?: string;
  date?: string;
  category?: string;
  onClick?: () => void;
  index?: number;
}

export function NewsCard({ 
  title, 
  summary, 
  imageUrl, 
  date, 
  category = 'Notícia',
  onClick,
  index = 0 
}: NewsCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.img
          src={imageUrl || heroBg}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded">
          {category}
        </span>
      </div>
      
      <div className="p-5">
        {date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            {format(new Date(date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </div>
        )}
        
        <h3 className="font-display font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        {summary && (
          <p className="text-muted-foreground text-sm line-clamp-2">
            {summary}
          </p>
        )}
        
        <div className="mt-4 flex items-center text-primary text-sm font-semibold">
          <span className="relative">
            Ler mais
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
