import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Menu, ChevronRight } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { Category } from '../types/product';
import { productService } from '../services/productService';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  categories?: Category[];
  onSelectCategory?: (catId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  categories: propCategories,
  onSelectCategory,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState<Category[]>(propCategories || []);
  const location = useLocation();
  const navigate = useNavigate();

  const isCatalog = location.pathname === '/';

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setLoadedCategories(propCategories);
    } else {
      let mounted = true;
      productService.getCategories().then((cats) => {
        if (mounted) setLoadedCategories(cats);
      });
      return () => {
        mounted = false;
      };
    }
  }, [propCategories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCatalog) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (catId: string) => {
    setCategoryDrawerOpen(false);
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      navigate(catId === 'all' ? '/' : `/?cat=${encodeURIComponent(catId)}`);
    }
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      <div
        className="container header-container"
        style={{
          height: '62px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.4rem',
        }}
      >
        {/* Left: Menu Hamburger Button + Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0, flex: '1 1 auto' }}>
          <button
            type="button"
            onClick={() => setCategoryDrawerOpen(true)}
            aria-label="Mở danh mục sản phẩm"
            title="Xem danh mục sản phẩm"
            style={{
              border: 'none',
              background: 'none',
              padding: '0.45rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
            }}
          >
            <Menu size={22} />
          </button>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              textDecoration: 'none',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-brown)',
                fontWeight: 700,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              N
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <span
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.15rem, 4vw, 1.45rem)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.01em',
                  display: 'block',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {SITE_CONFIG.name}
              </span>
              <span
                className="header-brand-subtitle"
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Linen & Đũi Tự Nhiên
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Search Bar (Catalog) */}
        {isCatalog && onSearchChange && (
          <div
            style={{ flex: '1', maxWidth: '380px', display: 'none' }}
            className="desktop-search-container"
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Tìm mã SP (GA001) hoặc tên..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 2rem 0.45rem 2.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Actions: Mobile Search Toggle */}
        {isCatalog && onSearchChange && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              marginLeft: 'auto',
            }}
          >
            <button
              className="btn btn-outline btn-sm mobile-search-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Tìm kiếm sản phẩm"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Search size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile search input expandable */}
      {mobileSearchOpen && isCatalog && onSearchChange && (
        <div
          style={{
            padding: '0.65rem 1rem',
            backgroundColor: 'var(--bg-muted)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              autoFocus
              placeholder="Nhập tên sản phẩm hoặc mã SP (ví dụ: GA001)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 2rem 0.5rem 2.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                fontSize: '0.85rem',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={15} />
              </button>
            )}
          </form>
        </div>
      )}

      {/* Category Drawer Sidebar */}
      {categoryDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
          }}
        >
          {/* Backdrop overlay */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(3px)',
            }}
            onClick={() => setCategoryDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <aside
            style={{
              position: 'relative',
              width: 'min(82vw, 320px)',
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            className="drawer-slide-in"
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.25rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-warm-tint)',
                    border: '1px solid #ebd9c2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-brown)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  N
                </div>
                <span className="font-serif" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Danh mục sản phẩm
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(false)}
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
                }}
                aria-label="Đóng danh mục"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category List */}
            <div style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
              <button
                type="button"
                onClick={() => handleCategoryClick('all')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  color: 'var(--accent-brown)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease',
                }}
                className="drawer-cat-item"
              >
                <span>Tất cả sản phẩm</span>
                <ChevronRight size={16} color="var(--accent-brown)" />
              </button>

              {loadedCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.925rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  className="drawer-cat-item"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-brown)', display: 'inline-block' }} />
                    <span>{cat.name}</span>
                  </span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </button>
              ))}
            </div>

            {/* Drawer Footer */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-muted)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {SITE_CONFIG.name}
              </div>
              <div>{SITE_CONFIG.description}</div>
            </div>
          </aside>
        </div>
      )}

      <style>{`
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .drawer-slide-in {
          animation: slideInFromLeft 0.22s ease-out forwards;
        }
        .drawer-cat-item:hover, .drawer-cat-item:active {
          background-color: var(--bg-muted) !important;
        }
        @media (max-width: 520px) {
          .header-brand-subtitle {
            display: none !important;
          }
          .header-container {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }
        @media (min-width: 768px) {
          .desktop-search-container {
            display: block !important;
          }
          .mobile-search-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
