import { Check, Tag } from 'lucide-react';
import { useState } from 'react';
import type { OfferStripProps, ProductCategory } from '../../types/aem';

interface OfferStripComponentProps {
  props: OfferStripProps;
  onSelectOffer: (category: ProductCategory | 'All', code: string) => void;
  isAuthoringMode?: boolean;
  onSelectForAuthoring?: () => void;
}

export function OfferStripComponent({
  props,
  onSelectOffer,
  isAuthoringMode = false,
  onSelectForAuthoring,
}: OfferStripComponentProps) {
  const [appliedOfferId, setAppliedOfferId] = useState<string | null>(null);

  const handleApply = (offerId: string, category: ProductCategory | 'All', code: string) => {
    setAppliedOfferId(offerId);
    onSelectOffer(category, code);
    window.setTimeout(() => setAppliedOfferId(null), 1600);
  };

  return (
    <section
      id="offers"
      aria-label="Seasonal Promotional Offers"
      data-aem-component="krona/components/promo/offer-strip"
      className={`border-b border-[#E4E4DF] bg-[#F7F7F5] ${
        isAuthoringMode ? 'ring-1 ring-inset ring-[#1D4ED8]/40' : ''
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-10 lg:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl lg:text-[28px] font-medium text-[#141413] tracking-[-0.015em]">
              {props.sectionTitle}
            </h2>
            {isAuthoringMode && onSelectForAuthoring && (
              <button
                type="button"
                onClick={onSelectForAuthoring}
                className="text-xs font-mono text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Edit Component: offer-strip
              </button>
            )}
          </div>
          <p className="text-xs text-[#5A5A56] tabular-nums">{props.validThrough}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {props.offers.map((offer) => {
            const isApplied = appliedOfferId === offer.id;
            const isAuto = offer.code === 'AUTO-APPLIED' || offer.code === 'INCLUDED';

            return (
              <article
                key={offer.id}
                className="bg-[#FFFFFF] border border-[#E4E4DF] rounded-lg p-6 flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <span className="text-xs font-medium text-[#5A5A56] tracking-wide">
                      {offer.title}
                    </span>
                    <span className="text-xs font-mono text-[#5A5A56]">
                      {offer.targetCategory}
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-[#141413] tabular-nums tracking-tight mb-2">
                    {offer.offerValue}
                  </p>
                  <p className="text-sm text-[#4A4A46] leading-relaxed">
                    {offer.condition}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#ECECE7] flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-[#141413] tabular-nums">
                    {isAuto ? offer.code : `Code: ${offer.code}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApply(offer.id, offer.targetCategory, offer.code)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1.5 px-2.5 rounded hover:bg-[#1D4ED8]/5 min-h-[36px]"
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{isAuto ? 'Filter Items' : 'Apply Offer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
