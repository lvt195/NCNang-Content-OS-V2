import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Shield, ShieldCheck, X } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery = '',
  onSearchChange,
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
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      <div
        className="container header-container"
        style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            textDecoration: 'none',
            minWidth: 0,
            flex: '1 1 auto',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-brown)',
              fontWeight: 700,
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            N
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <span
              className="font-serif"
              style={{
                fontSize: 'clamp(0.95rem, 3.6vw, 1.25rem)',
                fontWeight: 600,
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
                fontSize: '0.625rem',
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

        {/* Right Actions: Mobile Search + Guaranteed Visible Admin Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexShrink: 0,
            marginLeft: 'auto',
          }}
        >
          {/* Mobile search toggle */}
          {isCatalog && onSearchChange && (
            <button
              className="btn btn-outline btn-sm mobile-search-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Tìm kiếm sản phẩm"
              style={{
                width: '34px',
                height: '34px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Search size={15} />
            </button>
          )}

          {/* Always prominent Quản trị button */}
          <Link
            to={user && isAdmin ? '/admin' : '/admin/login'}
            className="btn btn-primary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.38rem 0.65rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: 'var(--accent-brown)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            title="Khu vực Quản trị cửa hàng"
          >
            {user && isAdmin ? <ShieldCheck size={15} /> : <Shield size={15} />}
            <span>Quản trị</span>
          </Link>
        </div>
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

      <style>{`
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
