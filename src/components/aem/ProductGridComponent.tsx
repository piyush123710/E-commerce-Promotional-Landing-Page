import { ArrowUpRight, Plus, Search } from 'lucide-react';
import { useMemo } from 'react';
import type { Product, ProductCategory, ProductGridProps } from '../../types/aem';
import { ResilientImage } from '../ResilientImage';

interface ProductGridComponentProps {
  props: ProductGridProps;
  products: Product[];
  activeCategory: ProductCategory | 'All';
  onCategoryChange: (cat: ProductCategory | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'featured' | 'savings' | 'price-asc';
  onSortChange: (sort: 'featured' | 'savings' | 'price-asc') => void;
  onQuickView: (product: Product) => void;
  onAddToBag: (product: Product) => void;
  isAuthoringMode?: boolean;
  onSelectForAuthoring?: () => void;
}

const CATEGORIES: Array<ProductCategory | 'All'> = ['All', 'Lighting', 'Audio', 'Objects'];

export function ProductGridComponent({
  props,
  products,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onQuickView,
  onAddToBag,
  isAuthoringMode = false,
  onSelectForAuthoring,
}: ProductGridComponentProps) {
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesCat = activeCategory === 'All' || p.category === activeCategory;
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.materialSpec.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.salePrice - b.salePrice);
    }
    if (sortBy === 'savings') {
      return [...list].sort(
        (a, b) =>
          (b.originalPrice - b.salePrice) / b.originalPrice -
          (a.originalPrice - a.salePrice) / a.originalPrice
      );
    }
    return list;
  }, [products, activeCategory, searchQuery, sortBy]);

  const gridColsClass =
    props.columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section
      id="collection"
      aria-label="Promotional Product Collection"
      data-aem-component="krona/components/commerce/product-grid"
      className={`border-b border-[#E4E4DF] bg-[#FFFFFF] ${
        isAuthoringMode ? 'ring-1 ring-inset ring-[#1D4ED8]/40' : ''
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-display text-3xl lg:text-[36px] font-medium text-[#141413] tracking-[-0.02em]">
                {props.sectionTitle}
              </h2>
              {isAuthoringMode && onSelectForAuthoring && (
                <button
                  type="button"
                  onClick={onSelectForAuthoring}
                  className="text-xs font-mono text-[#1D4ED8] hover:underline cursor-pointer"
                >
                  Edit Component: product-grid
                </button>
              )}
            </div>
            <p className="text-[15px] text-[#4A4A46] leading-relaxed">
              {props.sectionSubtitle}
            </p>
          </div>

          <p className="text-xs font-mono text-[#5A5A56] tabular-nums shrink-0">
            Showing {filteredProducts.length} of {products.length} Editions
          </p>
        </div>

        {/* Interactive Filter & Search Controls */}
        {props.showFilterBar && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#E4E4DF]">
            <div
              role="tablist"
              aria-label="Filter collection by category"
              className="inline-flex items-center gap-1 p-1 bg-[#F2F2EE] rounded-lg self-start"
            >
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onCategoryChange(category)}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                        : 'text-[#5A5A56] hover:text-[#141413]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <Search
                  className="w-4 h-4 text-[#787872] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search SKU or material..."
                  aria-label="Search products by name, SKU, or material"
                  className="w-full sm:w-56 pl-9 pr-3 py-2 text-xs bg-[#F7F7F5] border border-[#DCDCD5] rounded-md text-[#141413] placeholder:text-[#787872] min-h-[40px]"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-[#5A5A56]">
                <span className="whitespace-nowrap">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    onSortChange(e.target.value as 'featured' | 'savings' | 'price-asc')
                  }
                  aria-label="Sort products"
                  className="bg-[#F7F7F5] border border-[#DCDCD5] rounded-md px-3 py-2 text-xs font-medium text-[#141413] cursor-pointer min-h-[40px]"
                >
                  <option value="featured">Featured Edit</option>
                  <option value="savings">Highest Discount</option>
                  <option value="price-asc">Price: Low to High</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="border border-[#E4E4DF] rounded-lg bg-[#F7F7F5] py-16 px-6 text-center">
            <p className="font-display text-xl text-[#141413] mb-2">
              No matching studio editions
            </p>
            <p className="text-sm text-[#5A5A56] mb-5">
              Adjust your category filter or search query to view available seasonal offers.
            </p>
            <button
              type="button"
              onClick={() => {
                onCategoryChange('All');
                onSearchChange('');
              }}
              className="px-4 py-2 bg-[#141413] text-white text-xs font-semibold rounded-md hover:bg-[#2E2E2B] transition-colors cursor-pointer min-h-[40px]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-6 lg:gap-8`}>
            {filteredProducts.map((product) => {
              const savingsPct = Math.round(
                ((product.originalPrice - product.salePrice) / product.originalPrice) * 100
              );

              return (
                <article
                  key={product.id}
                  data-product-card="true"
                  className="group bg-[#FFFFFF] border border-[#E4E4DF] rounded-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div>
                    {/* 4:3 Uniform Image Backdrop */}
                    <button
                      type="button"
                      onClick={() => onQuickView(product)}
                      className="block w-full aspect-[4/3] bg-[#F2F2EE] overflow-hidden cursor-pointer text-left"
                      aria-label={`View details for ${product.name}`}
                    >
                      <ResilientImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        aspectClassName="w-full h-full"
                        fallbackTitle={product.name}
                      />
                    </button>

                    {/* Metadata & Title */}
                    <div className="p-5 pb-4">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#5A5A56] mb-1.5">
                        <span className="uppercase tracking-wider font-medium">
                          {product.category}
                        </span>
                        <span className="font-mono tabular-nums">{product.sku}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onQuickView(product)}
                        className="text-left w-full cursor-pointer"
                      >
                        <h3 className="text-base font-semibold text-[#141413] group-hover:text-[#1D4ED8] transition-colors leading-snug mb-1.5">
                          {product.name}
                        </h3>
                      </button>

                      <p className="text-xs text-[#5A5A56] line-clamp-2 leading-relaxed">
                        {product.materialSpec}
                      </p>
                    </div>
                  </div>

                  {/* Aligned Price & Action Baseline */}
                  <div className="px-5 pb-5 pt-3 border-t border-[#F0F0EB] flex items-center justify-between gap-3">
                    <div data-price-baseline="true" className="flex items-baseline gap-2.5">
                      <span className="text-[15px] font-semibold text-[#141413] tabular-nums">
                        ${product.salePrice}
                      </span>
                      <span className="text-xs text-[#787872] line-through tabular-nums">
                        ${product.originalPrice}
                      </span>
                      <span className="text-xs font-medium text-[#1D4ED8] tabular-nums">
                        -{savingsPct}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onQuickView(product)}
                        aria-label={`Inspect ${product.name}`}
                        className="p-2 text-[#5A5A56] hover:text-[#141413] hover:bg-[#F2F2EE] rounded-md transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                      >
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToBag(product)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#141413] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
