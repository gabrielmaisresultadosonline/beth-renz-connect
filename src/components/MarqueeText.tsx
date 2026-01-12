import { motion } from 'framer-motion';

interface MarqueeTextProps {
  text: string;
  className?: string;
}

export function MarqueeText({ text, className = '' }: MarqueeTextProps) {
  const items = Array(4).fill(text);

  return (
    <div className={`overflow-hidden py-4 ${className}`}>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {items.map((item, index) => (
          <span
            key={index}
            className="mx-8 text-6xl md:text-8xl font-display font-bold text-stroke text-foreground/10"
          >
            {item} •
          </span>
        ))}
        {items.map((item, index) => (
          <span
            key={`duplicate-${index}`}
            className="mx-8 text-6xl md:text-8xl font-display font-bold text-stroke text-foreground/10"
          >
            {item} •
          </span>
        ))}
      </motion.div>
    </div>
  );
}
