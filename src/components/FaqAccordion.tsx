import { useState } from 'react';
import { FaqItem } from '../types';

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 ${
              isOpen ? 'bg-neutral-900/80 shadow-md' : 'bg-neutral-950 hover:bg-neutral-900/40'
            }`}
          >
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 p-4 text-left select-none"
            >
              <span className="font-bold text-xs md:text-sm text-neutral-100 font-sans tracking-tight">
                {item.question}
              </span>
              <span className="relative flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {/* Custom animated plus/minus sign using Tailwind */}
                <span className="absolute w-3 h-0.5 bg-neutral-400 rounded-full transition-transform duration-300" />
                <span
                  className={`absolute w-0.5 h-3 bg-neutral-400 rounded-full transition-transform duration-300 ${
                    isOpen ? 'rotate-90 opacity-0' : ''
                  }`}
                />
              </span>
            </button>
            <div
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: isOpen ? '200px' : '0px',
                opacity: isOpen ? 1 : 0
              }}
            >
              <p className="px-4 pb-4 pt-0 text-xs md:text-sm text-neutral-400 font-sans leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
