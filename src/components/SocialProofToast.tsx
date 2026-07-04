import { useState, useEffect } from 'react';
import { SocialProof } from '../types';
import heroImg from '../assets/images/extintor_baw_hero_1783034657755.jpg';

interface SocialProofToastProps {
  data: SocialProof[];
  isStickyVisible?: boolean;
}

export default function SocialProofToast({ data, isStickyVisible = false }: SocialProofToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (data.length === 0) return;

    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    function runCycle() {
      // Show notification
      setVisible(true);

      // Hide after 5 seconds
      hideTimeout = setTimeout(() => {
        setVisible(false);

        // Wait 4 seconds after hiding, then advance index and trigger next notification
        showTimeout = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % data.length);
          runCycle();
        }, 4000);

      }, 5000);
    }

    // Start first notification 3 seconds after load
    const initialStart = setTimeout(() => {
      runCycle();
    }, 3000);

    return () => {
      clearTimeout(initialStart);
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [data]);

  if (data.length === 0) return null;
  const current = data[currentIndex];

  return (
    <div
      id="social-proof-toast"
      className={`fixed left-1/2 -translate-x-1/2 z-[9999] bg-neutral-950/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] border border-neutral-850 flex items-center gap-3.5 w-[calc(100%-32px)] max-w-[448px] transition-all duration-500 ease-out transform ${
        visible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}
      style={{
        bottom: isStickyVisible ? '88px' : '16px',
      }}
    >
      <img
        src={heroImg}
        alt="Extintor BAW"
        referrerPolicy="no-referrer"
        className="w-12 h-12 object-contain bg-neutral-900 rounded-xl p-1 border border-neutral-800 flex-shrink-0"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] text-red-500 font-extrabold font-mono uppercase tracking-wider">
          {current.time}
        </span>
        <span className="text-xs font-black text-neutral-100 truncate">
          {current.user}
        </span>
        <span className="text-xs text-neutral-400 truncate">
          {current.action}
        </span>
      </div>
    </div>
  );
}

