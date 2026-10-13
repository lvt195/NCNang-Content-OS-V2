import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Eye,
  EyeOff,
  Star,
  Tags,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { productService } from '../services/productService';
import { analyticsService } from '../services/analyticsService';
import { Product, Category } from '../types/product';
import { formatVND } from '../utils/formatCurrency';

export const AdminDashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(() => analyticsService.getSummary());

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        productService.getAllProductsAdmin(),
        productService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setAnalytics(analyticsService.getSummary());
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.published).length;
  const draftProducts = products.filter((p) => !p.published).length;
  const featuredProducts = products.filter((p) => p.featured).length;

  const handleResetAnalytics = () => {
    if (window.confirm('Bạn có muốn đặt lại số liệu lượt xem và truy cập về ban đầu không?')) {
      analyticsService.resetStats();
      setAnalytics(analyticsService.getSummary());
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#766352' }}>
        <RefreshCw size={26} className="spin" style={{ color: 'var(--accent-brown, #7c6a59)' }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.925rem', fontWeight: 500 }}>
          Đang tải số liệu thống kê quản trị...
        </p>
      </div>
    );
  }

  const { totalVisits, todayVisits, totalProductViews, typeStats, topProducts, categoryBreakdown } =
    analytics;

  const maxViews = topProducts[0]?.views || 1;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e8e1d5',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#2c2825', letterSpacing: '-0.01em', margin: 0 }}>
            Báo Cáo & Thống Kê
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#685e54', marginTop: '0.25rem' }}>
            Theo dõi lượt truy cập, hành vi xem sản phẩm và kho hàng Nhà Có Mùi Nắng.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadAll}
            className="btn btn-outline btn-sm"
            style={{ backgroundColor: '#ffffff', borderColor: '#dcd3c5' }}
            title="Làm mới số liệu"
          >
            <RefreshCw size={14} />
            <span>Làm mới</span>
          </button>
          <Link to="/admin/products/new" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
            <PlusCircle size={15} />
            <span>Thêm sản phẩm</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ backgroundColor: '#ffffff', borderColor: '#dcd3c5' }}
          >
            <ExternalLink size={14} />
            <span>Xem Web</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: LƯỢT TRUY CẬP & XU HƯỚNG LOẠI SẢN PHẨM (KEY USER REQUEST) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#7c6a59" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
              Lượt Truy Cập & Thị Hiếu Người Xem
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetAnalytics}
            style={{ fontSize: '0.75rem', color: '#8c8073', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Khôi phục số liệu mẫu ban đầu"
          >
            <RotateCcw size={12} />
            <span>Đặt lại thống kê</span>
          </button>
        </div>

        {/* 3 Key Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Card 1: Tổng lượt ghé thăm */}
          <div className="admin-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#685e54' }}>
                Tổng Lượt Truy Cập Web
              </span>
              <div className="admin-stat-icon-wrap" style={{ backgroundColor: '#f5eee6', color: '#7c6a59' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginTop: '0.65rem' }}>
              <span style={{ fontSize: '2.1rem', fontWeight: 700, color: '#2c2825', lineHeight: 1 }}>
                {totalVisits.toLocaleString('vi-VN')}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#2e7d32',
                  backgroundColor: '#e8f5e9',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                +{todayVisits} hôm nay
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#8c8073', marginTop: '0.5rem', margin: 0 }}>
              Số lần người dùng mở xem danh mục & sản phẩm
            </p>
          </div>

          {/* Card 2: Tổng lượt xem chi tiết sản phẩm */}
          <div className="admin-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#685e54' }}>
                Tổng Lượt Xem Sản Phẩm
              </span>
              <div className="admin-stat-icon-wrap" style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}>
                <Eye size={18} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginTop: '0.65rem' }}>
              <span style={{ fontSize: '2.1rem', fontWeight: 700, color: '#2c2825', lineHeight: 1 }}>
                {totalProductViews.toLocaleString('vi-VN')}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#685e54' }}>lượt xem</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#8c8073', marginTop: '0.5rem', margin: 0 }}>
              Khách hàng bấm vào xem chi tiết các mẫu chăn ga
            </p>
          </div>

          {/* Card 3: Phân tích Loại sản phẩm xem nhiều nhất */}
          <div className="admin-stat-card" style={{ borderLeft: '4px solid #7c6a59' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#685e54' }}>
                Loại Sản Phẩm Xem Nhiều Nhất
              </span>
              <div className="admin-stat-icon-wrap" style={{ backgroundColor: '#fff3e0', color: '#e65100' }}>
                <Layers size={18} />
              </div>
            </div>

            <div style={{ marginTop: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2c2825' }}>
                  {typeStats.preferredType === 'combo' ? 'Bộ Combo Chăn Ga' : 'Món Lẻ Từng Món'}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c6a59' }}>
                  {typeStats.preferredType === 'combo' ? `${typeStats.combo.percentage}%` : `${typeStats.single.percentage}%`}
                </span>
              </div>

              {/* Comparative Progress Bar */}
              <div
                style={{
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#e8e1d5',
                  overflow: 'hidden',
                  display: 'flex',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: `${typeStats.combo.percentage}%`,
                    backgroundColor: '#7c6a59',
                    transition: 'width 0.4s ease',
                  }}
                  title={`Bộ Combo: ${typeStats.combo.percentage}% (${typeStats.combo.views} lượt)`}
                />
                <div
                  style={{
                    width: `${typeStats.single.percentage}%`,
                    backgroundColor: '#c4b5a5',
                    transition: 'width 0.4s ease',
                  }}
                  title={`Món Lẻ: ${typeStats.single.percentage}% (${typeStats.single.views} lượt)`}
                />
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#685e54' }}>
                <span>
                  <strong style={{ color: '#7c6a59' }}>● Bộ Combo:</strong> {typeStats.combo.views} lượt ({typeStats.combo.percentage}%)
                </span>
                <span>
                  <strong style={{ color: '#9e8f7f' }}>● Món lẻ:</strong> {typeStats.single.views} lượt ({typeStats.single.percentage}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: TOP SẢN PHẨM ĐƯỢC XEM NHIỀU NHẤT (RANKING LEADERBOARD) */}
      <div className="admin-table-card">
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e8e1d5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#e65100" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
              Top Sản Phẩm Được Xem Nhiều Nhất
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#8c8073' }}>
            Sắp xếp theo số lượt khách truy cập quan tâm
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px', textAlign: 'center' }}>Hạng</th>
                <th style={{ width: '60px' }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Loại SP</th>
                <th>Danh mục</th>
                <th>Giá niêm yết</th>
                <th style={{ minWidth: '180px' }}>Lượt xem & Độ hot</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, idx) => {
                const rank = idx + 1;
                const ratio = Math.round((p.views / maxViews) * 100);

                let rankBadge = (
                  <span style={{ fontWeight: 700, color: '#8c8073', fontSize: '0.9rem' }}>
                    #{rank}
                  </span>
                );
                if (rank === 1) {
                  rankBadge = (
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }} title="Hạng 1 - Được xem nhiều nhất">
                      🥇
                    </span>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }} title="Hạng 2">
                      🥈
                    </span>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }} title="Hạng 3">
                      🥉
                    </span>
                  );
                }

                return (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center' }}>{rankBadge}</td>
                    <td>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#f3eee6',
                          border: '1px solid #e8e1d5',
                        }}
                      >
                        <img
                          src={p.coverImage}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#2c2825', fontSize: '0.875rem' }}>
                        {p.name}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#8c8073' }}>Mã: {p.id}</span>
                    </td>
                    <td>
                      {p.type === 'combo' ? (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#f5eee6',
                            color: '#7c6a59',
                            border: '1px solid #e2d7c9',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Sparkles size={11} />
                          Bộ Combo
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#f3f4f6',
                            color: '#4b5563',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          Món lẻ
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#524941' }}>
                      {categories.find((c) => c.id === p.category)?.name || p.category}
                    </td>
                    <td style={{ fontWeight: 600, color: '#2c2825', fontSize: '0.875rem' }}>
                      {formatVND(p.price)}
                    </td>
                    <td>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#2c2825' }}>
                            <Eye size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px', color: '#7c6a59' }} />
                            {p.views} lượt
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#8c8073' }}>{ratio}%</span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            backgroundColor: '#ede7dc',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${ratio}%`,
                              height: '100%',
                              backgroundColor: rank === 1 ? '#e65100' : rank <= 3 ? '#7c6a59' : '#a39482',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.775rem' }}
                      >
                        Sửa
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: PHÂN TÍCH THEO DANH MỤC & KHO HÀNG */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Phân loại theo Danh mục */}
        <div className="admin-table-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Tags size={18} color="#7c6a59" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
              Mức Độ Quan Tâm Theo Danh Mục
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryBreakdown.map((cat) => {
              const catName = categories.find((c) => c.id === cat.id)?.name || cat.id;
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: '#3c352f' }}>{catName}</span>
                    <span style={{ color: '#685e54', fontWeight: 600 }}>
                      {cat.views} lượt ({cat.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '7px', borderRadius: '4px', backgroundColor: '#efeae2', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${cat.percentage}%`,
                        height: '100%',
                        backgroundColor: '#7c6a59',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng quan Kho hàng */}
        <div className="admin-table-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Package size={18} color="#7c6a59" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
              Tổng Quan Kho Sản Phẩm
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem',
            }}
          >
            <div style={{ padding: '0.85rem', backgroundColor: '#faf8f5', borderRadius: '8px', border: '1px solid #e8e1d5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2e7d32', fontSize: '0.8rem', fontWeight: 600 }}>
                <Eye size={15} />
                <span>Đang hiển thị</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2c2825', marginTop: '0.25rem' }}>
                {publishedProducts}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#8c8073' }}>Khách thấy trên web</span>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#faf8f5', borderRadius: '8px', border: '1px solid #e8e1d5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c62828', fontSize: '0.8rem', fontWeight: 600 }}>
                <EyeOff size={15} />
                <span>Bản nháp / Đang ẩn</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2c2825', marginTop: '0.25rem' }}>
                {draftProducts}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#8c8073' }}>Chưa công khai</span>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#faf8f5', borderRadius: '8px', border: '1px solid #e8e1d5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e65100', fontSize: '0.8rem', fontWeight: 600 }}>
                <Star size={15} />
                <span>SP Nổi bật</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2c2825', marginTop: '0.25rem' }}>
                {featuredProducts}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#8c8073' }}>Ưu tiên trang đầu</span>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#faf8f5', borderRadius: '8px', border: '1px solid #e8e1d5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1565c0', fontSize: '0.8rem', fontWeight: 600 }}>
                <Tags size={15} />
                <span>Danh mục</span>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2c2825', marginTop: '0.25rem' }}>
                {categories.length}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#8c8073' }}>Phân loại hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: SẢN PHẨM CẬP NHẬT GẦN ĐÂY */}
      <div className="admin-table-card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e8e1d5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Sản phẩm mới cập nhật</h3>
          <Link to="/admin/products" style={{ fontSize: '0.85rem', color: '#7c6a59', fontWeight: 600 }}>
            Quản lý tất cả ({totalProducts}) →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Ảnh</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
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
                          width: '42px',
                          height: '42px',
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
                    <td style={{ fontWeight: 600, color: '#7c6a59' }}>{p.id}</td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{categories.find((c) => c.id === p.category)?.name || p.category}</td>
                    <td style={{ fontWeight: 600 }}>{formatVND(p.price)}</td>
                    <td>
                      {p.published ? (
                        <span style={{ color: '#2e7d32', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2e7d32' }} />
                          Hiển thị
                        </span>
                      ) : (
                        <span style={{ color: '#c62828', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#c62828' }} />
                          Ẩn
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.775rem' }}
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
