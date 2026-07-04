import { useState, useEffect } from 'react';

export default function TimerBar() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [progressPercent, setProgressPercent] = useState(100);

  useEffect(() => {
    function calculateTime() {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      if (diff <= 0) {
        return { hours: 23, minutes: 59, seconds: 59, percent: 100 };
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      // Daily percentage calculation
      const totalSecondsInDay = 86400;
      const secondsPassed = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
      const secondsRemaining = totalSecondsInDay - secondsPassed;
      const percent = (secondsRemaining / totalSecondsInDay) * 100;

      return { hours, minutes, seconds, percent };
    }

    const initial = calculateTime();
    setTimeLeft({ hours: initial.hours, minutes: initial.minutes, seconds: initial.seconds });
    setProgressPercent(initial.percent);

    const interval = setInterval(() => {
      const updated = calculateTime();
      setTimeLeft({ hours: updated.hours, minutes: updated.minutes, seconds: updated.seconds });
      setProgressPercent(updated.percent);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const format = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="sticky top-0 z-50 w-full bg-black border-b border-neutral-900 select-none">
      {/* 6px glowing progress bar */}
      <div className="w-full h-[6px] bg-neutral-950 relative overflow-hidden">
        <div 
          className="h-full bg-red-600 transition-all duration-1000 ease-linear shadow-[0_0_15px_#ff3131]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Info Bar */}
      <div className="px-4 py-2 flex items-center justify-between text-white font-sans">
        <span className="text-[10px] font-extrabold tracking-widest text-neutral-400 uppercase">
          Envíos gratis Solo por hoy
        </span>
        <div className="flex items-center gap-1.5 font-sans">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Quedan:
          </span>
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-white">
            <span className="bg-red-600 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,49,49,0.5)]">
              {format(timeLeft.hours)}h
            </span>
            <span className="text-red-500 font-bold">:</span>
            <span className="bg-red-600 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,49,49,0.5)]">
              {format(timeLeft.minutes)}m
            </span>
            <span className="text-red-500 font-bold">:</span>
            <span className="bg-red-600 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,49,49,0.5)]">
              {format(timeLeft.seconds)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
