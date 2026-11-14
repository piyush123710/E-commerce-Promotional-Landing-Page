import { ArrowRight, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import type { HeroBannerProps } from '../../types/aem';
import { ResilientImage } from '../ResilientImage';

interface HeroBannerComponentProps {
  props: HeroBannerProps;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onApplyPromoCode: (code: string) => void;
  isAuthoringMode?: boolean;
  onSelectForAuthoring?: () => void;
}

export function HeroBannerComponent({
  props,
  onPrimaryAction,
  onSecondaryAction,
  onApplyPromoCode,
  isAuthoringMode = false,
  onSelectForAuthoring,
}: HeroBannerComponentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(props.promoCode).catch(() => {});
    }
    onApplyPromoCode(props.promoCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const isSplitRight = props.layout === 'split-right';

  return (
    <section
      id="featured"
      aria-label="Featured Promotional Campaign"
      data-aem-component="krona/components/promo/hero-banner"
      className={`relative border-b border-[#E4E4DF] bg-[#FFFFFF] ${
        isAuthoringMode ? 'ring-1 ring-inset ring-[#1D4ED8]/40' : ''
      }`}
    >
      {isAuthoringMode && onSelectForAuthoring && (
        <div className="max-w-[1280px] mx-auto px-6 pt-3 flex justify-end">
          <button
            type="button"
            onClick={onSelectForAuthoring}
            className="text-xs font-mono text-[#1D4ED8] hover:underline cursor-pointer"
          >
            Edit Component: hero-banner
          </button>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Copy Column */}
          <div
            className={`lg:col-span-5 flex flex-col justify-between py-2 ${
              isSplitRight ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            <div>
              <p className="text-[13px] font-medium text-[#5A5A56] tracking-wide mb-4">
                {props.eyebrow}
              </p>
              <h1
                className="font-display font-medium text-[#141413] tracking-[-0.02em] leading-[1.08] mb-5"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
              >
                {props.headline}
              </h1>
              <p className="text-[15px] lg:text-base text-[#4A4A46] leading-[1.65] max-w-[48ch] mb-8">
                {props.subheadline}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
                >
                  <span>{props.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onSecondaryAction}
                  className="inline-flex items-center justify-center px-5 py-3 bg-[#F7F7F5] hover:bg-[#ECECE7] text-[#141413] border border-[#DCDCD5] text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
                >
                  {props.secondaryCtaLabel}
                </button>
              </div>

              <div className="pt-5 border-t border-[#E4E4DF] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5A5A56]">
                <span>{props.offerSummary}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 font-mono text-[#141413] hover:text-[#1D4ED8] transition-colors cursor-pointer py-1"
                  aria-label={`Copy and apply promotional code ${props.promoCode}`}
                >
                  <span>Code:</span>
                  <span className="font-medium underline underline-offset-4 decoration-[#C8C8C0]">
                    {props.promoCode}
                  </span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#5A5A56]" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Media Column */}
          <div
            className={`lg:col-span-7 ${
              isSplitRight ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[460px] rounded-lg overflow-hidden bg-[#EFEFEA] border border-[#E4E4DF]">
              <ResilientImage
                src={props.image}
                alt={props.imageAlt}
                className="w-full h-full object-cover"
                fallbackTitle={props.headline}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
