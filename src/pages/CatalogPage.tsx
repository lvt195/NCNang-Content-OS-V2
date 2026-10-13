import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, RefreshCw, X } from 'lucide-react';
import { Product, Category, FilterState, SortOption } from '../types/product';
import { productService } from '../services/productService';
import { filterProducts } from '../utils/filterProducts';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { getColorOption } from '../data/colors';
import { SITE_CONFIG } from '../config/site';

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
      // If searchQuery updated, reflect in URL
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

  const activeCategoryObj = categories.find((c) => c.id === filters.category);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
        onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <main style={{ flex: 1, paddingBottom: '4rem' }}>
        {/* Hero Banner */}
        <section
          style={{
            backgroundColor: 'var(--bg-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '2.5rem 0',
          }}
        >
          <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
            <span
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--accent-brown)',
                fontWeight: 600,
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Bộ Sưu Tập Tự Nhiên
            </span>
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                marginBottom: '0.75rem',
              }}
            >
              Không Gian Nhỏ, Giấc Ngủ Bình Yên
            </h1>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              Chăn ga, gối đũi wash mềm và linen mộc thoáng khí. Chọn màu sắc và kích thước bạn yêu thích để chúng mình tư vấn chi tiết nhé.
            </p>

            {/* Quick Category Navigation Pills */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
              }}
            >
              <button
                type="button"
                className={`filter-chip ${filters.category === 'all' ? 'active' : ''}`}
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
        <div className="container" style={{ paddingTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
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
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Toolbar: Results Count & Sorting */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {activeCategoryObj ? activeCategoryObj.name : 'Tất cả sản phẩm'}
                  </h2>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Tìm thấy {filteredProducts.length} sản phẩm phù hợp
                  </span>
                </div>

                {/* Sort selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
                  <label htmlFor="sort-select" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Sắp xếp:
                  </label>
                  <select
                    id="sort-select"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as SortOption })}
                    className="form-select"
                    style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.85rem',
                      width: 'auto',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  >
                    <option value="featured">Nổi bật nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                    <option value="name-asc">Tên: A – Z</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Tags */}
              {activeFilterCount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Đang lọc:</span>

                  {filters.category !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.3rem 0.6rem' }}>
                      Danh mục: {categories.find((c) => c.id === filters.category)?.name}
                      <button type="button" onClick={() => handleFilterChange({ category: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.type !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.3rem 0.6rem' }}>
                      Loại: {filters.type === 'combo' ? 'Bộ Combo' : 'Món lẻ'}
                      <button type="button" onClick={() => handleFilterChange({ type: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.priceRangeId !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.3rem 0.6rem' }}>
                      Giá: {SITE_CONFIG.priceRanges.find((r) => r.id === filters.priceRangeId)?.label}
                      <button type="button" onClick={() => handleFilterChange({ priceRangeId: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.color !== 'all' && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.3rem 0.6rem' }}>
                      Màu: {getColorOption(filters.color).label}
                      <button type="button" onClick={() => handleFilterChange({ color: 'all' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {filters.searchQuery && (
                    <span className="badge badge-draft" style={{ gap: '4px', padding: '0.3rem 0.6rem' }}>
                      Từ khóa: "{filters.searchQuery}"
                      <button type="button" onClick={() => handleFilterChange({ searchQuery: '' })}>
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    style={{ fontSize: '0.8rem', color: 'var(--accent-brown)', textDecoration: 'underline', marginLeft: '0.25rem' }}
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}

              {/* Product Grid / Loading / Empty States */}
              {loading ? (
                <div
                  style={{
                    padding: '4rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-brown)' }} />
                  <p>Đang tải danh mục sản phẩm...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="product-grid">
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
                    padding: '3.5rem 1.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <h3 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                    Không tìm thấy sản phẩm nào
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px' }}>
                    Rất tiếc, không có sản phẩm nào khớp với bộ lọc hiện tại. Bạn vui lòng thử tìm kiếm bằng từ khóa khác hoặc xóa bớt tiêu chí lọc.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
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
      `}</style>
    </div>
  );
};
