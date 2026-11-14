import { Check, Copy, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AemStudioDrawer, type PreviewViewport } from './components/AemStudioDrawer';
import { EditorialBundleComponent } from './components/aem/EditorialBundleComponent';
import { HeroBannerComponent } from './components/aem/HeroBannerComponent';
import { OfferStripComponent } from './components/aem/OfferStripComponent';
import { ProductGridComponent } from './components/aem/ProductGridComponent';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { INITIAL_CAMPAIGNS, PRODUCTS } from './data/campaigns';
import type {
  AemComponentNode,
  CampaignPage,
  CartItem,
  Product,
  ProductCategory,
} from './types/aem';

export default function App() {
  const [campaigns, setCampaigns] = useState<CampaignPage[]>(INITIAL_CAMPAIGNS);
  const [activeCampaignId, setActiveCampaignId] = useState<string>(INITIAL_CAMPAIGNS[0].id);

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [bannerCopied, setBannerCopied] = useState(false);

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'savings' | 'price-asc'>('featured');

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      productId: 'prod-monolith-lamp',
      variantId: 'brushed-silver',
      variantLabel: 'Brushed Aluminum',
      quantity: 1,
    },
  ]);
  const [activePromoCode, setActivePromoCode] = useState<string>('SOLSTICE20');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // AEM Page Studio & Layout Testing state
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('desktop');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  useEffect(() => {
    const gridComponent = activeCampaign.components.find(
      (c): c is Extract<AemComponentNode, { type: 'product-grid' }> =>
        c.type === 'product-grid'
    );
    if (gridComponent) {
      setActiveCategory(gridComponent.props.defaultCategory);
    }
    setActivePromoCode(activeCampaign.promoCode);
  }, [activeCampaignId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const handleAddToBag = (
    product: Product,
    variantId?: string,
    variantLabel?: string
  ) => {
    const chosenVariant =
      product.variants.find((v) => v.id === variantId) || product.variants[0];
    const resolvedId = chosenVariant.id;
    const resolvedLabel = variantLabel || chosenVariant.label;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.variantId === resolvedId
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.variantId === resolvedId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: resolvedId,
          variantLabel: resolvedLabel,
          quantity: 1,
        },
      ];
    });
    showToast(`Added ${product.name} to bag`);
  };

  const handleAddBundle = (productIds: string[]) => {
    productIds.forEach((id) => {
      const prod = PRODUCTS.find((p) => p.id === id);
      if (prod) {
        handleAddToBag(prod);
      }
    });
    showToast('Promotional studio bundle added to bag');
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (
    productId: string,
    variantId: string,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const handleApplyOfferFromStrip = (
    category: ProductCategory | 'All',
    code: string
  ) => {
    setActiveCategory(category);
    if (code !== 'AUTO-APPLIED' && code !== 'INCLUDED') {
      setActivePromoCode(code);
      showToast(`Filtered ${category} · Code ${code} active`);
    } else {
      showToast(`Showing ${category} seasonal editions`);
    }
    const collectionEl = document.getElementById('collection');
    if (collectionEl) {
      collectionEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyAnnouncementCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeCampaign.promoCode).catch(() => {});
    }
    setActivePromoCode(activeCampaign.promoCode);
    setBannerCopied(true);
    showToast(`Promo code ${activeCampaign.promoCode} copied and applied`);
    window.setTimeout(() => setBannerCopied(false), 1800);
  };

  // AEM Authoring handlers
  const handleToggleComponentVisibility = (componentId: string) => {
    setCampaigns((prev) =>
      prev.map((cmp) =>
        cmp.id !== activeCampaign.id
          ? cmp
          : {
              ...cmp,
              components: cmp.components.map((node) =>
                node.id === componentId
                  ? { ...node, visible: !node.visible }
                  : node
              ),
            }
      )
    );
  };

  const handleMoveComponent = (
    componentId: string,
    direction: 'up' | 'down'
  ) => {
    setCampaigns((prev) =>
      prev.map((cmp) => {
        if (cmp.id !== activeCampaign.id) return cmp;
        const idx = cmp.components.findIndex((c) => c.id === componentId);
        if (idx === -1) return cmp;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= cmp.components.length) return cmp;
        const nextComponents = [...cmp.components];
        const [removed] = nextComponents.splice(idx, 1);
        nextComponents.splice(targetIdx, 0, removed);
        return { ...cmp, components: nextComponents };
      })
    );
  };

  const handleUpdateComponentProps = (
    componentId: string,
    updatedProps: Record<string, unknown>
  ) => {
    setCampaigns((prev) =>
      prev.map((cmp) =>
        cmp.id !== activeCampaign.id
          ? cmp
          : {
              ...cmp,
              components: cmp.components.map((node) =>
                node.id === componentId
                  ? ({
                      ...node,
                      props: { ...node.props, ...updatedProps },
                    } as AemComponentNode)
                  : node
              ),
            }
      )
    );
  };

  const handleResetCampaign = () => {
    setCampaigns(INITIAL_CAMPAIGNS);
    setPreviewViewport('desktop');
    showToast('Restored default campaign configuration');
  };

  const totalBagCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const previewMaxWidthClass =
    previewViewport === 'mobile'
      ? 'max-w-[375px] mx-auto border-x border-[#D4D4CC] shadow-sm'
      : previewViewport === 'tablet'
        ? 'max-w-[768px] mx-auto border-x border-[#D4D4CC] shadow-sm'
        : 'w-full';

  return (
    <div className="min-h-screen bg-[#EFEFEA] text-[#141413] flex flex-col">
      <div className={`${previewMaxWidthClass} bg-[#F7F7F5] min-h-screen flex flex-col transition-all duration-200`}>
        {/* Slim Dismissible Top Promotional Announcement Bar (<= 38px) */}
        {!bannerDismissed && (
          <div className="bg-[#141413] text-[#F7F7F5] px-4 h-9 flex items-center justify-between gap-4 text-xs">
            <div className="w-6 shrink-0 hidden sm:block" aria-hidden="true" />
            <div className="flex items-center justify-center gap-3 min-w-0">
              <p className="truncate font-medium">
                {activeCampaign.announcementText}
              </p>
              <button
                type="button"
                onClick={handleCopyAnnouncementCode}
                className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-[#93C5FD] hover:text-white underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{activeCampaign.promoCode}</span>
                {bannerCopied ? (
                  <Check className="w-3 h-3" aria-hidden="true" />
                ) : (
                  <Copy className="w-3 h-3" aria-hidden="true" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss promotional announcement"
              className="p-1 text-[#A8A8A2] hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Strict 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-sm border-b border-[#E4E4DF]">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
            {/* Zone 1: Single-line Brand Wordmark */}
            <a
              href="#featured"
              className="font-display text-xl font-medium tracking-tight text-[#141413] whitespace-nowrap shrink-0"
            >
              Krona Studio
            </a>

            {/* Zone 2: 4 Clean Single-Line Nav Links */}
            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A4A46]"
            >
              <a
                href="#featured"
                className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Featured
              </a>
              <a
                href="#offers"
                className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Offers
              </a>
              <a
                href="#collection"
                className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Collection
              </a>
              <a
                href="#bundle-offer"
                className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Bundle
              </a>
            </nav>

            {/* Zone 3: 1 Primary Action */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer tabular-nums min-h-[40px]"
              >
                Bag ({totalBagCount})
              </button>
            </div>
          </div>
        </header>

        {/* Main Campaign Landing Page Content */}
        <main className="flex-1">
          {activeCampaign.components.map((component, idx) => {
            if (!component.visible) return null;

            const renderNode = () => {
              switch (component.type) {
                case 'hero-banner':
                  return (
                    <HeroBannerComponent
                      key={component.id}
                      props={component.props}
                      onPrimaryAction={() => {
                        document
                          .getElementById('collection')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onSecondaryAction={() => {
                        document
                          .getElementById('offers')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onApplyPromoCode={(code) => {
                        setActivePromoCode(code);
                        showToast(`Applied promotional code ${code}`);
                      }}
                      isAuthoringMode={isStudioOpen}
                      onSelectForAuthoring={() => {
                        setSelectedComponentId(component.id);
                        setIsStudioOpen(true);
                      }}
                    />
                  );
                case 'offer-strip':
                  return (
                    <OfferStripComponent
                      key={component.id}
                      props={component.props}
                      onSelectOffer={handleApplyOfferFromStrip}
                      isAuthoringMode={isStudioOpen}
                      onSelectForAuthoring={() => {
                        setSelectedComponentId(component.id);
                        setIsStudioOpen(true);
                      }}
                    />
                  );
                case 'product-grid':
                  return (
                    <ProductGridComponent
                      key={component.id}
                      props={component.props}
                      products={PRODUCTS}
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      onQuickView={(prod) => setSelectedProduct(prod)}
                      onAddToBag={(prod) => handleAddToBag(prod)}
                      isAuthoringMode={isStudioOpen}
                      onSelectForAuthoring={() => {
                        setSelectedComponentId(component.id);
                        setIsStudioOpen(true);
                      }}
                    />
                  );
                case 'editorial-bundle':
                  return (
                    <EditorialBundleComponent
                      key={component.id}
                      props={component.props}
                      onAddBundle={handleAddBundle}
                      isAuthoringMode={isStudioOpen}
                      onSelectForAuthoring={() => {
                        setSelectedComponentId(component.id);
                        setIsStudioOpen(true);
                      }}
                    />
                  );
                default:
                  return null;
              }
            };

            // Place the Campaign Switcher & AEM Studio Toolbar cleanly right after the first component (below the fold)
            if (idx === 0) {
              return (
                <div key={component.id}>
                  {renderNode()}
                  <section
                    aria-label="Campaign Switcher and Page Authoring Toolbar"
                    className="bg-[#EFEFEA] border-b border-[#E4E4DF]"
                  >
                    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-[#5A5A56] mr-1">
                          Campaign Page:
                        </span>
                        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#E4E4DF] rounded-md">
                          {campaigns.map((cmp) => {
                            const isCurrent = cmp.id === activeCampaign.id;
                            return (
                              <button
                                key={cmp.id}
                                type="button"
                                onClick={() => setActiveCampaignId(cmp.id)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                                    : 'text-[#4A4A46] hover:text-[#141413]'
                                }`}
                              >
                                {cmp.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {previewViewport !== 'desktop' && (
                          <span className="text-xs font-mono text-[#1D4ED8] tabular-nums">
                            Preview: {previewViewport === 'tablet' ? '768px' : '375px'}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsStudioOpen(true)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F7F7F5] border border-[#DCDCD5] text-xs font-semibold text-[#141413] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1D4ED8]" aria-hidden="true" />
                          <span>AEM Page Studio & Layout Audit</span>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              );
            }

            return renderNode();
          })}
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="bg-[#FFFFFF] border-t border-[#E4E4DF]">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 space-y-2">
              <p className="font-display text-xl font-medium text-[#141413]">
                Krona Studio
              </p>
              <p className="text-sm text-[#5A5A56] max-w-sm leading-relaxed">
                Architectural lighting, acoustic instruments, and small-batch home objects. Copenhagen · Zurich.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2 text-xs text-[#4A4A46]">
              <p className="font-semibold text-[#141413] mb-2">Active Campaigns</p>
              <ul className="space-y-1.5">
                {campaigns.map((cmp) => (
                  <li key={cmp.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCampaignId(cmp.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#1D4ED8] hover:underline underline-offset-4 cursor-pointer text-left"
                    >
                      {cmp.name} · {cmp.promoCode}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs text-[#4A4A46]">
              <p className="font-semibold text-[#141413] mb-2">Storefront Terms</p>
              <p>Complimentary express courier over $250</p>
              <p>30-day studio trial & prepaid returns</p>
              <p>5-year mechanical & luminaire warranty</p>
            </div>
          </div>

          <div className="border-t border-[#ECECE7]">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-[#5A5A56]">
              <span>© 2026 Krona Studio. All rights reserved.</span>
              <button
                type="button"
                onClick={() => setIsStudioOpen(true)}
                className="text-[#4A4A46] hover:text-[#141413] hover:underline underline-offset-4 cursor-pointer"
              >
                Open Component Authoring & Layout Audit
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToBag={(prod, varId, varLabel) => handleAddToBag(prod, varId, varLabel)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        products={PRODUCTS}
        activePromoCode={activePromoCode}
        onApplyPromoCode={setActivePromoCode}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />

      <AemStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        campaign={activeCampaign}
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
        onToggleVisibility={handleToggleComponentVisibility}
        onMoveComponent={handleMoveComponent}
        onUpdateComponentProps={handleUpdateComponentProps}
        onResetCampaign={handleResetCampaign}
        previewViewport={previewViewport}
        onChangeViewport={setPreviewViewport}
      />

      {/* Subtle Bottom Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-[#141413] text-white text-xs font-medium rounded-md shadow-lg flex items-center gap-2"
        >
          <Check className="w-3.5 h-3.5 text-[#60A5FA]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
