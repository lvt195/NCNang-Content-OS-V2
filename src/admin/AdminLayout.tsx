import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tags,
  LogOut,
  ExternalLink,
  PlusCircle,
  FolderPlus,
  Image as ImageIcon,
  Menu,
  X,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../config/site';

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Check đơn hàng', icon: ShoppingBag, end: false },
    { to: '/admin/products', label: 'Sản phẩm', icon: Package, end: false },
    { to: '/admin/products/new', label: 'Thêm mới', icon: PlusCircle, end: false },
    { to: '/admin/products/bulk', label: 'Nhập theo Folder', icon: FolderPlus, end: false },
    { to: '/admin/media', label: 'Kho ảnh', icon: ImageIcon, end: false },
    { to: '/admin/categories', label: 'Danh mục', icon: Tags, end: false },
  ];

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop permanent fixed, Mobile off-canvas drawer) */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link
            to="/admin"
            style={{ textDecoration: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}
            onClick={() => setMobileMenuOpen(false)}
            title={sidebarCollapsed ? `${SITE_CONFIG.name} Admin` : undefined}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e5ded5',
                fontWeight: 700,
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              N
            </div>
            <div className="admin-sidebar-brand-text">
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: '#ffffff', whiteSpace: 'nowrap' }}>
                {SITE_CONFIG.name}
              </h2>
              <p style={{ fontSize: '0.725rem', color: '#a3978b', margin: '2px 0 0', whiteSpace: 'nowrap' }}>
                Admin Control Panel
              </p>
            </div>
          </Link>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            className="admin-sidebar-toggle-btn"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Mở rộng menu (250px)' : 'Thu gọn menu (Ghim & Tiết kiệm diện tích)'}
            aria-label="Thu gọn hoặc mở rộng menu"
          >
            {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            className="admin-drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="admin-nav">
          <div className="admin-nav-section-title">
            Menu Quản Lý
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                title={item.label}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div
            className="admin-user-info-card"
            title={`Đang đăng nhập: ${user?.email || 'admin@nhacomuinang'}`}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e0d8cd',
                flexShrink: 0,
              }}
            >
              <User size={16} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }} className="admin-user-info-text">
              <span style={{ display: 'block', fontSize: '0.675rem', color: '#8c8073', fontWeight: 600, textTransform: 'uppercase' }}>
                Đang đăng nhập
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.775rem',
                  color: '#e5ded5',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email || 'admin@nhacomuinang'}
              </span>
            </div>
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm admin-sidebar-footer-btn"
            title="Xem website cửa hàng ngoài"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#d4cbbe',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: sidebarCollapsed ? '0.45rem 0' : '0.45rem',
              fontSize: '0.825rem',
            }}
          >
            <ExternalLink size={16} />
            <span>Xem cửa hàng ngoài</span>
          </Link>

          <button
            type="button"
            className="btn btn-outline btn-sm admin-sidebar-footer-btn"
            onClick={handleLogout}
            title="Đăng xuất"
            style={{
              borderColor: 'rgba(255, 100, 100, 0.25)',
              color: '#ff8a80',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 100, 100, 0.05)',
              padding: sidebarCollapsed ? '0.45rem 0' : '0.45rem',
              fontSize: '0.825rem',
            }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Mobile Top Header */}
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu quản trị"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="admin-mobile-header-brand">
            <span className="admin-mobile-brand-name">{SITE_CONFIG.name}</span>
            <span className="admin-mobile-brand-badge">Admin</span>
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-mobile-store-link"
            title="Xem website cửa hàng"
          >
            <ExternalLink size={18} />
          </Link>
        </header>

        {/* Desktop Topbar */}
        <header className="admin-desktop-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#685e54' }}>
            {/* Topbar Toggle for quick 1-click collapse */}
            <button
              type="button"
              className="admin-topbar-sidebar-toggle"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Mở rộng menu (250px)' : 'Thu gọn menu (Ghim & Tiết kiệm diện tích)'}
              aria-label="Thu gọn hoặc mở rộng menu quản lý"
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <span style={{ fontWeight: 600, color: '#2c2825' }}>Khu vực Quản trị</span>
            <span>/</span>
            <span>
              {location.pathname === '/admin'
                ? 'Tổng quan'
                : location.pathname === '/admin/products'
                ? 'Quản lý sản phẩm'
                : location.pathname === '/admin/products/new'
                ? 'Thêm sản phẩm mới'
                : location.pathname === '/admin/products/bulk'
                ? 'Nhập theo Folder'
                : location.pathname === '/admin/media'
                ? 'Kho ảnh'
                : location.pathname === '/admin/categories'
                ? 'Danh mục'
                : 'Chi tiết'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.75rem', gap: '0.4rem' }}
            >
              <ExternalLink size={14} />
              <span>Xem trang khách</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.75rem', gap: '0.4rem', color: '#c62828' }}
              title="Đăng xuất"
            >
              <LogOut size={14} />
              <span>Thoát</span>
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Sticky tabs for quick 1-tap navigation on phone) */}
      <nav className="admin-mobile-bottom-nav">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-mobile-bottom-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
