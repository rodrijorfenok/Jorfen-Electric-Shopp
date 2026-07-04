import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number; // percentage
  size: number; // pixels
  delay: number; // seconds
  duration: number; // seconds
  opacity: number;
}

export default function FireFooterBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 22 fire embers with random properties
    const newParticles: Particle[] = Array.from({ length: 22 }).map((_, i) => {
      const size = Math.random() * 24 + 12; // size between 12px and 36px
      const left = Math.random() * 100; // start left position
      const delay = Math.random() * 4; // animation delay
      const duration = Math.random() * 3 + 3; // animation duration (3s to 6s)
      const opacity = Math.random() * 0.4 + 0.3; // opacity between 0.3 and 0.7

      return {
        id: i,
        left,
        size,
        delay,
        duration,
        opacity,
      };
    });

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Deep ambient red-orange glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-full bg-radial from-red-600/15 via-red-950/5 to-transparent blur-3xl opacity-80" />

      {/* Flame wave gradient line at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-600/25 via-amber-600/10 to-transparent blur-[2px]" />
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-amber-500/30 to-transparent" />

      {/* Dynamic Flickering Embers */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bottom-0 rounded-full mix-blend-screen animate-fire-rise bg-radial"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            background: 'radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(249,115,22,0.4) 50%, rgba(254,240,138,0) 100%)',
          }}
        />
      ))}

      {/* Stylized background overlay for depth */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent z-10" />
    </div>
  );
}
