import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';

// Import the generated images
import heroImg from '../assets/images/extintor_baw_hero_1783034657755.jpg';
import lifestyleImg from '../assets/images/extintor_baw_lifestyle_1783034669442.jpg';
import detailImg from '../assets/images/extintor_baw_detail_1783034682037.jpg';

const IMAGES = [
  { src: heroImg, alt: 'Extintor BAW - Vista frontal' },
  { src: lifestyleImg, alt: 'Extintor BAW - Instalado en tablero eléctrico' },
  { src: detailImg, alt: 'Extintor BAW - Detalle de válvula y tubo térmico' }
];

export default function ProductCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollPositions, setScrollPositions] = useState<number[]>([]);
  const [hoverOffsets, setHoverOffsets] = useState<{ x: number; y: number; id: number | null }>({ x: 0, y: 0, id: null });

  // Update which image is centered on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    
    // Calculate exact center position for each slide to compute shadow shifts
    const items = scrollRef.current.children;
    const offsets: number[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLElement;
      // Calculate where the slide is relative to the viewport center
      const slideCenter = item.offsetLeft + item.clientWidth / 2;
      const viewportCenter = scrollLeft + clientWidth / 2;
      const distanceFromCenter = (slideCenter - viewportCenter) / clientWidth;
      offsets.push(distanceFromCenter);
    }
    
    setScrollPositions(offsets);

    const index = Math.round(scrollLeft / clientWidth);
    if (index >= 0 && index < IMAGES.length) {
      setActiveIndex(index);
    }
  };

  // Set initial scroll positions
  useEffect(() => {
    if (scrollRef.current) {
      handleScroll();
    }
  }, []);

  // Handle interactive mouse/touch moves for the 3D moving shadow effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // range -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;  // range -0.5 to 0.5
    setHoverOffsets({ x, y, id: index });
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>, index: number) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    setHoverOffsets({ x, y, id: index });
  };

  const handleMouseLeave = () => {
    setHoverOffsets({ x: 0, y: 0, id: null });
  };

  const scrollToSlide = (index: number) => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth'
    });
  };

  return (
    <div className="w-full select-none">
      {/* Scroll Viewport Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing py-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        {IMAGES.map((img, index) => {
          // Get dynamic scroll ratio offset for parallax shadow
          const scrollOffset = scrollPositions[index] || 0;
          
          // Hover offset
          const isHovered = hoverOffsets.id === index;
          const hX = isHovered ? hoverOffsets.x : 0;
          const hY = isHovered ? hoverOffsets.y : 0;

          // Compute interactive 3D shadow displacement
          // Shadow shifts opposite to movement
          const shadowX = (scrollOffset * -30) + (hX * -20);
          const shadowY = 20 + (Math.abs(scrollOffset) * 10) + (hY * -20);
          const shadowBlur = 24 + (Math.abs(scrollOffset) * 8) + (isHovered ? 12 : 0);
          
          // Compute scale and rotation
          const scale = (1 - Math.min(Math.abs(scrollOffset) * 0.08, 0.12)) + (isHovered ? 0.03 : 0);
          const rotateY = (scrollOffset * 15) + (hX * 15);
          const rotateX = hY * -15;

          return (
            <div 
              key={index}
              className="flex-shrink-0 w-full snap-center px-2.5 flex justify-center items-center"
            >
              <div 
                className="w-full max-w-[380px] aspect-square relative perspective-1000 group transition-all duration-300"
                onMouseMove={(e) => handleMouseMove(e, index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
                onMouseLeave={handleMouseLeave}
                onTouchEnd={handleMouseLeave}
              >
                {/* Simulated dynamic moving shadow box */}
                <div 
                  className="absolute inset-4 rounded-3xl bg-neutral-950/25 filter blur-xl transition-all duration-100 pointer-events-none"
                  style={{
                    transform: `translate3d(${shadowX}px, ${shadowY}px, -40px)`,
                    opacity: 1 - Math.min(Math.abs(scrollOffset) * 0.4, 0.6),
                    filter: `blur(${shadowBlur}px)`
                  }}
                />

                {/* Main Product Image Container */}
                <div 
                  className="w-full h-full bg-linear-to-b from-neutral-50 to-neutral-200 border border-white/50 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center transition-transform duration-150 ease-out"
                  style={{
                    transform: `scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    referrerPolicy="no-referrer"
                    className="w-[85%] h-[85%] object-contain select-none transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Glassmorphism reflection overlay */}
                  <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination indicators / dot navigation */}
      <div className="flex justify-center items-center gap-1.5 mt-3 py-1">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            aria-label={`Slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === index 
                ? 'w-6 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]' 
                : 'w-2 bg-neutral-300 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
