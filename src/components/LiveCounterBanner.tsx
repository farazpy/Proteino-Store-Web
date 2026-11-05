import React, { useState, useEffect } from 'react';
import { useStoreData } from '../context/StoreDataContext';

export const LiveCounterBanner: React.FC = () => {
  const { settings } = useStoreData();
  const live = settings.liveCounter;
  const [soldCount, setSoldCount] = useState(live.baseSoldCount || 345653);

  useEffect(() => {
    setSoldCount(live.baseSoldCount || 345653);
  }, [live.baseSoldCount]);

  // Realistic periodic increment
  useEffect(() => {
    const timer = setInterval(() => {
      setSoldCount((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-20 bg-[#a6aff4] border-y border-[#919cf0] relative overflow-hidden text-[#00632d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight uppercase leading-tight mb-10 max-w-4xl mx-auto text-[#004d23]">
          {live.headlineLine1}
          <br />
          {live.headlineLine2}
        </h2>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {/* Stat 1: Live Products Sold */}
          <div className="relative bg-[#00632d] text-white rounded-[2rem] p-6 shadow-xl border-2 border-[#004d23] flex flex-col items-center justify-center min-h-[140px] transform hover:scale-105 transition-transform">
            <div className="absolute -top-3.5 bg-[#8ee000] text-[#004d23] text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#004d23] animate-ping" />
              <span>Live</span>
            </div>

            <div className="font-display text-4xl sm:text-5xl font-black text-[#8ee000] tabular-nums tracking-tight mt-1">
              {soldCount.toLocaleString()}+
            </div>
            <div className="text-xs sm:text-sm font-bold text-white/90 mt-1">
              {live.stat1Label}
            </div>
          </div>

          {/* Stat 2: Happy Tastebuds */}
          <div className="bg-transparent border-2 border-[#004d23] rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[140px] transform hover:scale-105 transition-transform">
            <div className="font-display text-4xl sm:text-5xl font-black text-[#004d23] tracking-tight">
              {live.stat2Value}
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#14361e] mt-1">
              {live.stat2Label}
            </div>
          </div>

          {/* Stat 3: Countries Sold */}
          <div className="bg-transparent border-2 border-[#004d23] rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[140px] transform hover:scale-105 transition-transform">
            <div className="font-display text-4xl sm:text-5xl font-black text-[#004d23] tracking-tight">
              {live.stat3Value}
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#14361e] mt-1">
              {live.stat3Label}
            </div>
          </div>
        </div>

        {/* Floating Nutrition Chips / Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
          {(live.badges || []).map((badge, i) => {
            const styles = [
              'bg-[#1e88e5] text-white -rotate-6',
              'bg-white text-[#d84315] border-2 border-[#d84315] rotate-3',
              'bg-[#d4974f] text-[#3e2723] -rotate-2',
              'bg-[#00632d] text-white rotate-4',
              'bg-[#8ee000] text-[#004d23] -rotate-3',
            ];
            return (
              <div
                key={i}
                className={`${styles[i % styles.length]} px-5 py-2.5 rounded-full font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-md hover:rotate-0 transition-transform`}
              >
                {badge}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
