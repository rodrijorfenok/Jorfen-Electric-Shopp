import React from 'react';

export default function AnnouncementBar() {
  const announcements = [
    "⚡ PROTECCIÓN AUTOMÁTICA 24/7 SIN MANTENIMIENTO",
    "🚚 ENVÍO GRATIS A TODO EL PAÍS SÓLO POR HOY",
    "🛡️ GARANTÍA DE SATISFACCIÓN DE 30 DÍAS",
    "🔥 ÚLTIMAS UNIDADES EN PROMOCIÓN",
    "💳 HASTA 12 CUOTAS SIN INTERÉS",
    "🔧 MONTAJE FÁCIL EN RIEL DIN EN SEGUNDOS"
  ];

  // We repeat the array to ensure seamless infinite looping scroll
  const repeatedAnnouncements = [...announcements, ...announcements, ...announcements];

  return (
    <div 
      id="announcement-bar"
      className="w-full bg-black py-2.5 overflow-hidden border-b border-neutral-800 flex items-center relative select-none"
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {repeatedAnnouncements.map((text, index) => (
          <span
            key={index}
            className="inline-flex items-center mx-6 font-sans text-xs md:text-sm font-extrabold tracking-widest text-white uppercase relative"
          >
            {/* The text with a premium shimmering gradient effect */}
            <span className="shine-text drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
              {text}
            </span>
            <span className="ml-12 text-red-600 font-bold" aria-hidden="true">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
