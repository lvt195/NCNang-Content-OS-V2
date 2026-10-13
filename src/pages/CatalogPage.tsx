import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import { Product, Category, FilterState, SortOption } from '../types/product';
import { productService } from '../services/productService';
import { filterProducts } from '../utils/filterProducts';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { getColorOption } from '../data/colors';
import { SITE_CONFIG } from '../config/site';
import { analyticsService } from '../services/analyticsService';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Read initial query params from URL if present
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'all';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    priceRangeId: 'all',
    color: 'all',
    type: 'all',
    searchQuery: initialSearch,
    sortBy: 'featured',
  });

  // Sync searchQuery with URL query parameter
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== filters.searchQuery) {
      setFilters((prev) => ({ ...prev, searchQuery: q }));
    }
  }, [searchParams]);

  // Track site visit on mount
  useEffect(() => {
    analyticsService.trackSiteVisit();
  }, []);

  // Fetch published products and categories on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          productService.getPublishedProducts(),
          productService.getCategories(),
        ]);
        if (mounted) {
          setProducts(prods);
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load catalog data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      if (updates.searchQuery !== undefined) {
        if (updates.searchQuery) {
          setSearchParams({ q: updates.searchQuery }, { replace: true });
        } else {
          searchParams.delete('q');
          setSearchParams(searchParams, { replace: true });
        }
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      priceRangeId: 'all',
      color: 'all',
      type: 'all',
      searchQuery: '',
      sortBy: 'featured',
    });
    setSearchParams({}, { replace: true });
  };

  // Compute filtered & sorted products with AND logic
  const filteredProducts = useMemo(() => {
    return filterProducts(products, filters);
  }, [products, filters]);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.priceRangeId && filters.priceRangeId !== 'all') count++;
    if (filters.color && filters.color !== 'all') count++;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
      <Header
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
      />

      <main style={{ flex: 1, paddingBottom: '3.5rem', width: '100%', overflowX: 'hidden' }}>
        {/* Compact Hero Section */}
        <section
          style={{
            backgroundColor: 'var(--bg-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.25rem 0 1rem',
            width: '100%',
          }}
        >
          <div className="container" style={{ textAlign: 'center' }}>
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                marginBottom: '0.35rem',
              }}
            >
              Không Gian Nhỏ, Giấc Ngủ Bình Yên
            </h1>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                maxWidth: '560px',
                margin: '0 auto',
              }}
            >
              Chăn ga, gối đũi wash mềm và linen tự nhiên thoáng khí cho phòng ngủ mộc mạc.
            </p>

            {/* Quick Category Navigation Pills (Horizontally scrollable on mobile) */}
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                overflowX: 'auto',
                paddingTop: '0.85rem',
                paddingBottom: '0.25rem',
                justifyContent: 'flex-start',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
              className="category-scroll-row"
            >
              <button
                type="button"
                className={`filter-chip ${filters.category === 'all' ? 'active' : ''}`}
                style={{ flexShrink: 0, fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                onClick={() => handleFilterChange({ category: 'all' })}
              >
                Tất cả ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-chip ${filters.category === cat.id ? 'active' : ''}`}
                    style={{ flexShrink: 0, fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}
                    onClick={() => handleFilterChange({ category: cat.id })}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Catalog Main Content */}
        <div className="container" style={{ paddingTop: '1.25rem', width: '100%' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }}>
            {/* Desktop Filters Sidebar */}
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              categories={categories}
              isMobileDrawerOpen={isMobileDrawerOpen}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
              totalFilteredCount={filteredProducts.length}
            />

            {/* Product Grid Area */}
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              {/* Toolbar: Filter Button + Sorting placed TOGETHER */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: Product count */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> sản phẩm
                </div>

                {/* Right: Filter button & Sort dropdown side-by-side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' }}>
                  {/* Filter button for mobile/tablet right here */}
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className="btn btn-outline btn-sm mobile-toolbar-filter-btn"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.825rem',
                      gap: '0.4rem',
                      backgroundColor: activeFilterCount > 0 ? 'var(--accent-warm-tint)' : 'transparent',
                      borderColor: activeFilterCount > 0 ? 'var(--accent-brown)' : 'var(--border-subtle)',
                      color: activeFilterCount > 0 ? 'var(--accent-brown)' : 'var(--text-primary)',
                      fontWeight: activeFilterCount > 0 ? 600 : 500,
                    }}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Bộ lọc</span>
                    {activeFilterCount > 0 && (
                      <span
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-brown)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Sort selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
                    <select
                      id="sort-select"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange({ sortBy: e.target.value as SortOption })}
                      className="form-select"
                      style={{
                        padding: '0.35rem 0.55rem',
                        fontSize: '0.825rem',
                        width: 'auto',
                        backgroundColor: 'var(--bg-surface)',
                        cursor: 'pointer',
                      }}
                      aria-label="Sắp xếp sản phẩm"
                    >
                      <option value="featured">Nổi bật nhất</option>
                      <option value="price-asc">Giá: Thấp đến cao</option>
                      <option value="price-desc">Giá: Cao đến thấp</option>
                      <option value="name-asc">Tên: A – Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Tags */}
              {activeFilterCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Lọc:</span>

                  {filters.category !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      {categories.find((c) => c.id === filters.category)?.name}
                      <button type="button" onClick={() => handleFilterChange({ category: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.type !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      {filters.type === 'combo' ? 'Combo' : 'Món lẻ'}
                      <button type="button" onClick={() => handleFilterChange({ type: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.priceRangeId !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      {SITE_CONFIG.priceRanges.find((r) => r.id === filters.priceRangeId)?.label}
                      <button type="button" onClick={() => handleFilterChange({ priceRangeId: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.color !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      Màu {getColorOption(filters.color).label.split(' / ')[0]}
                      <button type="button" onClick={() => handleFilterChange({ color: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.searchQuery && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      "{filters.searchQuery}"
                      <button type="button" onClick={() => handleFilterChange({ searchQuery: '' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{ fontSize: '0.775rem', color: 'var(--accent-brown)', textDecoration: 'underline', marginLeft: '0.25rem' }}
                  >
                    Xóa lọc
                  </button>
                </div>
              )}

              {/* Product Grid / Loading / Empty States */}
              {loading ? (
                <div
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <RefreshCw size={24} className="spin" style={{ color: 'var(--accent-brown)' }} />
                  <p style={{ fontSize: '0.9rem' }}>Đang tải danh mục sản phẩm...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="product-grid" style={{ width: '100%' }}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '3rem 1.25rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                    Không có sản phẩm nào khớp với bộ lọc hiện tại. Bạn vui lòng thử chọn danh mục khác hoặc xóa bộ lọc.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleResetFilters}
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }

        .category-scroll-row {
          justify-content: flex-start;
        }

        @media (min-width: 768px) {
          .category-scroll-row {
            justify-content: center;
          }
          .mobile-toolbar-filter-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
