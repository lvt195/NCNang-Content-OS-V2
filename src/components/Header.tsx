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
        className="container"
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            minWidth: 0,
            flexShrink: 1,
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
          <div style={{ minWidth: 0 }}>
            <span
              className="font-serif"
              style={{
                fontSize: 'clamp(1rem, 3.8vw, 1.25rem)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.01em',
                display: 'block',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {SITE_CONFIG.name}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                whiteSpace: 'nowrap',
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

        {/* Right Actions: Mobile Search + Prominent Admin Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          {/* Mobile search toggle */}
          {isCatalog && onSearchChange && (
            <button
              className="btn btn-outline btn-sm mobile-search-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Tìm kiếm sản phẩm"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                borderRadius: '50%',
              }}
            >
              <Search size={16} />
            </button>
          )}

          {/* Prominent Admin Button */}
          {user && isAdmin ? (
            <Link
              to="/admin"
              className="btn btn-primary btn-sm"
              style={{
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
              }}
              title="Vào bảng điều khiển Quản trị"
            >
              <ShieldCheck size={15} />
              <span>Quản trị</span>
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="btn btn-outline btn-sm"
              style={{
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-muted)',
              }}
              title="Đăng nhập trang quản trị"
            >
              <Shield size={14} color="var(--accent-brown)" />
              <span>Admin</span>
            </Link>
          )}
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
