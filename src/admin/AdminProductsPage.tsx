import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Product, Category } from '../types/product';
import { productService } from '../services/productService';
import { formatVND } from '../utils/formatCurrency';
import { normalizeVietnamese } from '../utils/filterProducts';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

        <Link to="/admin/products/new" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Thêm sản phẩm mới</span>
        </Link>
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
      </div>

      {/* Products Table Card */}
      <div className="admin-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#766352' }}>
            <RefreshCw size={24} className="spin" />
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Đang tải danh sách sản phẩm...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
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
        ) : (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#8c8277' }}>
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>Không tìm thấy sản phẩm nào phù hợp.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Hãy thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal Before Delete */}
      {productToDelete && (
        <>
          <div className="drawer-backdrop" onClick={() => !isDeleting && setProductToDelete(null)} />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              zIndex: 999,
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
        </>
      )}
    </div>
  );
};
