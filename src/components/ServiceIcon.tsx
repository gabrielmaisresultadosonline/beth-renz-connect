import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ServiceIconProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function ServiceIcon({ icon: Icon, title, description, index = 0 }: ServiceIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group text-center"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg transition-all duration-300"
      >
        <Icon className="h-10 w-10 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
      </motion.div>
      <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm">
        {description}
      </p>
    </motion.div>
  );
}
