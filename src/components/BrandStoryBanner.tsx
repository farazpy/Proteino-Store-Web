import React, { useState } from 'react';
import { ChevronRight, X, ShieldCheck, Heart, Award, Sparkles } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';

export const BrandStoryBanner: React.FC = () => {
  const { settings } = useStoreData();
  const story = settings.brandStory;
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="relative bg-[#9ce5a7] py-20 px-4 overflow-hidden border-b border-[#80d18d]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-[#00632d] uppercase tracking-tight leading-[1.1] mb-6">
            {story.headline}
          </h2>

          <p className="text-sm sm:text-base text-[#144723] font-medium max-w-2xl mx-auto leading-relaxed mb-8">
            {story.descriptionBefore}{' '}
            <span className="bg-[#00632d] text-[#8ee000] px-2 py-0.5 rounded font-bold">
              {story.highlightTag}
            </span>{' '}
            {story.descriptionAfter}
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#8ee000] hover:bg-[#a0f507] text-[#004d23] font-display font-black text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wide cursor-pointer"
          >
            <span>{story.buttonText}</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </section>

      {/* Brand Story Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#fbf7f0] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#dfd0bd] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#eee3d1] hover:bg-[#00632d] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00632d] mb-2">
              <Sparkles className="w-4 h-4 text-[#00632d]" />
              <span>{story.modalKicker}</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1a221b] mb-4">
              {story.modalTitle}
            </h3>

            <p className="text-sm text-[#5d5140] leading-relaxed mb-4">
              {story.modalIntro}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-white p-4 rounded-2xl border border-[#e6dbc8] text-center">
                <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1a221b]">{story.pillar1Title}</div>
                <div className="text-[11px] text-[#7d705c] mt-0.5">
                  {story.pillar1Desc}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e6dbc8] text-center">
                <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1a221b]">{story.pillar2Title}</div>
                <div className="text-[11px] text-[#7d705c] mt-0.5">
                  {story.pillar2Desc}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e6dbc8] text-center">
                <div className="w-10 h-10 rounded-xl bg-[#00632d]/10 text-[#00632d] flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[#1a221b]">{story.pillar3Title}</div>
                <div className="text-[11px] text-[#7d705c] mt-0.5">
                  {story.pillar3Desc}
                </div>
              </div>
            </div>

            <p className="text-xs text-[#716452] leading-relaxed mb-6">
              {story.modalBody}
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-[#00632d] hover:bg-[#004d23] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Explore Our Clean Staples
            </button>
          </div>
        </div>
      )}
    </>
  );
};
