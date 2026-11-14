import { Check, PackagePlus } from 'lucide-react';
import { useState } from 'react';
import type { EditorialBundleProps } from '../../types/aem';
import { ResilientImage } from '../ResilientImage';

interface EditorialBundleComponentProps {
  props: EditorialBundleProps;
  onAddBundle: (productIds: string[]) => void;
  isAuthoringMode?: boolean;
  onSelectForAuthoring?: () => void;
}

export function EditorialBundleComponent({
  props,
  onAddBundle,
  isAuthoringMode = false,
  onSelectForAuthoring,
}: EditorialBundleComponentProps) {
  const [added, setAdded] = useState(false);

  const handleAddBundle = () => {
    onAddBundle(props.bundleProductIds);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const savings = Math.max(0, props.bundleComparePrice - props.bundlePrice);

  return (
    <section
      id="bundle-offer"
      aria-label="Seasonal Bundle Offer"
      data-aem-component="krona/components/promo/editorial-bundle"
      className={`border-b border-[#E4E4DF] bg-[#F7F7F5] ${
        isAuthoringMode ? 'ring-1 ring-inset ring-[#1D4ED8]/40' : ''
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="bg-[#FFFFFF] border border-[#E4E4DF] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Image Column */}
          <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] bg-[#EBEBE6]">
            <ResilientImage
              src={props.image}
              alt={props.imageAlt}
              className="w-full h-full object-cover"
              fallbackTitle={props.bundleTitle}
            />
          </div>

          {/* Bundle Offer Copy Column */}
          <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between gap-8">
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-medium text-[#1D4ED8] tracking-wide">
                  {props.eyebrow}
                </span>
                {isAuthoringMode && onSelectForAuthoring && (
                  <button
                    type="button"
                    onClick={onSelectForAuthoring}
                    className="text-xs font-mono text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    Edit Component: editorial-bundle
                  </button>
                )}
              </div>

              <h2 className="font-display text-3xl font-medium text-[#141413] tracking-[-0.02em] leading-[1.15] mb-4">
                {props.headline}
              </h2>

              <p className="text-[15px] text-[#4A4A46] leading-relaxed mb-6">
                {props.body}
              </p>

              <ul className="space-y-2.5 border-t border-[#ECECE7] pt-5">
                {props.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-[#363633]"
                  >
                    <Check
                      className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#E4E4DF] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono text-[#5A5A56] mb-1">
                  {props.bundleSku} · {props.bundleTitle}
                </p>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-semibold text-[#141413] tabular-nums">
                    ${props.bundlePrice}
                  </span>
                  <span className="text-sm text-[#787872] line-through tabular-nums">
                    ${props.bundleComparePrice}
                  </span>
                  <span className="text-xs font-semibold text-[#15803D] tabular-nums">
                    Save ${savings}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddBundle}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    <span>Bundle Added</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4" aria-hidden="true" />
                    <span>{props.ctaLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
