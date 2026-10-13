import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, ShieldCheck, X } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  onOpenMobileFilters,
  activeFilterCount = 0,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isCatalog = location.pathname === '/';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCatalog) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
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
      }}
    >
      <div className="container" style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-brown)',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            N
          </div>
          <div>
            <span
              className="font-serif"
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.01em',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              {SITE_CONFIG.name}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Linen & Đũi Tự Nhiên
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar (Catalog) */}
        {isCatalog && onSearchChange && (
          <div style={{ flex: '1', maxWidth: '440px', display: 'none' }} className="desktop-search-container">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
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
                placeholder="Tìm theo tên hoặc mã SP (ví dụ: GA001, be)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 2rem 0.55rem 2.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
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
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Mobile search toggle */}
          {isCatalog && onSearchChange && (
            <button
              className="btn btn-outline btn-sm mobile-search-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search size={16} />
            </button>
          )}

          {/* Mobile filter toggle */}
          {isCatalog && onOpenMobileFilters && (
            <button
              className="btn btn-outline btn-sm mobile-filter-btn"
              onClick={onOpenMobileFilters}
              style={{ position: 'relative' }}
              aria-label="Mở bộ lọc"
            >
              <SlidersHorizontal size={16} />
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
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Admin link / indicator */}
          {user && isAdmin ? (
            <Link
              to="/admin"
              className="btn btn-primary btn-sm"
              title="Khu vực quản trị"
            >
              <ShieldCheck size={16} />
              <span>Quản trị</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                padding: '0.35rem 0.6rem',
                borderRadius: '4px',
              }}
              title="Đăng nhập quản trị"
            >
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Mobile search input expandable */}
      {mobileSearchOpen && isCatalog && onSearchChange && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-muted)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search
              size={16}
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
              placeholder="Nhập tên sản phẩm hoặc mã SP..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 2rem 0.55rem 2.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
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
                <X size={16} />
              </button>
            )}
          </form>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-search-container {
            display: block !important;
          }
          .mobile-search-btn {
            display: none !important;
          }
          .mobile-filter-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
