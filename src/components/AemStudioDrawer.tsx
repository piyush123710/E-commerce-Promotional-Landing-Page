import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  Monitor,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  AemComponentNode,
  CampaignPage,
  LayoutAuditCheck,
} from '../types/aem';

export type PreviewViewport = 'desktop' | 'tablet' | 'mobile';

interface AemStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignPage;
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onToggleVisibility: (componentId: string) => void;
  onMoveComponent: (componentId: string, direction: 'up' | 'down') => void;
  onUpdateComponentProps: (componentId: string, updatedProps: Record<string, unknown>) => void;
  onResetCampaign: () => void;
  previewViewport: PreviewViewport;
  onChangeViewport: (viewport: PreviewViewport) => void;
}

export function AemStudioDrawer({
  isOpen,
  onClose,
  campaign,
  selectedComponentId,
  onSelectComponent,
  onToggleVisibility,
  onMoveComponent,
  onUpdateComponentProps,
  onResetCampaign,
  previewViewport,
  onChangeViewport,
}: AemStudioDrawerProps) {
  const [activeTab, setActiveTab] = useState<'components' | 'layout'>('components');
  const [auditChecks, setAuditChecks] = useState<LayoutAuditCheck[]>([]);

  const selectedComponent: AemComponentNode | undefined =
    campaign.components.find((c) => c.id === selectedComponentId) ||
    campaign.components[0];

  const runDomLayoutAudit = () => {
    const checks: LayoutAuditCheck[] = [];

    // 1. Horizontal overflow check
    const docOverflow =
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    checks.push({
      id: 'overflow',
      name: 'Horizontal Overflow Prevention',
      category: 'CSS3',
      status: docOverflow ? 'warn' : 'pass',
      detail: docOverflow
        ? 'Horizontal scroll detected; inspect fixed-width elements.'
        : 'Document scrollWidth matches viewport clientWidth cleanly.',
      metric: `${document.documentElement.scrollWidth}px / ${document.documentElement.clientWidth}px`,
    });

    // 2. Semantic HTML5 Landmarks
    const hasHeader = Boolean(document.querySelector('header'));
    const hasMain = Boolean(document.querySelector('main'));
    const hasNav = Boolean(document.querySelector('nav'));
    const hasFooter = Boolean(document.querySelector('footer'));
    const landmarksOk = hasHeader && hasMain && hasNav && hasFooter;
    checks.push({
      id: 'html5-landmarks',
      name: 'HTML5 Semantic Landmarks',
      category: 'HTML5',
      status: landmarksOk ? 'pass' : 'warn',
      detail: 'Verifies <header>, <nav>, <main>, and <footer> structural tags.',
      metric: `${[hasHeader, hasNav, hasMain, hasFooter].filter(Boolean).length}/4 landmarks`,
    });

    // 3. Product Card 4:3 Image Uniformity
    const cardImages = Array.from(
      document.querySelectorAll('[data-product-card="true"] img')
    ) as HTMLImageElement[];
    let maxRatioVariance = 0;
    if (cardImages.length >= 2) {
      const ratios = cardImages
        .map((img) => {
          const rect = img.getBoundingClientRect();
          return rect.height > 0 ? rect.width / rect.height : 1.333;
        })
        .filter((r) => r > 0);
      if (ratios.length > 0) {
        const minR = Math.min(...ratios);
        const maxR = Math.max(...ratios);
        maxRatioVariance = ((maxR - minR) / minR) * 100;
      }
    }
    checks.push({
      id: 'aspect-ratio',
      name: 'Product Grid 4:3 Aspect Ratio Parity',
      category: 'CSS3',
      status: maxRatioVariance <= 1.5 ? 'pass' : 'warn',
      detail: 'Confirms consistent card media framing across grid rows.',
      metric: `${maxRatioVariance.toFixed(2)}% variance`,
    });

    // 4. Price Baseline Alignment
    const baselines = Array.from(
      document.querySelectorAll('[data-price-baseline="true"]')
    );
    let baselineSpread = 0;
    if (baselines.length >= 2) {
      const firstRowTops = baselines
        .slice(0, 3)
        .map((el) => Math.round(el.getBoundingClientRect().top));
      baselineSpread = Math.max(...firstRowTops) - Math.min(...firstRowTops);
    }
    checks.push({
      id: 'baseline-align',
      name: 'Flexbox Price Baseline Alignment',
      category: 'Responsive',
      status: baselineSpread <= 4 || previewViewport === 'mobile' ? 'pass' : 'warn',
      detail: 'Checks vertical parity of price rows across adjacent cards.',
      metric: `${baselineSpread}px delta`,
    });

    // 5. Image Alt & Referrer Policy
    const allImgs = Array.from(document.querySelectorAll('img'));
    const validImgs = allImgs.filter(
      (img) => img.hasAttribute('alt') && img.getAttribute('alt')?.trim() !== ''
    );
    checks.push({
      id: 'accessibility-img',
      name: 'Accessible Alt Attributes on Media',
      category: 'Accessibility',
      status: validImgs.length === allImgs.length ? 'pass' : 'warn',
      detail: 'All campaign and product images carry descriptive alt text.',
      metric: `${validImgs.length}/${allImgs.length} verified`,
    });

    setAuditChecks(checks);
  };

  useEffect(() => {
    if (isOpen && activeTab === 'layout') {
      const timer = window.setTimeout(runDomLayoutAudit, 120);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, activeTab, previewViewport, campaign]);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="AEM Component Authoring and Layout Studio"
      className="fixed inset-y-0 left-0 z-50 w-full max-w-[420px] bg-[#FFFFFF] border-r border-[#E4E4DF] flex flex-col justify-between shadow-xl"
    >
      {/* Studio Header */}
      <div className="px-5 py-4 border-b border-[#E4E4DF] flex items-center justify-between gap-3 bg-[#F7F7F5]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1D4ED8]" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-[#141413]">
              AEM Page Studio
            </h2>
            <p className="text-[11px] font-mono text-[#5A5A56] truncate max-w-[260px]">
              /content/krona/{campaign.slug}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close AEM Page Studio"
          className="p-2 text-[#5A5A56] hover:text-[#141413] hover:bg-[#EAEAE4] rounded-md transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Mode Switch Tabs */}
      <div className="px-5 pt-3 pb-2 border-b border-[#E4E4DF] flex gap-1 bg-[#FFFFFF]">
        <button
          type="button"
          onClick={() => setActiveTab('components')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer min-h-[38px] ${
            activeTab === 'components'
              ? 'bg-[#141413] text-white'
              : 'text-[#5A5A56] hover:text-[#141413] hover:bg-[#F7F7F5]'
          }`}
        >
          Reusable Components
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer min-h-[38px] ${
            activeTab === 'layout'
              ? 'bg-[#141413] text-white'
              : 'text-[#5A5A56] hover:text-[#141413] hover:bg-[#F7F7F5]'
          }`}
        >
          CSS3 & Layout Audit
        </button>
      </div>

      {/* Scrollable Studio Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'components' ? (
          <>
            {/* Component Tree */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-[#141413]">
                  Page Component Order
                </span>
                <button
                  type="button"
                  onClick={onResetCampaign}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5A5A56] hover:text-[#141413] cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <div className="space-y-2">
                {campaign.components.map((cmp, index) => {
                  const isSelected = selectedComponent?.id === cmp.id;
                  return (
                    <div
                      key={cmp.id}
                      className={`border rounded-md p-3 transition-colors ${
                        isSelected
                          ? 'border-[#1D4ED8] bg-[#1D4ED8]/[0.03]'
                          : 'border-[#E4E4DF] bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectComponent(cmp.id)}
                          className="text-left flex-1 min-w-0 cursor-pointer"
                        >
                          <p className="text-xs font-semibold text-[#141413] truncate">
                            {index + 1}. {cmp.label}
                          </p>
                          <p className="text-[11px] font-mono text-[#5A5A56] truncate">
                            {cmp.resourceType}
                          </p>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => onMoveComponent(cmp.id, 'up')}
                            aria-label={`Move ${cmp.label} up`}
                            className="p-1.5 rounded text-[#5A5A56] hover:text-[#141413] hover:bg-[#F2F2EE] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={index === campaign.components.length - 1}
                            onClick={() => onMoveComponent(cmp.id, 'down')}
                            aria-label={`Move ${cmp.label} down`}
                            className="p-1.5 rounded text-[#5A5A56] hover:text-[#141413] hover:bg-[#F2F2EE] disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(cmp.id)}
                            aria-label={
                              cmp.visible ? `Hide ${cmp.label}` : `Show ${cmp.label}`
                            }
                            className={`p-1.5 rounded cursor-pointer ${
                              cmp.visible
                                ? 'text-[#141413] hover:bg-[#F2F2EE]'
                                : 'text-[#9A9A94] hover:bg-[#F2F2EE]'
                            }`}
                          >
                            {cmp.visible ? (
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Component Properties Dialog Editor */}
            {selectedComponent && (
              <div className="pt-5 border-t border-[#E4E4DF] space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#141413]">
                    Component Dialog Properties
                  </p>
                  <p className="text-[11px] font-mono text-[#5A5A56]">
                    {selectedComponent.label}
                  </p>
                </div>

                {selectedComponent.type === 'hero-banner' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Campaign Eyebrow
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.props.eyebrow}
                        onChange={(e) =>
                          onUpdateComponentProps(selectedComponent.id, {
                            eyebrow: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Hero Headline
                      </label>
                      <textarea
                        rows={2}
                        value={selectedComponent.props.headline}
                        onChange={(e) =>
                          onUpdateComponentProps(selectedComponent.id, {
                            headline: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                          CTA Label
                        </label>
                        <input
                          type="text"
                          value={selectedComponent.props.ctaLabel}
                          onChange={(e) =>
                            onUpdateComponentProps(selectedComponent.id, {
                              ctaLabel: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                          Promo Code
                        </label>
                        <input
                          type="text"
                          value={selectedComponent.props.promoCode}
                          onChange={(e) =>
                            onUpdateComponentProps(selectedComponent.id, {
                              promoCode: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-mono bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Split Alignment
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['split-left', 'split-right'] as const).map((layoutOpt) => (
                          <button
                            key={layoutOpt}
                            type="button"
                            onClick={() =>
                              onUpdateComponentProps(selectedComponent.id, {
                                layout: layoutOpt,
                              })
                            }
                            className={`py-2 px-3 text-xs font-medium rounded-md border cursor-pointer ${
                              selectedComponent.props.layout === layoutOpt
                                ? 'border-[#141413] bg-[#F7F7F5] text-[#141413]'
                                : 'border-[#DCDCD5] text-[#5A5A56]'
                            }`}
                          >
                            {layoutOpt === 'split-left' ? 'Copy Left' : 'Copy Right'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedComponent.type === 'offer-strip' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.props.sectionTitle}
                        onChange={(e) =>
                          onUpdateComponentProps(selectedComponent.id, {
                            sectionTitle: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Validity Window
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.props.validThrough}
                        onChange={(e) =>
                          onUpdateComponentProps(selectedComponent.id, {
                            validThrough: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                      />
                    </div>
                  </div>
                )}

                {selectedComponent.type === 'product-grid' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Collection Heading
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.props.sectionTitle}
                        onChange={(e) =>
                          onUpdateComponentProps(selectedComponent.id, {
                            sectionTitle: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Desktop Column Count
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {([3, 2] as const).map((cols) => (
                          <button
                            key={cols}
                            type="button"
                            onClick={() =>
                              onUpdateComponentProps(selectedComponent.id, { columns: cols })
                            }
                            className={`py-2 px-3 text-xs font-medium rounded-md border cursor-pointer ${
                              selectedComponent.props.columns === cols
                                ? 'border-[#141413] bg-[#F7F7F5] text-[#141413]'
                                : 'border-[#DCDCD5] text-[#5A5A56]'
                            }`}
                          >
                            {cols}-Column Grid
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-[#141413] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={selectedComponent.props.showFilterBar}
                        onChange={(e) =>
                          onUpdateComponentProps(selectedComponent.id, {
                            showFilterBar: e.target.checked,
                          })
                        }
                        className="rounded border-[#DCDCD5]"
                      />
                      <span>Display Category & Search Toolbar</span>
                    </label>
                  </div>
                )}

                {selectedComponent.type === 'editorial-bundle' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                        Bundle Headline
                      </label>
                      <input
                        type="text"
                        value={selectedComponent.props.headline}
                        onChange={(e) =>
                          onUpdateComponentProps(selectedComponent.id, {
                            headline: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                          Promotional Price ($)
                        </label>
                        <input
                          type="number"
                          value={selectedComponent.props.bundlePrice}
                          onChange={(e) =>
                            onUpdateComponentProps(selectedComponent.id, {
                              bundlePrice: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#5A5A56] mb-1">
                          CTA Button Label
                        </label>
                        <input
                          type="text"
                          value={selectedComponent.props.ctaLabel}
                          onChange={(e) =>
                            onUpdateComponentProps(selectedComponent.id, {
                              ctaLabel: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {/* Breakpoint Tester */}
            <div>
              <p className="text-xs font-semibold text-[#141413] mb-2">
                Responsive Breakpoint Preview
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'desktop', label: 'Desktop', icon: Monitor },
                    { id: 'tablet', label: '768px', icon: Tablet },
                    { id: 'mobile', label: '375px', icon: Smartphone },
                  ] as const
                ).map(({ id, label, icon: Icon }) => {
                  const active = previewViewport === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onChangeViewport(id)}
                      className={`py-2.5 px-3 rounded-md border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                        active
                          ? 'border-[#1D4ED8] bg-[#1D4ED8]/5 text-[#1D4ED8]'
                          : 'border-[#DCDCD5] text-[#5A5A56] hover:text-[#141413]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live CSS3 & HTML5 Consistency Checks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#141413]">
                  HTML5 & CSS3 Consistency Checks
                </p>
                <button
                  type="button"
                  onClick={runDomLayoutAudit}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" aria-hidden="true" />
                  <span>Re-test</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {auditChecks.map((chk) => (
                  <div
                    key={chk.id}
                    className="border border-[#E4E4DF] rounded-md p-3.5 bg-[#FFFFFF]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {chk.status === 'pass' ? (
                          <CheckCircle2
                            className="w-4 h-4 text-[#15803D] shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <AlertTriangle
                            className="w-4 h-4 text-[#B45309] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span className="text-xs font-semibold text-[#141413]">
                          {chk.name}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-medium shrink-0 ${
                          chk.status === 'pass' ? 'text-[#15803D]' : 'text-[#B45309]'
                        }`}
                      >
                        {chk.status === 'pass' ? 'Pass' : 'Review'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A5A56] leading-relaxed mb-1.5">
                      {chk.detail}
                    </p>
                    <p className="text-[11px] font-mono text-[#363633] tabular-nums">
                      {chk.category} · {chk.metric}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Studio Footer */}
      <div className="px-5 py-3.5 border-t border-[#E4E4DF] bg-[#F7F7F5] flex items-center justify-between text-xs text-[#5A5A56]">
        <span>Changes apply live to preview</span>
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 bg-[#141413] text-white text-xs font-semibold rounded-md hover:bg-[#2E2E2B] cursor-pointer"
        >
          Done
        </button>
      </div>
    </aside>
  );
}
