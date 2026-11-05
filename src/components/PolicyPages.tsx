import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, RefreshCw, Truck, Award, Printer, CheckCircle2 } from 'lucide-react';
import { useStoreData } from '../context/StoreDataContext';

export type PolicySlug =
  | 'privacy-policy'
  | 'terms-of-service'
  | 'refund-policy'
  | 'shipping-policy'
  | 'quality-certifications';

interface PolicyPagesProps {
  currentPolicySlug: PolicySlug;
  onSelectPolicy: (slug: PolicySlug) => void;
  onGoHome: () => void;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({
  currentPolicySlug,
  onSelectPolicy,
  onGoHome,
}) => {
  const { cmsPages, settings } = useStoreData();
  const activeDynamicPage = cmsPages.find((p) => p.slug === currentPolicySlug);

  const policiesList: { slug: PolicySlug; title: string; icon: any }[] = [
    { slug: 'privacy-policy', title: 'Privacy Policy', icon: ShieldCheck },
    { slug: 'terms-of-service', title: 'Terms of Service', icon: FileText },
    { slug: 'refund-policy', title: 'Refund & Return Policy', icon: RefreshCw },
    { slug: 'shipping-policy', title: 'Shipping & Delivery', icon: Truck },
    { slug: 'quality-certifications', title: 'Quality Certifications', icon: Award },
  ];

  return (
    <div className="bg-[#fbf7f0] min-h-screen pb-20">
      {/* Policy Page Header */}
      <div className="bg-[#1b261e] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#2d4233]">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8ee000] hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store Front</span>
          </button>

          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Theproteino Legal & Store Policies
          </h1>
          <p className="text-xs sm:text-sm text-[#a3b8aa]">
            Transparent, customer-first terms for India’s cleanest peanut nutrition brand.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7d705d] mb-3 px-2">
              Policy Documents
            </div>
            {policiesList.map((item) => {
              const IconComp = item.icon;
              const isActive = currentPolicySlug === item.slug;
              return (
                <button
                  key={item.slug}
                  onClick={() => onSelectPolicy(item.slug)}
                  className={`w-full text-left p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00632d] text-white shadow-md'
                      : 'bg-white hover:bg-[#f1e8d8] text-[#3d3121] border border-[#e4d6c0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4" />
                    <span>{item.title}</span>
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-[#8ee000]" />}
                </button>
              );
            })}

            <div className="p-4 bg-[#eaf4ec] rounded-2xl border border-[#c8e6c9] mt-6 text-xs text-[#00632d]">
              <div className="font-bold mb-1">Need direct assistance?</div>
              <div className="text-[11px] text-[#2e5c38]">
                Reach our customer care team at{' '}
                <span className="font-bold">{settings.shippingAndTax.supportEmail}</span> or WhatsApp at{' '}
                <span className="font-bold">{settings.shippingAndTax.supportPhone}</span>.
              </div>
            </div>
          </div>

          {/* Right Policy Document Viewport */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e4d6c0] p-6 sm:p-10 shadow-sm text-left">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0e7d8]">
              <div className="text-xs font-bold text-[#8a7c68] uppercase tracking-wider">
                Last Updated: {activeDynamicPage?.lastUpdated || 'November 2026'} · Official Document
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00632d] hover:underline cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>

            {activeDynamicPage ? (
              <div className="prose prose-sm max-w-none text-[#3d3121] space-y-4 text-xs sm:text-sm leading-relaxed">
                <h2 className="font-display text-2xl font-bold text-[#1a221b] mb-2">
                  {activeDynamicPage.title}
                </h2>
                <div
                  className="space-y-3"
                  dangerouslySetInnerHTML={{ __html: activeDynamicPage.contentHtml }}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
