import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  X,
  Star,
  Eye,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  GripVertical,
  FolderPlus,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Category, ProductColor, ComboItem } from '../types/product';
import { productService } from '../services/productService';
import { DEFAULT_COLORS } from '../data/colors';
import { SITE_CONFIG } from '../config/site';
import { normalizeVietnamese } from '../utils/filterProducts';
import { ProductCard } from '../components/ProductCard';
import { MediaPickerModal } from '../components/MediaPickerModal';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('bo-chan-ga');
  const [price, setPrice] = useState<number | ''>(350000);
  const [type, setType] = useState<'single' | 'combo'>('single');
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>(['be']);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['1m6 x 2m', '1m8 x 2m']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Combo items
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Auto-generate slug when name changes (if creating new)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode) {
      const generated = normalizeVietnamese(val)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Load initial data
  useEffect(() => {
    async function init() {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);

        if (isEditMode && id) {
          const existing = await productService.getProductByIdAdmin(id);
          if (existing) {
            setCode(existing.id);
            setName(existing.name);
            setSlug(existing.slug);
            setCategoryId(existing.category);
            setPrice(existing.price);
            setType(existing.type);
            setSelectedColors(existing.colors || []);
            setSelectedSizes(existing.sizes || []);
            setDescription(existing.description || '');
            setFeatured(Boolean(existing.featured));
            setPublished(existing.published !== false);
            setImages(existing.images || []);
            setCoverImage(existing.coverImage || existing.images?.[0] || '');
            setComboItems(existing.comboItems || []);
          } else {
            setErrorMsg(`Không tìm thấy sản phẩm với mã: ${id}`);
          }
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, isEditMode]);

  // Color Toggle
  const toggleColor = (colorId: ProductColor) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((c) => c !== colorId) : [...prev, colorId]
    );
  };

  // Size Toggle
  const toggleSize = (sizeVal: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeVal) ? prev.filter((s) => s !== sizeVal) : [...prev, sizeVal]
    );
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSizeInput.trim() && !selectedSizes.includes(customSizeInput.trim())) {
      setSelectedSizes([...selectedSizes, customSizeInput.trim()]);
      setCustomSizeInput('');
    }
  };

  // Combo items management
  const handleAddComboItem = () => {
    setComboItems([...comboItems, { name: '', quantity: 1, note: '' }]);
  };

  const handleUpdateComboItem = (index: number, updates: Partial<ComboItem>) => {
    setComboItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveComboItem = (index: number) => {
    setComboItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Core upload file logic
  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    if (!code.trim()) {
      setErrorMsg('Vui lòng nhập Mã sản phẩm (Code) trước khi tải ảnh lên.');
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await productService.uploadProductImage(file, code);
        uploadedUrls.push(url);
      }

      setImages((prev) => {
        const updated = [...prev, ...uploadedUrls];
        if (!coverImage && updated.length > 0) {
          setCoverImage(updated[0]);
        }
        return updated;
      });
      setSuccessMsg(`Đã tải lên ${uploadedUrls.length} ảnh thành công.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  // Image upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Image actions
  const handleRemoveImage = (index: number) => {
    const target = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    setImages(remaining);
    if (coverImage === target) {
      setCoverImage(remaining[0] || '');
    }
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const list = [...images];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setImages(list);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!code.trim()) {
      setErrorMsg('Mã sản phẩm không được để trống (ví dụ: GA001, BCG001).');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Tên sản phẩm không được để trống.');
      return;
    }
    if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
      setErrorMsg('Giá sản phẩm phải là một số hợp lệ lớn hơn hoặc bằng 0.');
      return;
    }

    const finalSlug =
      slug.trim() ||
      normalizeVietnamese(name)
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const finalCover = coverImage || images[0] || '';

    const productPayload: Partial<Product> = {
      id: code.trim().toUpperCase(),
      name: name.trim(),
      slug: finalSlug,
      category: categoryId,
      price: Number(price),
      currency: 'VND',
      type,
      colors: selectedColors,
      sizes: selectedSizes,
      description: description.trim(),
      comboItems: type === 'combo' ? comboItems : [],
      images,
      coverImage: finalCover,
      featured,
      published,
    };

    setSaving(true);
    try {
      if (isEditMode && id) {
        await productService.updateProduct(id, productPayload);
        setSuccessMsg(`Đã cập nhật sản phẩm "${name}" thành công!`);
      } else {
        await productService.createProduct(productPayload);
        setSuccessMsg(`Đã thêm mới sản phẩm "${name}" thành công!`);
      }
      setTimeout(() => navigate('/admin/products'), 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#766352' }}>
        <RefreshCw size={26} className="spin" />
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  const currentPreviewProduct: Product = {
    id: code || 'MA-SP',
    name: name || 'Tên sản phẩm mẫu',
    slug: slug || 'san-pham-mau',
    category: categoryId,
    price: Number(price) || 0,
    currency: 'VND',
    type,
    colors: selectedColors,
    sizes: selectedSizes,
    description: description || 'Mô tả tóm tắt chất liệu đũi/linen...',
    images: images.length > 0 ? images : ['/images/placeholder.webp'],
    coverImage: coverImage || images[0] || '/images/placeholder.webp',
    featured,
    published,
    comboItems,
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/products" className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
            <span>Danh sách</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2c2825' }}>
            {isEditMode ? `Chỉnh sửa sản phẩm: ${code}` : 'Thêm sản phẩm mới'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!isEditMode && (
            <Link
              to="/admin/products/bulk"
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#766352' }}
              title="Thêm hàng loạt sản phẩm bằng cách kéo thả folder"
            >
              <FolderPlus size={16} />
              <span>Nhập từ Folder (nhiều SP)</span>
            </Link>
          )}

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowPreviewModal(true)}
          >
            <Eye size={16} />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {/* Messages */}
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
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="admin-form-grid">
          {/* Main Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* General Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid #f2ede4', paddingBottom: '0.5rem' }}>
                Thông tin cơ bản
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="p-code">
                    Mã sản phẩm * (Unique)
                  </label>
                  <input
                    id="p-code"
                    type="text"
                    required
                    disabled={isEditMode}
                    placeholder="VD: GA001, BCG002"
                    className="form-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                  <span className="form-help">Mã định danh sản phẩm dùng để khách gửi tin nhắn Zalo/Messenger.</span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="p-type">
                    Loại sản phẩm
                  </label>
                  <select
                    id="p-type"
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as 'single' | 'combo')}
                  >
                    <option value="single">Món lẻ / Set đơn</option>
                    <option value="combo">Bộ Combo nhiều món</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="p-name">
                  Tên sản phẩm *
                </label>
                <input
                  id="p-name"
                  type="text"
                  required
                  placeholder="VD: Bộ chăn ga đũi tự nhiên màu Be Cát"
                  className="form-input"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="p-slug">
                    Đường dẫn URL (Slug)
                  </label>
                  <input
                    id="p-slug"
                    type="text"
                    required
                    placeholder="set-bo-chan-ga-dui-mau-be"
                    className="form-input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="p-category">
                    Danh mục sản phẩm *
                  </label>
                  <select
                    id="p-category"
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="p-price">
                  Giá niêm yết (VND) *
                </label>
                <input
                  id="p-price"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="380000"
                  className="form-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <span className="form-help">Lưu dạng số nguyên (VND), không nhập dấu chấm phẩy.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="p-desc">
                  Mô tả sản phẩm & thông tin chất liệu
                </label>
                <textarea
                  id="p-desc"
                  rows={4}
                  className="form-textarea"
                  placeholder="Mô tả bề mặt vải, xử lý wash, độ thoáng mát, cách bảo quản..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Colors and Sizes Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid #f2ede4', paddingBottom: '0.5rem' }}>
                Màu sắc & Kích thước
              </h2>

              {/* Colors */}
              <div className="form-group">
                <label className="form-label">Màu sắc có sẵn</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {DEFAULT_COLORS.map((col) => {
                    const isSelected = selectedColors.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleColor(col.id)}
                        className={`color-filter-pill ${isSelected ? 'active' : ''}`}
                      >
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: col.hex,
                            border: '1px solid rgba(0,0,0,0.15)',
                            display: 'inline-block',
                          }}
                        />
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Kích thước</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {SITE_CONFIG.standardSizes.map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`filter-chip ${isSelected ? 'active' : ''}`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {/* Add custom size */}
                <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '320px' }}>
                  <input
                    type="text"
                    placeholder="Thêm cỡ khác (VD: 2m2 x 2m4)..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    className="form-input"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="btn btn-outline btn-sm"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Combo Items breakdown if Combo */}
            {type === 'combo' && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Chi tiết món trong Combo</h2>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleAddComboItem}
                  >
                    <Plus size={14} />
                    <span>Thêm món</span>
                  </button>
                </div>

                {comboItems.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#8c8277' }}>
                    Chưa có món thành phần. Bấm "Thêm món" để liệt kê các món bao gồm trong combo.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {comboItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 2fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          backgroundColor: '#fbfaf8',
                          padding: '0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #ede7dc',
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Tên món (VD: Ga chun đũi)"
                          value={item.name}
                          onChange={(e) => handleUpdateComboItem(idx, { name: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="SL"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateComboItem(idx, { quantity: Number(e.target.value) || 1 })
                          }
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Ghi chú (VD: 1m8 x 2m)"
                          value={item.note || ''}
                          onChange={(e) => handleUpdateComboItem(idx, { note: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveComboItem(idx)}
                          style={{ color: '#c62828', padding: '0.35rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Images & Publishing Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Status & Visibility Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #f2ede4', paddingBottom: '0.5rem' }}>
                Trạng thái hiển thị
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#766352' }}
                  />
                  <span>
                    <strong>Công khai sản phẩm</strong> (Khách hàng có thể thấy trên catalog)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#766352' }}
                  />
                  <span>
                    <strong>Sản phẩm nổi bật</strong> (Ghim lên đầu trang chủ)
                  </span>
                </label>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f2ede4' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={saving || uploadingImage}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Đang lưu sản phẩm...</span>
                    </>
                  ) : (
                    <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo sản phẩm mới'}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Images Upload Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8e1d5', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Hình ảnh sản phẩm ({images.length})</h2>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                  title="Chọn ảnh đã tải lên Supabase Storage"
                >
                  <ImageIcon size={15} />
                  <span>Chọn từ Kho ảnh Online</span>
                </button>
              </div>

              {/* Upload trigger */}
              <div
                style={{
                  border: isDraggingFiles ? '2px dashed #766352' : '2px dashed #dcd3c5',
                  backgroundColor: isDraggingFiles ? '#f3eee6' : '#faf8f5',
                  borderRadius: '8px',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => document.getElementById('image-upload-input')?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFiles(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFiles(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingFiles(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    uploadFiles(e.dataTransfer.files);
                  }
                }}
              >
                <Upload size={24} color="#766352" style={{ margin: '0 auto 0.5rem' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#2c2825', display: 'block' }}>
                  {uploadingImage
                    ? 'Đang tải ảnh lên Storage...'
                    : isDraggingFiles
                    ? 'Thả ảnh vào đây để tải lên'
                    : 'Kéo thả ảnh vào đây hoặc bấm để chọn'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8c8277' }}>
                  Hỗ trợ kéo thả nhiều ảnh JPG, PNG, WebP (Tối đa 5MB/ảnh)
                </span>
                <input
                  id="image-upload-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                />
              </div>

              {/* Image List */}
              {images.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#8c8277', textAlign: 'center' }}>
                  Chưa có ảnh nào. Sản phẩm sẽ dùng ảnh mặc định nếu để trống.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8c8277', display: 'block', marginBottom: '0.25rem' }}>
                    💡 Kéo thả biểu tượng ⠿ để đổi vị trí ảnh, hoặc bấm nút mũi tên:
                  </span>
                  {images.map((imgUrl, idx) => {
                    const isCover = (coverImage || images[0]) === imgUrl;
                    const isDraggingThis = draggedImgIdx === idx;
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => {
                          setDraggedImgIdx(idx);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedImgIdx === null || draggedImgIdx === idx) return;
                          const list = [...images];
                          const [item] = list.splice(draggedImgIdx, 1);
                          list.splice(idx, 0, item);
                          setImages(list);
                          setDraggedImgIdx(null);
                        }}
                        onDragEnd={() => setDraggedImgIdx(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem',
                          backgroundColor: isCover ? '#f8f4ed' : '#fdfbf7',
                          border: isDraggingThis
                            ? '2px dashed #766352'
                            : isCover
                            ? '1px solid #766352'
                            : '1px solid #e8e1d5',
                          borderRadius: '6px',
                          opacity: isDraggingThis ? 0.5 : 1,
                          cursor: 'grab',
                          transition: 'border 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            color: '#9e9387',
                            cursor: 'grab',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Kéo thả để sắp xếp lại thứ tự ảnh"
                        >
                          <GripVertical size={16} />
                        </div>

                        <img
                          src={imgUrl}
                          alt={`Ảnh ${idx + 1}`}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            backgroundColor: '#e8e1d5',
                            flexShrink: 0,
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '0.775rem',
                              color: '#685e54',
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {imgUrl.split('/').pop()}
                          </span>
                          {isCover && (
                            <span style={{ fontSize: '0.7rem', color: '#766352', fontWeight: 600 }}>
                              ★ Ảnh bìa chính
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => setCoverImage(imgUrl)}
                              style={{
                                fontSize: '0.75rem',
                                color: '#766352',
                                padding: '0.2rem 0.4rem',
                                border: '1px solid #dcd3c5',
                                borderRadius: '4px',
                              }}
                              title="Đặt làm ảnh bìa"
                            >
                              <Star size={12} />
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, 'up')}
                            style={{ padding: '0.2rem', color: '#685e54', opacity: idx === 0 ? 0.3 : 1 }}
                            title="Di chuyển lên"
                          >
                            <ArrowUp size={14} />
                          </button>

                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => handleMoveImage(idx, 'down')}
                            style={{
                              padding: '0.2rem',
                              color: '#685e54',
                              opacity: idx === images.length - 1 ? 0.3 : 1,
                            }}
                            title="Di chuyển xuống"
                          >
                            <ArrowDown size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{ padding: '0.2rem', color: '#c62828' }}
                            title="Xóa ảnh này"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Live Preview Modal */}
      {showPreviewModal &&
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
              onClick={() => setShowPreviewModal(false)}
            />

            {/* Modal Dialog Content (Crisp, foreground) */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '840px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                zIndex: 10001,
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid #e8e1d5',
                  paddingBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={20} color="#766352" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2c2825' }}>
                    Xem trước hiển thị sản phẩm
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#8c8277',
                    padding: '4px',
                    borderRadius: '4px',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem',
                  alignItems: 'flex-start',
                }}
              >
                {/* Product Card preview */}
                <div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#685e54',
                      display: 'block',
                      marginBottom: '0.6rem',
                    }}
                  >
                    1. Hiển thị dạng Thẻ (Trang chủ / Danh mục):
                  </span>
                  <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <ProductCard product={currentPreviewProduct} />
                  </div>
                </div>

                {/* Quick details breakdown */}
                <div
                  style={{
                    backgroundColor: '#faf8f5',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #e8e1d5',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#685e54',
                      display: 'block',
                      marginBottom: '0.6rem',
                    }}
                  >
                    2. Thông số sản phẩm đang soạn:
                  </span>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <strong>Mã sản phẩm:</strong> <code>{currentPreviewProduct.id}</code>
                    </div>
                    <div>
                      <strong>Tên:</strong> {currentPreviewProduct.name}
                    </div>
                    <div>
                      <strong>Đường dẫn (slug):</strong> /products/{currentPreviewProduct.slug}
                    </div>
                    <div>
                      <strong>Giá:</strong> {Number(price).toLocaleString('vi-VN')} đ
                    </div>
                    <div>
                      <strong>Trạng thái:</strong>{' '}
                      {published ? (
                        <span style={{ color: '#1b5e20', fontWeight: 600 }}>🟢 Công khai</span>
                      ) : (
                        <span style={{ color: '#b71c1c', fontWeight: 600 }}>🔴 Đang ẩn</span>
                      )}
                    </div>
                    <div>
                      <strong>Ảnh đại diện:</strong> {currentPreviewProduct.coverImage}
                    </div>
                    <div>
                      <strong>Số lượng ảnh:</strong> {images.length} ảnh
                    </div>
                    <div>
                      <strong>Màu sắc:</strong> {selectedColors.join(', ') || 'Chưa chọn'}
                    </div>
                    <div>
                      <strong>Kích thước:</strong> {selectedSizes.join(', ') || 'Chưa chọn'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Đóng xem trước
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelectImages={(newUrls) => {
          setImages((prev) => {
            const updated = [...prev, ...newUrls];
            if (!coverImage && updated.length > 0) {
              setCoverImage(updated[0]);
            }
            return updated;
          });
          setSuccessMsg(`Đã thêm ${newUrls.length} ảnh từ Kho online vào sản phẩm!`);
          setTimeout(() => setSuccessMsg(''), 3000);
        }}
        initialFolder={code || ''}
      />

      <style>{`
        @media (min-width: 960px) {
          .admin-form-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
