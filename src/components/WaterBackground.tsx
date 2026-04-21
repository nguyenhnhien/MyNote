import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const PaperBoat = ({ delay = 0, duration = 20, startY = 50 }) => {
  return (
    <motion.div
      initial={{ x: '-10%', y: `${startY}%`, opacity: 0, rotate: -5 }}
      animate={{ 
        x: '110%', 
        y: [`${startY}%`, `${startY + 2}%`, `${startY - 1}%`, `${startY}%`],
        opacity: [0, 1, 1, 0],
        rotate: [ -5, 5, -5, 5 ]
      }}
      transition={{ 
        duration, 
        delay, 
        repeat: Infinity, 
        ease: "linear",
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }}
      className="absolute pointer-events-none w-12 h-12 text-white/40"
    >
      <svg viewBox="0 0 100 60" fill="currentColor">
        <path d="M10 40 L50 10 L90 40 L50 45 Z" opacity="0.8" />
        <path d="M10 40 L50 55 L90 40 L50 45 Z" opacity="1" />
        <path d="M50 45 L50 10 L90 40 Z" fill="white" opacity="0.3" />
      </svg>
    </motion.div>
  );
};

const Ripple: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 4, opacity: 0 }}
    transition={{ duration: 3, ease: "easeOut" }}
    style={{ left: x, top: y }}
    className="absolute w-8 h-8 rounded-full border border-white/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
  />
);

import { SiteConfig } from '../types';

export const WaterBackground: React.FC<{ config?: SiteConfig }> = ({ config }) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bgMode, setBgMode] = useState<'water' | 'slideshow'>('water');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slideImages = config?.slideImages || [
    'input_file_0.png',
    'https://picsum.photos/seed/nature/1920/1080',
    'https://picsum.photos/seed/ocean/1920/1080',
    'https://picsum.photos/seed/mist/1920/1080',
  ];

  useEffect(() => {
    // Determine mode based on config
    let mode: 'water' | 'slideshow' = 'water';
    if (config?.bgMode === 'auto' || !config?.bgMode) {
      mode = Math.random() > 0.4 ? 'slideshow' : 'water';
    } else {
      mode = config.bgMode as 'water' | 'slideshow';
    }
    
    setBgMode(mode);

    if (mode === 'slideshow') {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slideImages.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [config?.bgMode, slideImages.length]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 3000);
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-water-deep overflow-hidden film-grain flicker">
      <AnimatePresence mode="wait">
        {bgMode === 'water' ? (
          <motion.div
            key="water-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Immersive UI Gradient Stack - Animated for "video" feel */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 1, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%),
                  linear-gradient(180deg, var(--color-water-light) 0%, var(--color-water-mid) 50%, var(--color-water-deep) 100%)
                `
              }}
            />
            
            {/* Moving highlights - Simulating light on moving water */}
            <motion.div 
              animate={{ 
                x: ['-20%', '20%', '-20%'],
                y: ['-10%', '10%', '-10%'],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 30% 20%, white 0%, transparent 40%)',
                filter: 'blur(100px)'
              }}
            />
          </motion.div>
        ) : (
          <div key="slideshow-bg" className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slideImages[currentSlide]})` }}
              />
            </AnimatePresence>
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
        )}
      </AnimatePresence>
      
      {/* Surface Glare effect from theme - Also animated */}
      <motion.div 
        animate={{ 
          x: ['-5%', '5%', '-5%'],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.15) 50%, transparent 55%)'
        }}
      />

      {/* Floating Boats with theme styling */}
      <div className="filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.2)]">
        <PaperBoat delay={0} duration={25} startY={30} />
        <PaperBoat delay={8} duration={30} startY={60} />
        <PaperBoat delay={15} duration={22} startY={75} />
      </div>

      {/* Interactive Ripples */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
        ))}
      </AnimatePresence>

      {/* Ambient Ripples */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,_rgba(255,255,255,0.05)_0%,_transparent_50%)]"
      />
    </div>
  );
};
