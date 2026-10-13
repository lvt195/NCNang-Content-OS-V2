import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  LogOut,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SITE_CONFIG } from '../config/site';

export const AdminLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/admin" style={{ textDecoration: 'none', color: '#ffffff' }}>
            <h2>{SITE_CONFIG.name}</h2>
            <p>Admin Control Panel</p>
          </Link>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Package size={18} />
            <span>Quản lý sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/products/new"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            <span>Thêm sản phẩm mới</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Tags size={18} />
            <span>Quản lý danh mục</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ fontSize: '0.75rem', color: '#a3978b', wordBreak: 'break-all' }}>
            <span style={{ display: 'block', color: '#7c6a59', fontWeight: 600 }}>TÀI KHOẢN ADMIN:</span>
            {user?.email}
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#d4cbbe',
              justifyContent: 'flex-start',
            }}
          >
            <ExternalLink size={15} />
            <span>Xem website ngoài</span>
          </Link>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
            style={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ff8a80',
              justifyContent: 'flex-start',
            }}
          >
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
