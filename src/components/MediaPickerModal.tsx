import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Folder,
  X,
  Check,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { mediaService, StorageItem } from '../services/mediaService';
import { productService } from '../services/productService';
import { Category } from '../types/product';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImages: (selectedUrls: string[]) => void;
  initialFolder?: string;
  alreadySelectedUrls?: string[];
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImages,
  initialFolder = '',
  alreadySelectedUrls = [],
}) => {
  const [currentFolder, setCurrentFolder] = useState<string>(initialFolder);
  const [items, setItems] = useState<StorageItem[]>([]);
  const [allFiles, setAllFiles] = useState<StorageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewScope, setViewScope] = useState<'current_folder' | 'all_photos'>('all_photos');

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.warn('Error loading categories:', err);
      }
    }
    loadCats();
  }, []);

  const loadData = async (folder: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [res, recursive] = await Promise.all([
        mediaService.listItems(folder, true),
        mediaService.listAllFilesRecursive('', 4, true),
      ]);
      const visible = res.items.filter((i) => !i.name.startsWith('.'));
      setItems(visible);
      setAllFiles(recursive);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải kho ảnh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUrls([]);
      loadData(currentFolder);
    }
  }, [isOpen, currentFolder]);

  const handleToggleSelect = (url: string) => {
    if (alreadySelectedUrls.includes(url)) {
      return; // Prevent duplicate
    }
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleConfirmSelection = () => {
    const uniqueSelected = selectedUrls.filter((u) => !alreadySelectedUrls.includes(u));
    if (uniqueSelected.length > 0) {
      onSelectImages(uniqueSelected);
    }
    onClose();
  };

  const breadcrumbs = currentFolder ? currentFolder.split('/') : [];

  // Filter items
  const displayedItems = useMemo(() => {
    let list: StorageItem[] = [];

    if (categoryFilter !== 'all' || viewScope === 'all_photos') {
      list = allFiles;
      if (categoryFilter === 'uncategorized') {
        list = list.filter((i) => !i.fullPath.includes('/'));
      } else if (categoryFilter !== 'all') {
        list = list.filter((i) => i.fullPath.startsWith(`${categoryFilter}/`));
      }
    } else {
      list = items;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }

    return list;
  }, [categoryFilter, viewScope, allFiles, items, searchQuery]);

  if (!isOpen) return null;

  return createPortal(
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
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: 'relative',
          width: '95vw',
          maxWidth: '1280px',
          height: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.45)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e8e1d5',
            backgroundColor: '#faf8f5',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2c2825', margin: 0 }}>
              Chọn ảnh từ Kho Online (Supabase Cloud)
            </h3>
            <span style={{ fontSize: '0.775rem', color: '#685e54' }}>
              Tích chọn một hoặc nhiều ảnh để thêm vào sản phẩm (Tổng cộng: {allFiles.length} ảnh)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#8c8277' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Categories Filter Toolbar */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid #e8e1d5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap',
            backgroundColor: '#fdfbf7',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#685e54', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Filter size={12} /> Lọc:
          </span>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setViewScope('all_photos');
            }}
            style={{
              padding: '0.25rem 0.55rem',
              borderRadius: '15px',
              border: categoryFilter === 'all' && viewScope === 'all_photos' ? '1px solid #766352' : '1px solid #e8e1d5',
              backgroundColor: categoryFilter === 'all' && viewScope === 'all_photos' ? '#766352' : '#ffffff',
              color: categoryFilter === 'all' && viewScope === 'all_photos' ? '#ffffff' : '#2c2825',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Tất cả ({allFiles.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('all');
              setViewScope('current_folder');
            }}
            style={{
              padding: '0.25rem 0.55rem',
              borderRadius: '15px',
              border: categoryFilter === 'all' && viewScope === 'current_folder' ? '1px solid #766352' : '1px solid #e8e1d5',
              backgroundColor: categoryFilter === 'all' && viewScope === 'current_folder' ? '#766352' : '#ffffff',
              color: categoryFilter === 'all' && viewScope === 'current_folder' ? '#ffffff' : '#2c2825',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            📁 Thư mục
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('uncategorized');
              setViewScope('all_photos');
            }}
            style={{
              padding: '0.25rem 0.55rem',
              borderRadius: '15px',
              border: categoryFilter === 'uncategorized' ? '1px solid #766352' : '1px solid #e8e1d5',
              backgroundColor: categoryFilter === 'uncategorized' ? '#766352' : '#ffffff',
              color: categoryFilter === 'uncategorized' ? '#ffffff' : '#2c2825',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Chưa phân loại
          </button>

          {categories.map((c) => {
            const isSelected = categoryFilter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(c.id);
                  setViewScope('all_photos');
                }}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '15px',
                  border: isSelected ? '1px solid #766352' : '1px solid #e8e1d5',
                  backgroundColor: isSelected ? '#766352' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#2c2825',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Navigation & Search toolbar */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid #e8e1d5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Breadcrumbs (if folder view) */}
          {viewScope === 'current_folder' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
              {currentFolder && (
                <button
                  type="button"
                  onClick={() => {
                    const parts = currentFolder.split('/');
                    parts.pop();
                    setCurrentFolder(parts.join('/'));
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.15rem 0.4rem', marginRight: '0.25rem' }}
                >
                  <ArrowLeft size={13} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setCurrentFolder('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: currentFolder ? 500 : 700,
                  color: currentFolder ? '#766352' : '#2c2825',
                }}
              >
                🏠 Gốc
              </button>

              {breadcrumbs.map((seg, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    <ChevronRight size={13} color="#9e9387" />
                    <button
                      type="button"
                      onClick={() => {
                        const target = breadcrumbs.slice(0, idx + 1).join('/');
                        setCurrentFolder(target);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: isLast ? 'default' : 'pointer',
                        fontWeight: isLast ? 700 : 500,
                        color: isLast ? '#2c2825' : '#766352',
                      }}
                    >
                      {seg}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#685e54' }}>
              Hiển thị: <strong>{displayedItems.length} ảnh</strong>
            </div>
          )}

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <div style={{ position: 'relative', width: '180px' }}>
              <Search
                size={13}
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9e9387',
                }}
              />
              <input
                type="text"
                placeholder="Tìm tên ảnh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '1.75rem', height: '28px', fontSize: '0.75rem' }}
              />
            </div>
            <button
              type="button"
              onClick={() => loadData(currentFolder)}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.2rem 0.5rem' }}
              title="Tải lại danh sách"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {errorMsg && (
            <div style={{ color: '#c62828', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#766352' }}>
              <RefreshCw size={24} className="spin" />
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Đang tải danh sách ảnh...</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#8c8277' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Chưa có ảnh nào trong mục này.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
                gap: '1rem',
              }}
            >
              {displayedItems.map((item) => {
                if (item.isFolder) {
                  return (
                    <div
                      key={item.name}
                      onClick={() => {
                        const next = currentFolder ? `${currentFolder}/${item.name}` : item.name;
                        setCurrentFolder(next);
                        setViewScope('current_folder');
                      }}
                      style={{
                        border: '1px solid #e8e1d5',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#faf8f5',
                      }}
                    >
                      <Folder size={36} color="#bfa382" style={{ margin: '0 auto 0.25rem' }} />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#2c2825',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                  );
                }

                const isAlreadyAdded = item.publicUrl ? alreadySelectedUrls.includes(item.publicUrl) : false;
                const isSelected = item.publicUrl ? selectedUrls.includes(item.publicUrl) : false;
                const folderPrefix = item.fullPath.includes('/') ? item.fullPath.split('/')[0] : '';
                const catObj = categories.find((c) => c.id === folderPrefix);

                return (
                  <div
                    key={item.fullPath}
                    onClick={() => {
                      if (isAlreadyAdded) return;
                      if (item.publicUrl) handleToggleSelect(item.publicUrl);
                    }}
                    style={{
                      border: isAlreadyAdded
                        ? '1.5px solid #a5d6a7'
                        : isSelected
                        ? '2.5px solid #766352'
                        : '1px solid #e8e1d5',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                      backgroundColor: isAlreadyAdded ? '#f6fbf6' : '#ffffff',
                      opacity: isAlreadyAdded ? 0.75 : 1,
                    }}
                    title={isAlreadyAdded ? 'Ảnh này đã có trong sản phẩm' : item.name}
                  >
                    <div style={{ width: '100%', paddingTop: '100%', position: 'relative' }}>
                      <img
                        src={item.publicUrl}
                        alt={item.name}
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

                      {/* Category pill */}
                      {catObj && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '4px',
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            padding: '1px 5px',
                            borderRadius: '8px',
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: '#685e54',
                          }}
                        >
                          {catObj.name}
                        </span>
                      )}

                      {/* Select check badge or Already added badge */}
                      {isAlreadyAdded ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            backgroundColor: '#2e7d32',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        >
                          Đã thêm
                        </div>
                      ) : (
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#766352' : 'rgba(255,255,255,0.85)',
                            border: isSelected ? 'none' : '1px solid #dcd3c5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                          }}
                        >
                          {isSelected && <Check size={14} />}
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '0.35rem 0.5rem', backgroundColor: isAlreadyAdded ? '#f0f9f0' : isSelected ? '#f5eee6' : '#ffffff' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#2c2825',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer toolbar */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid #e8e1d5',
            backgroundColor: '#faf8f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#685e54' }}>
            Đã chọn: <strong>{selectedUrls.length}</strong> ảnh
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={selectedUrls.length === 0}
              onClick={handleConfirmSelection}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <CheckCircle size={15} />
              <span>Thêm {selectedUrls.length} ảnh đã chọn</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
