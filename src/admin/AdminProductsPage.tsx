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
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product, Category } from '../types/product';
import { productService } from '../services/productService';
import { getColorOption } from '../data/colors';
import { formatVND } from '../utils/formatCurrency';
import { normalizeVietnamese } from '../utils/filterProducts';

export type AdminProductViewMode = 'gallery' | 'grid' | 'table';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View Mode: 'gallery' (Xem theo ảnh thư viện), 'grid' (Lưới thẻ trực quan) or 'table' (Bảng chi tiết)
  const [viewMode, setViewMode] = useState<AdminProductViewMode>(() => {
    return (localStorage.getItem('admin_prod_view') as AdminProductViewMode) || 'gallery';
  });

  const handleSetViewMode = (mode: AdminProductViewMode) => {
    setViewMode(mode);
    localStorage.setItem('admin_prod_view', mode);
  };

  // Zoom / Grid Density (min-width in px for gallery & grid cards)
  const [zoomSize, setZoomSize] = useState<number>(() => {
    const saved = localStorage.getItem('admin_prod_zoom');
    return saved ? Math.max(140, Math.min(420, parseInt(saved, 10))) : 220;
  });

  const handleZoomChange = (size: number) => {
    const clamped = Math.max(140, Math.min(420, size));
    setZoomSize(clamped);
    localStorage.setItem('admin_prod_zoom', clamped.toString());
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick View Product Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activePreviewImg, setActivePreviewImg] = useState<string>('');

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
            placeholder="Tìm kiếm sản phẩm..."
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

        {/* View Mode Toggle: Gallery / Grid / Table */}
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
            onClick={() => handleSetViewMode('gallery')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: viewMode === 'gallery' ? '#ffffff' : 'transparent',
              color: viewMode === 'gallery' ? '#2c2825' : '#8c8277',
              boxShadow: viewMode === 'gallery' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
            }}
            title="Xem theo thư viện ảnh sản phẩm"
          >
            <ImageIcon size={15} />
            <span>Xem theo ảnh</span>
          </button>
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
            title="Xem dạng lưới thẻ thông tin"
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
            title="Xem bảng dữ liệu chi tiết"
          >
            <List size={15} />
            <span>Bảng chi tiết</span>
          </button>
        </div>
      </div>

      {/* Zoom / Chia Lưới Controller (khi xem dạng ảnh hoặc lưới thẻ) */}
      {(viewMode === 'gallery' || viewMode === 'grid') && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #ebdccb',
            borderRadius: '8px',
            padding: '0.45rem 0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#685e54',
            }}
          >
            <Maximize2 size={14} style={{ color: '#9c6644' }} />
            <span>Thu phóng chia lưới ({viewMode === 'gallery' ? 'Ảnh' : 'Thẻ'}: {zoomSize}px):</span>
          </div>

          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={() => handleZoomChange(zoomSize - 30)}
            disabled={zoomSize <= 140}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.2rem 0.45rem', height: '28px' }}
            title="Thu nhỏ cỡ ảnh / Tăng số cột"
          >
            <ZoomOut size={13} />
          </button>

          {/* Range Slider */}
          <input
            type="range"
            min={140}
            max={420}
            step={10}
            value={zoomSize}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="zoom-slider"
            style={{
              width: '120px',
              verticalAlign: 'middle',
            }}
            title={`Kích thước: ${zoomSize}px`}
          />

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={() => handleZoomChange(zoomSize + 30)}
            disabled={zoomSize >= 420}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.2rem 0.45rem', height: '28px' }}
            title="Phóng to cỡ ảnh / Giảm số cột"
          >
            <ZoomIn size={13} />
          </button>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {[
              { label: 'Nhỏ (160px)', val: 160 },
              { label: 'Vừa (220px)', val: 220 },
              { label: 'Lớn (300px)', val: 300 },
              { label: 'Cực đại (390px)', val: 390 },
            ].map((p) => {
              const isSelected = Math.abs(zoomSize - p.val) < 25;
              return (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handleZoomChange(p.val)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: isSelected ? '#9c6644' : '#e8e1d5',
                    backgroundColor: isSelected ? '#9c6644' : '#faf8f5',
                    color: isSelected ? '#ffffff' : '#685e54',
                    fontSize: '0.725rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
      ) : viewMode === 'gallery' ? (
        /* Gallery View - Photo-centric layout like Media Library */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${zoomSize}px), 1fr))`,
            gap: zoomSize > 250 ? '1.25rem' : '0.85rem',
          }}
        >
          {filteredProducts.map((p) => {
            const cover = p.coverImage || p.images[0] || '/images/placeholder.webp';
            const catName = categories.find((c) => c.id === p.category)?.name || p.category;
            return (
              <div
                key={p.id}
                className="admin-gallery-card"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e8e1d5',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setQuickViewProduct(p);
                  setActivePreviewImg(p.coverImage || p.images[0] || '');
                }}
              >
                {/* Photo container (1:1 square photo) */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '100%',
                    backgroundColor: '#f6f3ee',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={cover}
                    alt={p.name}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                    }}
                  />

                  {/* Category badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '20px',
                      fontSize: '0.675rem',
                      fontWeight: 600,
                      color: '#685e54',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                      maxWidth: '70%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {catName}
                  </span>

                  {/* Status badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: p.published ? 'rgba(237, 247, 237, 0.95)' : 'rgba(253, 238, 237, 0.95)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '20px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: p.published ? '#1b5e20' : '#b71c1c',
                      border: `1px solid ${p.published ? '#c8e6c9' : '#f9c7c4'}`,
                    }}
                  >
                    {p.published ? '🟢 Hiện' : '🔴 Ẩn'}
                  </span>

                  {/* Photo count badge */}
                  {p.images && p.images.length > 1 && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: '#ffffff',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '10px',
                        fontSize: '0.675rem',
                        fontWeight: 500,
                        backdropFilter: 'blur(2px)',
                      }}
                    >
                      📷 {p.images.length}
                    </span>
                  )}

                  {/* Hover action overlay */}
                  <div
                    className="gallery-hover-actions"
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      zIndex: 2,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="btn btn-sm"
                      style={{
                        padding: '0.25rem 0.45rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        color: '#2c2825',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      title="Chỉnh sửa sản phẩm"
                    >
                      <Edit2 size={12} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(p)}
                      className="btn btn-sm"
                      style={{
                        padding: '0.25rem 0.45rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        color: p.published ? '#685e54' : '#1b5e20',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      title={p.published ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                    >
                      {p.published ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(p)}
                      className="btn btn-sm"
                      style={{
                        padding: '0.25rem 0.45rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        color: '#c62828',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      title="Xóa sản phẩm"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Product Name & Price directly underneath photo */}
                <div
                  style={{
                    padding: zoomSize < 180 ? '0.5rem 0.65rem' : '0.65rem 0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div
                    title={p.name}
                    style={{
                      fontWeight: 600,
                      fontSize: zoomSize < 180 ? '0.8rem' : '0.875rem',
                      color: '#2c2825',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.7em',
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      marginTop: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#9c6644',
                        fontSize: zoomSize < 180 ? '0.825rem' : '0.95rem',
                      }}
                    >
                      {formatVND(p.price)}
                    </span>

                    {p.type === 'combo' && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          backgroundColor: '#fff8e1',
                          color: '#b78103',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      >
                        Combo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        /* Visual Card Grid View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${Math.max(220, zoomSize)}px), 1fr))`,
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
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setQuickViewProduct(p);
                  setActivePreviewImg(p.coverImage || p.images[0] || '');
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
                      transition: 'transform 0.3s ease',
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
                  {p.type === 'combo' && (
                    <div style={{ marginBottom: '0.4rem' }}>
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
                    </div>
                  )}

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
                            const cDef = getColorOption(cId);
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
                  onClick={(e) => e.stopPropagation()}
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
                    <button
                      type="button"
                      onClick={() => {
                        setQuickViewProduct(p);
                        setActivePreviewImg(p.coverImage || p.images[0] || '');
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.5rem', color: '#766352' }}
                      title="Xem nhanh chi tiết & thư viện ảnh"
                    >
                      <Eye size={14} />
                    </button>

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
                    <tr
                      key={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setQuickViewProduct(p);
                        setActivePreviewImg(p.coverImage || p.images[0] || '');
                      }}
                    >
                      <td>
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            backgroundColor: '#f3eee6',
                            border: '1px solid #e8e1d5',
                            position: 'relative',
                          }}
                        >
                          <img
                            src={cover}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {p.images && p.images.length > 1 && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: '#ffffff',
                                fontSize: '0.6rem',
                                padding: '1px 3px',
                                borderRadius: '3px',
                              }}
                            >
                              +{p.images.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#2c2825' }}>{p.name}</div>
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
                      <td style={{ fontWeight: 600, color: '#766352' }}>{formatVND(p.price)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
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
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickViewProduct(p);
                              setActivePreviewImg(p.coverImage || p.images[0] || '');
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.5rem', color: '#766352' }}
                            title="Xem nhanh chi tiết & thư viện ảnh"
                          >
                            <Eye size={14} />
                          </button>

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

      {/* Modal: Quick View Product with High-Priority Photo Gallery */}
      {quickViewProduct &&
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
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={() => setQuickViewProduct(null)}
            />

            {/* Modal Dialog Content - Expansive 1280px View */}
            {(() => {
              const prodImages = quickViewProduct.images && quickViewProduct.images.length > 0
                ? quickViewProduct.images
                : (quickViewProduct.coverImage ? [quickViewProduct.coverImage] : ['/images/placeholder.webp']);
              const currentImg = activePreviewImg || prodImages[0];
              const currentIdx = Math.max(0, prodImages.indexOf(currentImg));
              const handlePrev = (e: React.MouseEvent) => {
                e.stopPropagation();
                const nextIdx = currentIdx === 0 ? prodImages.length - 1 : currentIdx - 1;
                setActivePreviewImg(prodImages[nextIdx]);
              };
              const handleNext = (e: React.MouseEvent) => {
                e.stopPropagation();
                const nextIdx = currentIdx === prodImages.length - 1 ? 0 : currentIdx + 1;
                setActivePreviewImg(prodImages[nextIdx]);
              };

              return (
                <div
                  style={{
                    position: 'relative',
                    width: '95vw',
                    maxWidth: '1280px',
                    maxHeight: '94vh',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    zIndex: 10001,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Modal Header */}
                  <div
                    style={{
                      padding: '1rem 1.75rem',
                      borderBottom: '1px solid #e8e1d5',
                      backgroundColor: '#faf8f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          backgroundColor: '#f3eee6',
                          color: '#766352',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.825rem',
                        }}
                      >
                        {categories.find((c) => c.id === quickViewProduct.category)?.name || quickViewProduct.category}
                      </span>
                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: '#2c2825',
                          margin: 0,
                        }}
                      >
                        {quickViewProduct.name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: '#8c8277' }}>
                        ({prodImages.length} ảnh)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link
                        to={`/admin/products/${quickViewProduct.id}/edit`}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem' }}
                      >
                        <Edit2 size={14} />
                        <span>Chỉnh sửa SP</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(null)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: '#8c8277',
                          padding: '6px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Đóng"
                      >
                        <X size={22} />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body: Dominant Photo View on Left (64%), Details on Right (36%) */}
                  <div
                    className="admin-quick-view-grid"
                    style={{
                      padding: '1.75rem',
                      overflowY: 'auto',
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '2rem',
                      alignItems: 'start',
                    }}
                  >
                    {/* Left: Expansive Image Priority Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Big Active Image Container */}
                      <div
                        style={{
                          width: '100%',
                          height: '560px',
                          maxHeight: '62vh',
                          position: 'relative',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: '#faf8f5',
                          border: '1px solid #e8e1d5',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={currentImg}
                          alt={`${quickViewProduct.name} - Ảnh ${currentIdx + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            transition: 'opacity 0.2s ease',
                          }}
                        />

                        {/* Top-Left Counter Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            backgroundColor: 'rgba(44, 40, 37, 0.75)',
                            backdropFilter: 'blur(6px)',
                            color: '#ffffff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            pointerEvents: 'none',
                          }}
                        >
                          Ảnh {currentIdx + 1} / {prodImages.length}
                        </div>

                        {/* Top-Right Open Original Link */}
                        <a
                          href={currentImg}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            color: '#2c2825',
                            padding: '0.4rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            transition: 'transform 0.15s ease',
                          }}
                          title="Mở ảnh gốc độ phân giải cao trong tab mới"
                        >
                          <ExternalLink size={15} />
                        </a>

                        {/* Prev Arrow */}
                        {prodImages.length > 1 && (
                          <button
                            type="button"
                            onClick={handlePrev}
                            style={{
                              position: 'absolute',
                              left: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                              color: '#2c2825',
                              border: 'none',
                              borderRadius: '50%',
                              width: '42px',
                              height: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                              transition: 'all 0.15s ease',
                            }}
                            title="Ảnh trước"
                          >
                            <ChevronLeft size={22} />
                          </button>
                        )}

                        {/* Next Arrow */}
                        {prodImages.length > 1 && (
                          <button
                            type="button"
                            onClick={handleNext}
                            style={{
                              position: 'absolute',
                              right: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                              color: '#2c2825',
                              border: 'none',
                              borderRadius: '50%',
                              width: '42px',
                              height: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                              transition: 'all 0.15s ease',
                            }}
                            title="Ảnh tiếp theo"
                          >
                            <ChevronRight size={22} />
                          </button>
                        )}
                      </div>

                      {/* Large Thumbnail Row */}
                      {prodImages.length > 1 && (
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.65rem',
                              overflowX: 'auto',
                              paddingBottom: '0.4rem',
                              scrollbarWidth: 'thin',
                            }}
                          >
                            {prodImages.map((imgUrl, idx) => {
                              const isSelected = currentImg === imgUrl;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActivePreviewImg(imgUrl)}
                                  style={{
                                    width: '78px',
                                    height: '78px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: isSelected ? '2.5px solid #766352' : '1px solid #dcd3c5',
                                    padding: 0,
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    backgroundColor: '#faf8f5',
                                    opacity: isSelected ? 1 : 0.65,
                                    transition: 'all 0.15s ease',
                                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                                    boxShadow: isSelected ? '0 2px 8px rgba(118,99,82,0.3)' : 'none',
                                  }}
                                  title={`Xem ảnh ${idx + 1}`}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Ảnh thu nhỏ ${idx + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    loading="lazy"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                {/* Right: Info Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#faf8f5', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e8e1d5' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#766352', marginBottom: '0.5rem' }}>
                      {formatVND(quickViewProduct.price)}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ backgroundColor: '#e8e1d5', color: '#2c2825' }}>
                        {categories.find((c) => c.id === quickViewProduct.category)?.name || quickViewProduct.category}
                      </span>
                      <span className={`badge ${quickViewProduct.type === 'combo' ? 'badge-combo' : 'badge-draft'}`}>
                        {quickViewProduct.type === 'combo' ? 'Bộ Combo' : 'Món lẻ'}
                      </span>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: quickViewProduct.published ? '#e8f5e9' : '#ffebee',
                          color: quickViewProduct.published ? '#2e7d32' : '#c62828',
                        }}
                      >
                        {quickViewProduct.published ? '🟢 Đang công khai' : '🔴 Đang ẩn'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#685e54', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div>
                        <strong>Màu sắc:</strong> {quickViewProduct.colors?.join(', ') || 'Màu tiêu chuẩn'}
                      </div>
                      <div>
                        <strong>Kích thước:</strong> {quickViewProduct.sizes?.join(', ') || 'Tiêu chuẩn'}
                      </div>
                      <div>
                        <strong>Slug web:</strong> <code>/products/{quickViewProduct.slug}</code>
                      </div>
                    </div>
                  </div>

                  {/* Description preview */}
                  {quickViewProduct.description && (
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e8e1d5' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#685e54', display: 'block', marginBottom: '0.4rem' }}>
                        Mô tả sản phẩm:
                      </span>
                      <p style={{ fontSize: '0.85rem', color: '#2c2825', lineHeight: 1.5, margin: 0 }}>
                        {quickViewProduct.description}
                      </p>
                    </div>
                  )}

                  {/* Combo items if any */}
                  {quickViewProduct.type === 'combo' && quickViewProduct.comboItems && quickViewProduct.comboItems.length > 0 && (
                    <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e8e1d5' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#685e54', display: 'block', marginBottom: '0.4rem' }}>
                        Chi tiết các món Combo ({quickViewProduct.comboItems.length} món):
                      </span>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#2c2825' }}>
                        {quickViewProduct.comboItems.map((item, idx) => (
                          <li key={idx} style={{ marginBottom: '0.25rem' }}>
                            <strong>{item.quantity}x</strong> {item.name} {item.note ? `(${item.note})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <Link
                      to={`/products/${quickViewProduct.slug || quickViewProduct.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <ExternalLink size={14} />
                      <span>Xem trên Web</span>
                    </Link>
                    <Link
                      to={`/admin/products/${quickViewProduct.id}/edit`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Edit2 size={14} />
                      <span>Chỉnh sửa</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}
          </div>,
          document.body
        )}

      <style>{`
        @media (min-width: 900px) {
          .admin-quick-view-grid {
            grid-template-columns: minmax(520px, 1.7fr) minmax(320px, 1fr) !important;
            gap: 2.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};
