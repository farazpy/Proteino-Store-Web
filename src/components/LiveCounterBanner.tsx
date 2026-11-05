import React, { useState, useEffect } from 'react';

export const LiveCounterBanner: React.FC = () => {
  const [soldCount, setSoldCount] = useState(345653);

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
        {/* Header from reference image_9d57883d.png */}
        <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight uppercase leading-tight mb-10 max-w-4xl mx-auto text-[#004d23]">
          P.S WHILE YOU WERE READING THIS<br />
          WE SOLD ABOUT 200 PB JARS
        </h2>

        {/* 3 Main Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {/* Stat 1: Live Products Sold (Deep Green Card) */}
          <div className="relative bg-[#00632d] text-white rounded-[2rem] p-6 shadow-xl border-2 border-[#004d23] flex flex-col items-center justify-center min-h-[140px] transform hover:scale-105 transition-transform">
            {/* Live Indicator Pill */}
            <div className="absolute -top-3.5 bg-[#8ee000] text-[#004d23] text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#004d23] animate-ping" />
              <span>Live</span>
            </div>

            <div className="font-display text-4xl sm:text-5xl font-black text-[#8ee000] tabular-nums tracking-tight mt-1">
              {soldCount.toLocaleString()}+
            </div>
            <div className="text-xs sm:text-sm font-bold text-white/90 mt-1">
              Products sold
            </div>
          </div>

          {/* Stat 2: Happy Tastebuds (Bordered Card) */}
          <div className="bg-transparent border-2 border-[#004d23] rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[140px] transform hover:scale-105 transition-transform">
            <div className="font-display text-4xl sm:text-5xl font-black text-[#004d23] tracking-tight">
              34M+
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#14361e] mt-1">
              Happy tastebuds
            </div>
          </div>

          {/* Stat 3: Countries Sold (Bordered Card) */}
          <div className="bg-transparent border-2 border-[#004d23] rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[140px] transform hover:scale-105 transition-transform">
            <div className="font-display text-4xl sm:text-5xl font-black text-[#004d23] tracking-tight">
              21*
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#14361e] mt-1">
              Countries sold
            </div>
          </div>
        </div>

        {/* Floating Nutrition Chips / Badges from image_9d57883d.png */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
          {/* Blue Heart: NO CHOLESTEROL */}
          <div className="bg-[#1e88e5] text-white px-5 py-2.5 rounded-full font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-md -rotate-6 hover:rotate-0 transition-transform">
            💙 NO CHOLESTEROL
          </div>

          {/* Red/Orange Teardrop: NO TRANS FAT */}
          <div className="bg-white text-[#d84315] border-2 border-[#d84315] px-5 py-2.5 rounded-full font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-md rotate-3 hover:rotate-0 transition-transform">
            🔥 NO TRANS FAT
          </div>

          {/* Peanut Shape: HEALTHY FATS */}
          <div className="bg-[#d4974f] text-[#3e2723] px-6 py-2.5 rounded-full font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-md -rotate-2 hover:rotate-0 transition-transform">
            🥜 HEALTHY FATS
          </div>

          {/* Green Starburst: GLUTEN FREE */}
          <div className="bg-[#00632d] text-white px-6 py-2.5 rounded-full font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-md rotate-4 hover:rotate-0 transition-transform">
            🌾 GLUTEN FREE
          </div>

          {/* Light Green: NON GMO */}
          <div className="bg-[#8ee000] text-[#004d23] px-5 py-2.5 rounded-full font-display font-black text-xs sm:text-sm tracking-wider uppercase shadow-md -rotate-3 hover:rotate-0 transition-transform">
            🌱 NON GMO
          </div>
        </div>
      </div>
    </section>
  );
};
