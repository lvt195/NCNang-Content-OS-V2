import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  FolderPlus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Product, Category } from '../types/product';
import { productService } from '../services/productService';
import { DEFAULT_COLORS } from '../data/colors';
import { formatVND } from '../utils/formatCurrency';
import { normalizeVietnamese } from '../utils/filterProducts';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View Mode: 'grid' (Lưới thẻ trực quan) or 'table' (Bảng chi tiết)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('admin_prod_view') as 'grid' | 'table') || 'grid';
  });

  const handleSetViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('admin_prod_view', mode);
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [prods, cats] = await Promise.all([
        productService.getAllProductsAdmin(),
        productService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (product: Product) => {
    const nextStatus = !product.published;
    try {
      await productService.togglePublish(product.id, nextStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, published: nextStatus } : p))
      );
      setSuccessMsg(
        `Đã ${nextStatus ? 'công khai' : 'ẩn'} sản phẩm "${product.name}" (${product.id}) thành công.`
      );
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setSuccessMsg(`Đã xóa sản phẩm "${productToDelete.name}" (${productToDelete.id}) thành công.`);
      setProductToDelete(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi xóa sản phẩm');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const norm = normalizeVietnamese(searchQuery);

    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter === 'published' && !p.published) return false;
      if (statusFilter === 'draft' && p.published) return false;

      if (norm) {
        const matchName = normalizeVietnamese(p.name).includes(norm);
        const matchId = normalizeVietnamese(p.id).includes(norm);
        if (!matchName && !matchId) return false;
      }

      return true;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  return (
    <div>
      {/* Header & Create Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#2c2825' }}>
            Quản lý Sản phẩm
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.2rem' }}>
            Toàn bộ sản phẩm trong danh mục ({products.length} sản phẩm)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/products/bulk"
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#766352' }}
            title="Thêm hàng loạt từ các thư mục ảnh trên máy tính"
          >
            <FolderPlus size={18} />
            <span>Thêm từ Folder</span>
          </Link>

          <Link to="/admin/products/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={18} />
            <span>Thêm sản phẩm mới</span>
          </Link>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#edf7ed',
            border: '1px solid #c8e6c9',
            color: '#1b5e20',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: '#fdeeed',
            border: '1px solid #f9c7c4',
            color: '#b71c1c',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e1d5',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9e9387',
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo mã SP hoặc tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Category filter */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đang hiển thị</option>
            <option value="draft">Bản nháp / Đang ẩn</option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="btn btn-outline btn-sm"
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={15} />
          <span>Làm mới</span>
        </button>

        {/* View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f3eee6',
            borderRadius: '6px',
            padding: '2px',
            marginLeft: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => handleSetViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? '#2c2825' : '#8c8277',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
            }}
          >
            <LayoutGrid size={15} />
            <span>Lưới thẻ</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
              color: viewMode === 'table' ? '#2c2825' : '#8c8277',
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
            }}
          >
            <List size={15} />
            <span>Bảng chi tiết</span>
          </button>
        </div>
      </div>

      {/* Content Rendering: Loading / Empty / Grid / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#766352' }}>
          <RefreshCw size={26} className="spin" />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Đang tải danh sách sản phẩm...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem 1rem',
            color: '#8c8277',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e8e1d5',
          }}
        >
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Không tìm thấy sản phẩm nào phù hợp.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Visual Card Grid View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredProducts.map((p) => {
            const cover = p.coverImage || p.images[0] || '/images/placeholder.webp';
            const catName = categories.find((c) => c.id === p.category)?.name || p.category;
            return (
              <div
                key={p.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e1d5',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  position: 'relative',
                }}
              >
                {/* Image Cover with Badges */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '75%',
                    backgroundColor: '#f3eee6',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={cover}
                    alt={p.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    loading="lazy"
                  />

                  {/* Category badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '20px',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      color: '#685e54',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {catName}
                  </span>

                  {/* Status badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: p.published ? 'rgba(237, 247, 237, 0.95)' : 'rgba(253, 238, 237, 0.95)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '20px',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      color: p.published ? '#1b5e20' : '#b71c1c',
                      border: `1px solid ${p.published ? '#c8e6c9' : '#f9c7c4'}`,
                    }}
                  >
                    {p.published ? '🟢 Công khai' : '🔴 Đang ẩn'}
                  </span>

                  {/* Photo count */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      color: '#ffffff',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 500,
                    }}
                  >
                    📷 {p.images?.length || 0} ảnh
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        backgroundColor: '#f3eee6',
                        color: '#766352',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                      }}
                    >
                      {p.id}
                    </span>
                    {p.type === 'combo' && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: '#fff8e1',
                          color: '#b78103',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        Combo
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#2c2825',
                      lineHeight: 1.35,
                      marginBottom: '0.5rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.55rem',
                    }}
                    title={p.name}
                  >
                    {p.name}
                  </h3>

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#766352' }}>
                      {formatVND(p.price)}
                    </div>

                    {/* Colors & Sizes preview */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '0.5rem',
                        fontSize: '0.725rem',
                        color: '#8c8277',
                      }}
                    >
                      {p.colors && p.colors.length > 0 ? (
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                          {p.colors.slice(0, 4).map((cId) => {
                            const cDef = DEFAULT_COLORS.find((dc) => dc.id === cId);
                            return (
                              <span
                                key={cId}
                                title={cDef?.label || cId}
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: cDef?.hex || '#ccc',
                                  border: '1px solid #dcd3c5',
                                  display: 'inline-block',
                                }}
                              />
                            );
                          })}
                          {p.colors.length > 4 && <span>+{p.colors.length - 4}</span>}
                        </div>
                      ) : (
                        <span>Màu tự nhiên</span>
                      )}

                      {p.sizes && p.sizes.length > 0 && <span>{p.sizes.length} cỡ</span>}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div
                  style={{
                    borderTop: '1px solid #f0eae1',
                    padding: '0.6rem 0.85rem',
                    backgroundColor: '#faf8f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.4rem',
                  }}
                >
                  {/* Toggle publish button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(p)}
                    className="btn btn-outline btn-sm"
                    style={{
                      padding: '0.35rem 0.6rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: p.published ? '#685e54' : '#1b5e20',
                    }}
                    title={p.published ? 'Nhấn để ẩn sản phẩm' : 'Nhấn để công khai sản phẩm'}
                  >
                    {p.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{p.published ? 'Ẩn' : 'Hiện'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Link
                      to={`/products/${p.slug || p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.5rem' }}
                      title="Xem trước trên website"
                    >
                      <ExternalLink size={14} />
                    </Link>

                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.5rem' }}
                      title="Chỉnh sửa sản phẩm"
                    >
                      <Edit2 size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setProductToDelete(p)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.5rem', color: '#c62828', borderColor: '#f9c7c4' }}
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Classic Table View */
        <div className="admin-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Ảnh</th>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Loại</th>
                  <th>Giá VND</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const cover = p.coverImage || p.images[0] || '/images/placeholder.webp';
                  return (
                    <tr key={p.id}>
                      <td>
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
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
                      <td style={{ fontWeight: 600, color: '#766352' }}>
                        <code>{p.id}</code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        {p.featured && (
                          <span className="badge badge-featured" style={{ marginTop: '2px', fontSize: '0.65rem' }}>
                            Nổi bật
                          </span>
                        )}
                      </td>
                      <td>{categories.find((c) => c.id === p.category)?.name || p.category}</td>
                      <td>
                        <span className={`badge ${p.type === 'combo' ? 'badge-combo' : 'badge-draft'}`}>
                          {p.type === 'combo' ? 'Combo' : 'Món lẻ'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatVND(p.price)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.55rem',
                            borderRadius: '4px',
                            backgroundColor: p.published ? '#e8f5e9' : '#ffebee',
                            color: p.published ? '#2e7d32' : '#c62828',
                          }}
                          title="Bấm để chuyển đổi Ẩn / Hiển thị"
                        >
                          {p.published ? (
                            <>
                              <Eye size={13} />
                              <span>Hiển thị</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={13} />
                              <span>Đang ẩn</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {/* Public preview */}
                          <Link
                            to={`/products/${p.slug || p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Xem trước trên website"
                          >
                            <ExternalLink size={14} />
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit2 size={14} />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem', color: '#c62828', borderColor: '#f9c7c4' }}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Delete (Rendered via Portal above backdrops) */}
      {productToDelete &&
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
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
              onClick={() => !isDeleting && setProductToDelete(null)}
            />

            {/* Modal Dialog Content (Crisp, above backdrop) */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#c62828' }}>
                <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2c2825' }}>
                    Xác nhận xóa sản phẩm?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    Bạn có chắc chắn muốn xóa sản phẩm{' '}
                    <strong>{productToDelete.name}</strong> (Mã: <code>{productToDelete.id}</code>)?
                    Hành động này sẽ gỡ bỏ sản phẩm khỏi cơ sở dữ liệu.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: '#c62828' }}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Đang xóa...' : 'Đồng ý xóa'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
