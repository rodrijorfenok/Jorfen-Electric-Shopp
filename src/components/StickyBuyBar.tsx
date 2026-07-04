import { BundleOption } from '../types';

interface StickyBuyBarProps {
  selectedOption: BundleOption;
  orderQuantity: number;
  isVisible: boolean;
  onActionClick: () => void;
}

export default function StickyBuyBar({ selectedOption, orderQuantity, isVisible, onActionClick }: StickyBuyBarProps) {
  const totalQuantity = selectedOption.quantity * orderQuantity;
  const totalPrice = selectedOption.totalPrice * orderQuantity;
  const isOutOfStock = totalQuantity > 9;

  const formatPrice = (n: number) => {
    return '$' + n.toLocaleString('es-AR');
  };

  return (
    <div
      id="sticky-buy"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-850 shadow-2xl px-4 py-3 pb-safe transition-all duration-400 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-[480px] mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
            {totalQuantity === 1 ? '1 unidad' : `${totalQuantity} unidades`}
          </span>
          <span className="font-extrabold text-base md:text-lg text-white font-mono">
            {isOutOfStock ? (
              <span className="text-red-500 text-xs font-bold animate-pulse">Sin stock</span>
            ) : (
              <span className="animate-pulse">{formatPrice(totalPrice)}</span>
            )}
          </span>
        </div>
        
        <button
          onClick={onActionClick}
          disabled={isOutOfStock}
          className={`font-extrabold text-sm uppercase px-5 py-2.5 rounded-full transition-all ${
            isOutOfStock
              ? 'bg-neutral-900 text-neutral-500 border border-neutral-850 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-[0_4px_15px_rgba(255,49,49,0.35)] cursor-pointer'
          }`}
        >
          {isOutOfStock ? 'Sin stock' : 'Comprar'}
        </button>
      </div>
    </div>
  );
}
