import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowUpDown,
  RefreshCw,
  X,
  SlidersHorizontal,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
} from 'lucide-react';
import { Product, Category, FilterState, SortOption } from '../types/product';
import { productService } from '../services/productService';
import { filterProducts, cleanProductDescription } from '../utils/filterProducts';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductFilters } from '../components/ProductFilters';
import { getColorOption } from '../data/colors';
import { SITE_CONFIG } from '../config/site';
import { analyticsService } from '../services/analyticsService';
import { formatVND } from '../utils/formatCurrency';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewImgIdx, setQuickViewImgIdx] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);

  // User Draggable Column Slider (1 to 5 columns on desktop, 1 to 3 on mobile/tablet)
  const [catalogCols, setCatalogCols] = useState<number>(() => {
    const saved = localStorage.getItem('catalog_column_count');
    return saved ? Math.max(1, Math.min(5, parseInt(saved, 10))) : 4;
  });

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSortOpen]);

  // Keyboard navigation for Quick View Modal
  useEffect(() => {
    if (!quickViewProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickViewProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct]);

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: 'featured', label: 'Nổi bật' },
    { id: 'price-asc', label: 'Giá: Thấp - Cao' },
    { id: 'price-desc', label: 'Giá: Cao - Thấp' },
    { id: 'name-asc', label: 'Tên: A – Z' },
  ];

  const handleCatalogColsChange = (cols: number) => {
    const clamped = Math.max(1, Math.min(5, cols));
    setCatalogCols(clamped);
    localStorage.setItem('catalog_column_count', clamped.toString());
  };

  // Read initial query params from URL if present
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'all';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    categories: initialCategory !== 'all' ? [initialCategory] : [],
    priceRangeId: 'all',
    priceRanges: [],
    color: 'all',
    colors: [],
    type: 'all',
    types: [],
    searchQuery: initialSearch,
    sortBy: 'featured',
  });

  // Sync searchQuery and category with URL query parameter
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('cat') || 'all';

    setFilters((prev) => {
      let changed = false;
      const updates: Partial<FilterState> = {};

      if (q !== null && q !== prev.searchQuery) {
        updates.searchQuery = q;
        changed = true;
      }
      if (cat !== prev.category) {
        updates.category = cat;
        updates.categories = cat !== 'all' ? [cat] : [];
        changed = true;
      }

      return changed ? { ...prev, ...updates } : prev;
    });
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
        categories={categories}
        onSelectCategory={(catId) =>
          handleFilterChange({
            category: catId,
            categories: catId === 'all' ? [] : [catId],
          })
        }
      />

      <main style={{ flex: 1, paddingBottom: '3.5rem', width: '100%', overflowX: 'hidden' }}>
        {/* Compact Hero Section */}
        <section
          style={{
            backgroundColor: 'var(--bg-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.65rem 0 1.35rem',
            width: '100%',
          }}
        >
          <div className="container" style={{ textAlign: 'center' }}>
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(1.65rem, 4.8vw, 2.35rem)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                marginBottom: '0.55rem',
                letterSpacing: '-0.01em',
              }}
            >
              Không Gian Nhỏ, Giấc Ngủ Bình Yên
            </h1>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.6vw, 1.1rem)',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '620px',
                margin: '0 auto',
              }}
            >
              Chăn ga, gối đũi wash mềm và linen tự nhiên thoáng khí cho phòng ngủ mộc mạc.
            </p>
          </div>
        </section>

        {/* Catalog Main Content */}
        <div className="container" style={{ paddingTop: '1.25rem', width: '100%' }}>
          {/* Toolbar: Filter Button + Sorting placed TOGETHER */}
          {/* Responsive Toolbar: Filter, Sort & Draggable Zoom Slider */}
          <div className="catalog-toolbar-wrap">
            {/* Top row: Product Count + Filter + Sort */}
            <div className="catalog-toolbar-top">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> sản phẩm
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {/* Universal Filter button for desktop & mobile */}
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="btn btn-outline btn-sm filter-toggle-btn"
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.8rem',
                    gap: '0.35rem',
                    backgroundColor: (activeFilterCount > 0 || isFilterOpen) ? 'var(--accent-warm-tint)' : 'transparent',
                    borderColor: (activeFilterCount > 0 || isFilterOpen) ? 'var(--accent-brown)' : 'var(--border-subtle)',
                    color: (activeFilterCount > 0 || isFilterOpen) ? 'var(--accent-brown)' : 'var(--text-primary)',
                    fontWeight: (activeFilterCount > 0 || isFilterOpen) ? 600 : 500,
                  }}
                  title={isFilterOpen ? 'Thu lại bộ lọc' : 'Bung ra bộ lọc chi tiết'}
                >
                  <SlidersHorizontal size={13} />
                  <span>Bộ lọc</span>
                  {isFilterOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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

                {/* Custom Sort selector - eliminates Android detached spinner popup */}
                <div ref={sortRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      fontSize: '0.8rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                    aria-label="Sắp xếp sản phẩm"
                  >
                    <ArrowUpDown size={13} style={{ color: 'var(--accent-brown)' }} />
                    <span>{sortOptions.find((o) => o.id === filters.sortBy)?.label || 'Nổi bật'}</span>
                    <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {isSortOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 4px)',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                        zIndex: 100,
                        minWidth: '150px',
                        overflow: 'hidden',
                        padding: '4px',
                      }}
                    >
                      {sortOptions.map((opt) => {
                        const isSelected = filters.sortBy === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              handleFilterChange({ sortBy: opt.id });
                              setIsSortOpen(false);
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.5rem 0.75rem',
                              border: 'none',
                              backgroundColor: isSelected ? 'var(--accent-warm-tint)' : 'transparent',
                              color: isSelected ? 'var(--accent-brown)' : 'var(--text-primary)',
                              fontWeight: isSelected ? 600 : 400,
                              fontSize: '0.825rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.1s ease',
                            }}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check size={14} color="var(--accent-brown)" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Draggable Column Slider Bar */}
            <div className="catalog-zoom-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <Maximize2 size={13} style={{ color: 'var(--accent-brown)' }} />
                <span className="hidden-mobile">Cột hiển thị:</span>
              </div>

              <button
                type="button"
                onClick={() => handleCatalogColsChange(catalogCols - 1)}
                disabled={catalogCols <= 1}
                className="zoom-btn"
                title="Giảm số cột (Ảnh to hơn)"
                aria-label="Giảm số cột"
              >
                <ZoomOut size={13} />
              </button>

              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={catalogCols}
                onChange={(e) => handleCatalogColsChange(Number(e.target.value))}
                className="zoom-slider"
                style={{
                  flex: 1,
                  minWidth: '60px',
                  maxWidth: '120px',
                  verticalAlign: 'middle',
                }}
                title={`Số cột: ${catalogCols}`}
                aria-label="Thanh kéo số cột hiển thị"
              />

              <button
                type="button"
                onClick={() => handleCatalogColsChange(catalogCols + 1)}
                disabled={catalogCols >= 5}
                className="zoom-btn"
                title="Tăng số cột (Nhiều ảnh hơn)"
                aria-label="Tăng số cột"
              >
                <ZoomIn size={13} />
              </button>

              <span className="zoom-mode-badge">
                <span className="mobile-only">
                  {catalogCols === 1
                    ? '1 cột (Lướt xem)'
                    : catalogCols >= 3
                    ? '3 cột (Nhỏ)'
                    : '2 cột'}
                </span>
                <span className="desktop-only">
                  {catalogCols === 1
                    ? '1 cột (Lớn)'
                    : catalogCols === 5
                    ? '5 cột (Nhỏ)'
                    : `${catalogCols} cột`}
                </span>
              </span>
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
                      {getColorOption(filters.color).label}
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

              {/* Collapsible Filter Panel (Bung ra / Thu lại) */}
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                categories={categories}
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                totalFilteredCount={filteredProducts.length}
                products={products}
              />

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
                <div
                  className="catalog-products-grid"
                  style={{
                    ['--desktop-cols' as string]: Math.min(5, Math.max(1, catalogCols)),
                    ['--tablet-cols' as string]: Math.min(3, Math.max(1, catalogCols)),
                    ['--mobile-cols' as string]: Math.min(3, Math.max(1, catalogCols)),
                  }}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => {
                        setQuickViewProduct(p);
                        setQuickViewImgIdx(0);
                      }}
                    />
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
      </main>

      {/* Quick View Modal for Customer Storefront */}
      {quickViewProduct &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            {/* Backdrop */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setQuickViewProduct(null)}
            />

            {/* Modal Dialog Content - Clean, responsive Quick View */}
            {(() => {
              const currentProductIdx = filteredProducts.findIndex((p) => p.id === quickViewProduct.id);
              const totalProducts = filteredProducts.length;

              const handlePrevProduct = (e?: React.MouseEvent) => {
                e?.stopPropagation();
                if (totalProducts <= 1) return;
                const prevIdx = currentProductIdx <= 0 ? totalProducts - 1 : currentProductIdx - 1;
                setQuickViewProduct(filteredProducts[prevIdx]);
                setQuickViewImgIdx(0);
              };

              const handleNextProduct = (e?: React.MouseEvent) => {
                e?.stopPropagation();
                if (totalProducts <= 1) return;
                const nextIdx = currentProductIdx >= totalProducts - 1 ? 0 : currentProductIdx + 1;
                setQuickViewProduct(filteredProducts[nextIdx]);
                setQuickViewImgIdx(0);
              };

              const rawImages = quickViewProduct.images && quickViewProduct.images.length > 0
                ? quickViewProduct.images
                : (quickViewProduct.coverImage ? [quickViewProduct.coverImage] : ['/images/placeholder.webp']);

              const parsedQuickViewImages = rawImages.map((raw, idx) => {
                const [clean, colorTag] = raw.split('#color=');
                return {
                  raw,
                  clean,
                  colorId: colorTag ? decodeURIComponent(colorTag) : '',
                  originalIndex: idx,
                };
              });

              const safeImgIdx = Math.max(0, Math.min(quickViewImgIdx, parsedQuickViewImages.length - 1));
              const currentImgObj = parsedQuickViewImages[safeImgIdx] || parsedQuickViewImages[0];

              const handlePrevImg = (e?: React.MouseEvent) => {
                e?.stopPropagation();
                setQuickViewImgIdx((prev) => (prev <= 0 ? parsedQuickViewImages.length - 1 : prev - 1));
              };

              const handleNextImg = (e?: React.MouseEvent) => {
                e?.stopPropagation();
                setQuickViewImgIdx((prev) => (prev >= parsedQuickViewImages.length - 1 ? 0 : prev + 1));
              };

              return (
                <div
                  style={{
                    position: 'relative',
                    width: 'min(92vw, 460px)',
                    maxHeight: '90vh',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                    zIndex: 10001,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header: Prev Product | Tên sản phẩm | Next Product | Close */}
                  <div
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-muted)',
                      flexShrink: 0,
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                      {totalProducts > 1 && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={handlePrevProduct}
                            title="Sản phẩm trước đó"
                            aria-label="Sản phẩm trước đó"
                            style={{
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-secondary)',
                              width: '30px',
                              height: '30px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              touchAction: 'manipulation',
                            }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextProduct}
                            title="Sản phẩm tiếp theo"
                            aria-label="Sản phẩm tiếp theo"
                            style={{
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-secondary)',
                              width: '30px',
                              height: '30px',
                              borderRadius: 'var(--radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                              touchAction: 'manipulation',
                            }}
                          >
                            <ChevronRight size={16} />
                          </button>
                          {currentProductIdx !== -1 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '2px', whiteSpace: 'nowrap' }}>
                              {currentProductIdx + 1}/{totalProducts}
                            </span>
                          )}
                        </div>
                      )}

                      <h3
                        className="font-serif"
                        style={{
                          fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: 0,
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={quickViewProduct.name}
                      >
                        {quickViewProduct.name}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(null)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        touchAction: 'manipulation',
                      }}
                      aria-label="Đóng xem nhanh"
                    >
                      <X size={22} />
                    </button>
                  </div>

                  {/* Body: Ảnh sản phẩm + Highlight Giá + Mô tả 2 dòng + Nút Chi tiết */}
                  <div
                    style={{
                      padding: '1.25rem',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Ảnh sản phẩm với nút Next/Prev ảnh & Touch swipe */}
                    <div
                      className="catalog-quick-view-hero-box"
                      onTouchStart={(e) => {
                        touchStartXRef.current = e.touches[0].clientX;
                      }}
                      onTouchEnd={(e) => {
                        if (touchStartXRef.current === null) return;
                        const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
                        touchStartXRef.current = null;
                        if (Math.abs(diffX) > 35) {
                          if (diffX < 0) {
                            handleNextImg();
                          } else {
                            handlePrevImg();
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        aspectRatio: '1 / 1',
                        maxHeight: '380px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        backgroundColor: '#faf8f5',
                        border: '1px solid var(--border-subtle)',
                        position: 'relative',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                        boxSizing: 'border-box',
                        touchAction: 'pan-y',
                      }}
                    >
                      <img
                        src={currentImgObj.clean}
                        alt={`${quickViewProduct.name} - Ảnh ${safeImgIdx + 1}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          transition: 'opacity 0.2s ease',
                        }}
                      />

                      {/* Counter Badge */}
                      {parsedQuickViewImages.length > 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            backgroundColor: 'rgba(44, 40, 37, 0.75)',
                            backdropFilter: 'blur(6px)',
                            color: '#ffffff',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            pointerEvents: 'none',
                            zIndex: 10,
                          }}
                        >
                          {safeImgIdx + 1} / {parsedQuickViewImages.length}
                        </div>
                      )}

                      {/* Prev Photo Arrow */}
                      {parsedQuickViewImages.length > 1 && (
                        <button
                          type="button"
                          onClick={handlePrevImg}
                          style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.94)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            minWidth: '42px',
                            minHeight: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                            transition: 'all 0.15s ease',
                            zIndex: 25,
                            touchAction: 'manipulation',
                            userSelect: 'none',
                          }}
                          title="Ảnh trước"
                          aria-label="Ảnh trước"
                        >
                          <ChevronLeft size={24} />
                        </button>
                      )}

                      {/* Next Photo Arrow */}
                      {parsedQuickViewImages.length > 1 && (
                        <button
                          type="button"
                          onClick={handleNextImg}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.94)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            minWidth: '42px',
                            minHeight: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                            transition: 'all 0.15s ease',
                            zIndex: 25,
                            touchAction: 'manipulation',
                            userSelect: 'none',
                          }}
                          title="Ảnh tiếp theo"
                          aria-label="Ảnh tiếp theo"
                        >
                          <ChevronRight size={24} />
                        </button>
                      )}
                    </div>

                    {/* Thumbnail Dots Indicator for Photos */}
                    {parsedQuickViewImages.length > 1 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          paddingTop: '2px',
                        }}
                      >
                        {parsedQuickViewImages.slice(0, 15).map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewImgIdx(dotIdx);
                            }}
                            style={{
                              width: safeImgIdx === dotIdx ? '18px' : '6px',
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: safeImgIdx === dotIdx ? 'var(--accent-brown)' : '#ddd6cc',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              touchAction: 'manipulation',
                            }}
                            title={`Xem ảnh ${dotIdx + 1}`}
                            aria-label={`Xem ảnh ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Highlight Giá sản phẩm */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '1.65rem',
                          fontWeight: 700,
                          color: 'var(--accent-brown)',
                          fontFamily: 'serif',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {formatVND(quickViewProduct.price)}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        (Giá tham khảo theo kích thước)
                      </span>
                    </div>

                    {/* Mô tả sản phẩm: hiển thị đúng 2 dòng rồi ... */}
                    {quickViewProduct.description && (
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.55,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {cleanProductDescription(quickViewProduct.description)}
                      </p>
                    )}

                    {/* Action Button: Xem chi tiết đầy đủ */}
                    <div style={{ marginTop: '0.25rem' }}>
                      <Link
                        to={`/products/${quickViewProduct.slug || quickViewProduct.id}`}
                        className="btn btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          textDecoration: 'none',
                          padding: '0.75rem 1.25rem',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          width: '100%',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <span>Xem chi tiết đầy đủ & Đặt may</span>
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>,
          document.body
        )}

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
        }

        @media (max-width: 640px) {
          .catalog-quick-view-grid {
            padding: 0.85rem !important;
            gap: 1.25rem !important;
            grid-template-columns: minmax(0, 1fr) !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .catalog-quick-view-hero-box {
            max-height: min(48vh, 380px) !important;
          }
        }

        @media (min-width: 900px) {
          .catalog-quick-view-grid {
            grid-template-columns: minmax(520px, 1.6fr) minmax(340px, 1fr) !important;
            gap: 2.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};
