import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';

interface TopAnnouncementProps {
  onApplyCoupon?: (code: string) => void;
}

export const TopAnnouncement: React.FC<TopAnnouncementProps> = ({ onApplyCoupon }) => {
  const { settings } = useStoreData();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = settings.topBar;
  if (dismissed || !config?.enabled) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(config.couponCode);
    setCopied(true);
    if (onApplyCoupon) onApplyCoupon(config.couponCode);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="text-white text-xs py-2 px-4 transition-all relative border-b border-[#00632d]"
      style={{ backgroundColor: config.bgColor || '#004d23' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-[#8ee000]">
            <Sparkles className="w-3.5 h-3.5" /> {config.prefixBadge}
          </span>
          <span className="text-[#f1f8f4]">
            {config.text}{' '}
            <button
              onClick={handleCopyCode}
              className="font-mono font-bold bg-[#8ee000] text-[#004d23] px-2 py-0.5 rounded text-[11px] hover:bg-white transition-colors cursor-pointer"
              title="Click to copy coupon"
            >
              {copied ? 'COPIED! ✓' : config.couponCode}
            </button>
          </span>
          <span className="hidden sm:inline text-emerald-300">·</span>
          <span className="hidden sm:inline text-[#e0efe6]">
            {config.secondaryText}
          </span>
          <span className="hidden md:inline text-emerald-300">·</span>
          <span className="hidden md:inline text-[#e0efe6]">
            {config.shippingText}
          </span>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-emerald-200 hover:text-white transition-colors rounded hover:bg-[#00632d]"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
