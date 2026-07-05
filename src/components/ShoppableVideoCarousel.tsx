import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoItem {
  id: string;
  videoUrl: string;
  title: string;
  desc: string;
}

const VIDEOS_DATA: VideoItem[] = [
  {
    id: 'vid-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Prueba 1: Tableros Eléctricos',
    desc: 'Detección de llama y auto-extinción instantánea en tableros eléctricos residenciales y comerciales.',
  },
  {
    id: 'vid-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Prueba 2: Motores de Vehículos',
    desc: 'Sofocación inmediata bajo el capot al detectar exceso de temperatura, protegiendo tu vehículo.',
  },
  {
    id: 'vid-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    title: 'Prueba 3: Gabinetes Industriales',
    desc: 'Inundación automática de micropartículas que extinguen el fuego en segundos sin dañar los equipos.',
  },
];

export default function ShoppableVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track scrolling to update the active index
  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    
    const children = container.children;
    let closestIndex = 0;
    let minDistance = Infinity;
    const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;

    for (let i = 0; i < VIDEOS_DATA.length; i++) {
      const child = children[i];
      if (!child) continue;
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= VIDEOS_DATA.length) return;
    
    // Set programmatic flag to ignore scroll events while smooth scrolling
    isProgrammaticScroll.current = true;
    setActiveIndex(index);
    setIsMuted(true); // Keep newly selected video muted initially for safety
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (carouselRef.current) {
      const container = carouselRef.current;
      const child = container.children[index] as HTMLElement;
      if (child) {
        const containerHalfWidth = container.clientWidth / 2;
        const childHalfWidth = child.clientWidth / 2;
        const scrollLeftTarget = child.offsetLeft - containerHalfWidth + childHalfWidth;
        container.scrollTo({
          left: scrollLeftTarget,
          behavior: 'smooth'
        });
      }
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600); // Smooth scroll transition buffer
  };

  // Play active video and pause inactive ones
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex) {
        video.muted = isMuted;
        video.play().catch(() => {
          // Ignore automatic playback restrictions
        });
      } else {
        video.pause();
        video.currentTime = 0; // Freeze/Reset on first frame
      }
    });
  }, [activeIndex, isMuted]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Toggle mute on click anywhere on the active card
  const toggleMute = () => {
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) {
      activeVideo.muted = !isMuted;
      activeVideo.play().catch(() => {});
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full py-8 border-t border-b border-neutral-900/80 bg-neutral-950/20 select-none relative">
      <div className="px-5 mb-5 text-center">
        <span className="text-[10px] font-black tracking-widest uppercase text-red-500 block mb-1 font-mono">
          DEMOSTRACIÓN EN ACCIÓN
        </span>
        <h2 className="text-xl font-black text-white tracking-tight font-sans">
          Ver para Creer: Tecnología BAW
        </h2>
        <p className="text-xs text-neutral-400 mt-1.5 font-medium">
          Tocá los videos para activar sonido o cambiar entre pruebas
        </p>
      </div>

      {/* Video Container Area with absolute arrows */}
      <div className="relative px-2">
        {/* Left Nav Arrow */}
        {activeIndex > 0 && (
          <button
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/75 backdrop-blur-md text-white p-2 rounded-full border border-neutral-800 hover:bg-neutral-900 hover:text-red-500 active:scale-90 transition-all cursor-pointer shadow-lg"
            aria-label="Video anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Nav Arrow */}
        {activeIndex < VIDEOS_DATA.length - 1 && (
          <button
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/75 backdrop-blur-md text-white p-2 rounded-full border border-neutral-800 hover:bg-neutral-900 hover:text-red-500 active:scale-90 transition-all cursor-pointer shadow-lg"
            aria-label="Siguiente video"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Video Row */}
        <div 
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar -mx-5 px-8 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {VIDEOS_DATA.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isActive) {
                    toggleMute();
                  } else {
                    scrollToIndex(index);
                  }
                }}
                className={`flex-shrink-0 w-[240px] aspect-[9/16] rounded-2xl overflow-hidden relative border transition-all duration-300 cursor-pointer snap-center shadow-xl ${
                  isActive 
                    ? 'border-red-600 scale-[1.03] shadow-[0_0_20px_rgba(255,49,49,0.25)]' 
                    : 'border-neutral-850 opacity-40 scale-95 hover:opacity-60'
                }`}
              >
                {/* Video Element */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={item.videoUrl}
                  loop
                  autoPlay
                  muted
                  defaultMuted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover z-0"
                />

                {/* Dark Gradient Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60 z-10 pointer-events-none" />

                {/* Speaker sound toggle (on top of active video only) */}
                {isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="absolute top-3 right-3 z-30 bg-black/70 backdrop-blur-md text-white p-1.5 rounded-full border border-neutral-800 hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer shadow-lg"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-500" />}
                  </button>
                )}

                {/* Title & Description Overlay at the bottom */}
                <div className="absolute bottom-0 inset-x-0 z-20 p-4 flex flex-col gap-1 text-left pointer-events-none">
                  <span className="text-xs font-black text-white tracking-tight drop-shadow-md">
                    {item.title}
                  </span>
                  <p className="text-[10px] text-neutral-300 leading-normal line-clamp-2 drop-shadow-sm font-medium">
                    {item.desc}
                  </p>
                </div>

                {/* Small "Mute / Unmute" tip on the bottom center of active card */}
                {isActive && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/5 pointer-events-none flex items-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
                    {isMuted ? <VolumeX className="w-3 h-3 text-white" /> : <Volume2 className="w-3 h-3 text-red-500" />}
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">
                      {isMuted ? 'Activar Sonido' : 'Silenciar'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-1.5 mt-2">
        {VIDEOS_DATA.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === activeIndex ? 'w-5 bg-red-600' : 'w-1.5 bg-neutral-800 hover:bg-neutral-600'
            }`}
            aria-label={`Ir al video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
