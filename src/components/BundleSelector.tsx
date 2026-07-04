import { BundleOption } from '../types';
import heroImg from '../assets/images/extintor_baw_hero_1783034657755.jpg';

interface BundleSelectorProps {
  selectedId: string;
  onSelect: (option: BundleOption) => void;
  options: BundleOption[];
}

export default function BundleSelector({ selectedId, onSelect, options }: BundleSelectorProps) {
  const formatPrice = (n: number) => {
    return '$' + n.toLocaleString('es-AR');
  };

  return (
    <div className="w-full">
      <p className="text-center font-bold text-xs uppercase tracking-widest text-neutral-400 mb-4 font-sans">
        Elegí cantidad
      </p>

      <div className="grid grid-cols-3 gap-2 select-none">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          
          return (
            <div
              key={opt.id}
              onClick={() => onSelect(opt)}
              className={`relative cursor-pointer transition-all duration-300 rounded-xl flex flex-col items-center justify-between p-3 border text-center h-full ${
                isSelected
                  ? 'border-red-600 bg-red-950/20 shadow-[0_0_15px_rgba(255,49,49,0.3)] scale-[1.03]'
                  : opt.isBestSeller
                    ? 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900/80'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-800 hover:bg-neutral-900/40'
              }`}
            >
              {/* Highlight ribbon for "Más elegido" */}
              {opt.isBestSeller && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] md:text-[9px] text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md z-10 animate-pulse">
                  Más elegido
                </span>
              )}

              {/* Stacked small images layout matching the selected bundle */}
              <div className="flex items-end justify-center h-9 mb-1.5 relative w-full">
                {Array.from({ length: opt.imagesCount }).map((_, i) => {
                  let offsetClass = 'scale-100';
                  let zIndexClass = 'z-10';
                  let opacityClass = 'opacity-100';
                  
                  if (opt.imagesCount === 2) {
                    if (i === 0) {
                      offsetClass = '-translate-x-1 translate-y-0.5 scale-95';
                      zIndexClass = 'z-10';
                    } else {
                      offsetClass = 'translate-x-1 -translate-y-0.5 scale-90';
                      zIndexClass = 'z-0';
                      opacityClass = 'opacity-80';
                    }
                  } else if (opt.imagesCount === 3) {
                    if (i === 0) {
                      offsetClass = '-translate-x-2 translate-y-1 scale-90';
                      zIndexClass = 'z-10';
                    } else if (i === 1) {
                      offsetClass = 'translate-x-0 scale-100';
                      zIndexClass = 'z-20';
                    } else {
                      offsetClass = 'translate-x-2 -translate-y-1 scale-85';
                      zIndexClass = 'z-0';
                      opacityClass = 'opacity-70';
                    }
                  }

                  return (
                    <img
                      key={i}
                      src={heroImg}
                      alt=""
                      aria-hidden="true"
                      className={`w-7 h-7 object-contain absolute filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform ${offsetClass} ${zIndexClass} ${opacityClass}`}
                    />
                  );
                })}
              </div>

              {/* Bundle Details */}
              <div className="flex flex-col items-center gap-0.5 mt-auto w-full">
                <span className="font-bold text-xs text-neutral-200 font-sans">
                  {opt.label}
                </span>

                {opt.discountBadge && (
                  <span className="bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full mt-0.5">
                    {opt.discountBadge}
                  </span>
                )}

                <span className="font-extrabold text-[13px] text-white mt-1 font-mono">
                  {formatPrice(opt.totalPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
