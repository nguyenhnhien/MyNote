import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const HandwritingText: React.FC<{ text?: string }> = ({ text = "nguyenhnhien" }) => {
  const letters = Array.from(text);
  
  return (
    <div className="relative inline-block">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative py-4"
      >
        <h1 className="font-cursive text-7xl md:text-[110px] text-white tracking-[-0.02em] relative z-10 text-glow flex justify-center">
          {letters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ 
                opacity: 0, 
                y: 20
              }}
              animate={{ 
                opacity: [0, 1, 1], 
                y: [20, 0, -10, 0] 
              }}
              transition={{ 
                opacity: { duration: 1, delay: index * 0.1 },
                y: {
                  duration: 4,
                  delay: index * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        {/* Subtle flicker/shimmer to mimic the tip of a pen or light */}
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: letters.length * 0.15, delay: 0.2, ease: "linear" }}
          className="absolute top-0 bottom-0 left-0 w-1 bg-white/20 blur-sm z-30 pointer-events-none"
          style={{ height: '100%' }}
        />
      </motion.div>
    </div>
  );
};

export const ClickRipple: React.FC = () => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ left: r.x, top: r.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-water-light rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
