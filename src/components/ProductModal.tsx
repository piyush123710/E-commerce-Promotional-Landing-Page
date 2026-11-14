import { Check, ShieldCheck, Truck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Product } from '../types/aem';
import { ResilientImage } from './ResilientImage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToBag: (product: Product, variantId: string, variantLabel: string) => void;
}

export function ProductModal({ product, onClose, onAddToBag }: ProductModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
      setAddedFeedback(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const savingsAmount = product.originalPrice - product.salePrice;
  const savingsPct = Math.round((savingsAmount / product.originalPrice) * 100);

  const handleAdd = () => {
    onAddToBag(product, activeVariant.id, activeVariant.label);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFFFF] border border-[#E4E4DF] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Gallery Column */}
        <div className="md:col-span-6 bg-[#F2F2EE] relative aspect-[4/3] md:aspect-auto md:min-h-[440px]">
          <ResilientImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            fallbackTitle={product.name}
          />
        </div>

        {/* Right Contiguous Purchase Module */}
        <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-xs font-mono text-[#5A5A56] uppercase tracking-wider">
                {product.category} · {product.sku}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close product details"
                className="p-2 -mr-2 -mt-2 text-[#5A5A56] hover:text-[#141413] hover:bg-[#F2F2EE] rounded-md transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <h2
              id="pdp-modal-title"
              className="font-display text-2xl sm:text-3xl font-medium text-[#141413] tracking-[-0.015em] mb-3"
            >
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-semibold text-[#141413] tabular-nums">
                ${product.salePrice}
              </span>
              <span className="text-sm text-[#787872] line-through tabular-nums">
                ${product.originalPrice}
              </span>
              <span className="text-xs font-semibold text-[#1D4ED8] tabular-nums">
                Save ${savingsAmount} ({savingsPct}% off)
              </span>
            </div>

            <p className="text-sm text-[#4A4A46] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-[#141413] mb-2.5">
                Finish: <span className="font-normal text-[#5A5A56]">{activeVariant.label}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const isSelected = variant.id === activeVariant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer min-h-[40px] ${
                        isSelected
                          ? 'border-[#141413] bg-[#F7F7F5] text-[#141413]'
                          : 'border-[#DCDCD5] bg-[#FFFFFF] text-[#5A5A56] hover:border-[#A8A8A0]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: variant.swatchHex }}
                        aria-hidden="true"
                      />
                      <span>{variant.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specifications */}
            <dl className="border-t border-[#ECECE7] pt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-[#5A5A56]">Materials</dt>
                <dd className="text-[#141413] font-medium text-right">{product.materialSpec}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#5A5A56]">Dimensions</dt>
                <dd className="text-[#141413] font-mono tabular-nums text-right">
                  {product.dimensions}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#5A5A56]">Availability</dt>
                <dd className="text-[#15803D] font-medium text-right">{product.availability}</dd>
              </div>
            </dl>
          </div>

          {/* Primary Purchase Action */}
          <div className="pt-4 border-t border-[#E4E4DF] space-y-3">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3.5 px-6 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-sm font-semibold rounded-md transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              {addedFeedback ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <span>Add to Bag · ${product.salePrice}</span>
              )}
            </button>
            <div className="flex items-center justify-between text-xs text-[#5A5A56] pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                Free shipping over $250
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                5-year studio warranty
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
