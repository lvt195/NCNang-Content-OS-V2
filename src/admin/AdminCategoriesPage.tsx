import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Category } from '../types/product';
import { productService } from '../services/productService';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing or creating modal
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsNew(true);
    setEditingCategory({
      id: '',
      name: '',
      description: '',
      displayOrder: categories.length + 1,
    });
  };

  const handleOpenEdit = (cat: Category) => {
    setIsNew(false);
    setEditingCategory({ ...cat });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.id?.trim() || !editingCategory?.name?.trim()) {
      setErrorMsg('Vui lòng điền mã danh mục và tên danh mục.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      if (isNew) {
        await productService.createCategory(editingCategory as Category);
        setSuccessMsg(`Đã tạo danh mục "${editingCategory.name}" thành công!`);
      } else {
        await productService.updateCategory(editingCategory.id, editingCategory);
        setSuccessMsg(`Đã cập nhật danh mục "${editingCategory.name}" thành công!`);
      }
      setEditingCategory(null);
      await loadCategories();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" (${id})?`)) return;

    try {
      await productService.deleteCategory(id);
      setSuccessMsg(`Đã xóa danh mục "${name}" thành công.`);
      await loadCategories();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi xóa danh mục');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#2c2825' }}>
            Quản lý Danh mục Sản phẩm
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.2rem' }}>
            Cấu hình các phân loại hàng hóa trên website ({categories.length} danh mục)
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          <PlusCircle size={18} />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#edf7ed', border: '1px solid #c8e6c9', color: '#1b5e20', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#fdeeed', border: '1px solid #f9c7c4', color: '#b71c1c', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="admin-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#766352' }}>
            <RefreshCw size={24} className="spin" />
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Đang tải danh mục...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Thứ tự</th>
                <th>Mã ID</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="badge badge-draft">{c.displayOrder || 0}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#766352' }}>
                    <code>{c.id}</code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: '#685e54', fontSize: '0.85rem' }}>{c.description}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.5rem' }}
                        title="Sửa danh mục"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.5rem', color: '#c62828', borderColor: '#f9c7c4' }}
                        title="Xóa danh mục"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {editingCategory && (
        <>
          <div className="drawer-backdrop" onClick={() => !saving && setEditingCategory(null)} />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '480px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              zIndex: 999,
              padding: '1.75rem',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              {isNew ? 'Thêm danh mục mới' : `Chỉnh sửa: ${editingCategory.name}`}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Mã ID (Slug) *</label>
                <input
                  type="text"
                  required
                  disabled={!isNew}
                  placeholder="VD: dem-topper, chan-he"
                  className="form-input"
                  value={editingCategory.id || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })
                  }
                />
                <span className="form-help">Mã danh mục viết liền không dấu.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Tên hiển thị *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nệm Topper Tự Nhiên"
                  className="form-input"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thứ tự hiển thị</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={editingCategory.displayOrder || 0}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  value={editingCategory.description || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditingCategory(null)}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu danh mục'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
