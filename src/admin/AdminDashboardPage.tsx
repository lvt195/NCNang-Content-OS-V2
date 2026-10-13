import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, EyeOff, Star, Tags, PlusCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { productService } from '../services/productService';
import { Product, Category } from '../types/product';
import { formatVND } from '../utils/formatCurrency';

export const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          productService.getAllProductsAdmin(),
          productService.getCategories(),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.published).length;
  const draftProducts = products.filter((p) => !p.published).length;
  const featuredProducts = products.filter((p) => p.featured).length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#766352' }}>
        <RefreshCw size={24} className="spin" />
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Đang tải số liệu bảng điều khiển...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#2c2825' }}>
            Bảng điều khiển Quản trị
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.2rem' }}>
            Tổng quan kho hàng và danh mục chăn ga đũi & linen tự nhiên.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Thêm sản phẩm mới</span>
          </Link>
          <Link to="/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            <ExternalLink size={16} />
            <span>Xem cửa hàng</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#685e54' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Tổng sản phẩm</span>
            <Package size={18} color="#766352" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2c2825', marginTop: '0.5rem' }}>
            {totalProducts}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8c8277' }}>Sản phẩm trong kho dữ liệu</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#2e7d32' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Đang hiển thị</span>
            <Eye size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2e7d32', marginTop: '0.5rem' }}>
            {publishedProducts}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8c8277' }}>Khách hàng xem được trên web</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#c62828' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Bản nháp / Đang ẩn</span>
            <EyeOff size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#c62828', marginTop: '0.5rem' }}>
            {draftProducts}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8c8277' }}>Chưa công khai ra ngoài</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#e65100' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Sản phẩm Nổi bật</span>
            <Star size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e65100', marginTop: '0.5rem' }}>
            {featuredProducts}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8c8277' }}>Ưu tiên đưa lên đầu trang</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1565c0' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Danh mục</span>
            <Tags size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1565c0', marginTop: '0.5rem' }}>
            {categories.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#8c8277' }}>Phân loại hàng hóa</span>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="admin-table-card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e8e1d5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Sản phẩm cập nhật gần nhất</h2>
          <Link to="/admin/products" style={{ fontSize: '0.85rem', color: '#766352', fontWeight: 500 }}>
            Xem toàn bộ ({totalProducts}) →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Ảnh</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá niêm yết</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 6).map((p) => {
                const cover = p.coverImage || p.images[0] || '/images/placeholder.webp';
                return (
                  <tr key={p.id}>
                    <td>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          backgroundColor: '#f3eee6',
                          border: '1px solid #e8e1d5',
                        }}
                      >
                        <img
                          src={cover}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#766352' }}>{p.id}</td>
                    <td style={{ fontWeight: 500, maxWidth: '280px' }}>{p.name}</td>
                    <td>{categories.find((c) => c.id === p.category)?.name || p.category}</td>
                    <td style={{ fontWeight: 600 }}>{formatVND(p.price)}</td>
                    <td>
                      {p.published ? (
                        <span style={{ color: '#2e7d32', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                          Hiển thị
                        </span>
                      ) : (
                        <span style={{ color: '#c62828', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#c62828' }} />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        Chỉnh sửa
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
