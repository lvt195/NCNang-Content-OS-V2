import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { mediaService, StorageItem } from '../services/mediaService';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImages: (selectedUrls: string[]) => void;
  initialFolder?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImages,
  initialFolder = '',
}) => {
  const [currentFolder, setCurrentFolder] = useState<string>(initialFolder);
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const loadFolder = async (folder: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await mediaService.listItems(folder);
      const visible = res.items.filter((i) => !i.name.startsWith('.'));
      setItems(visible);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải kho ảnh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUrls([]);
      loadFolder(currentFolder);
    }
  }, [isOpen, currentFolder]);

  if (!isOpen) return null;

  const handleToggleSelect = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const handleConfirmSelection = () => {
    if (selectedUrls.length > 0) {
      onSelectImages(selectedUrls);
    }
    onClose();
  };

  const breadcrumbs = currentFolder ? currentFolder.split('/') : [];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

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
          width: '94%',
          maxWidth: '880px',
          height: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
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
              Tích chọn một hoặc nhiều ảnh để thêm vào sản phẩm
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
          {/* Breadcrumbs */}
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

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                placeholder="Tìm ảnh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '1.75rem', height: '28px', fontSize: '0.75rem' }}
              />
            </div>
            <button
              type="button"
              onClick={() => loadFolder(currentFolder)}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.2rem 0.5rem' }}
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
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#8c8277' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Thư mục này chưa có ảnh nào.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {filteredItems.map((item) => {
                if (item.isFolder) {
                  return (
                    <div
                      key={item.name}
                      onClick={() => {
                        const next = currentFolder ? `${currentFolder}/${item.name}` : item.name;
                        setCurrentFolder(next);
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

                const isSelected = item.publicUrl ? selectedUrls.includes(item.publicUrl) : false;

                return (
                  <div
                    key={item.fullPath}
                    onClick={() => item.publicUrl && handleToggleSelect(item.publicUrl)}
                    style={{
                      border: isSelected ? '2px solid #766352' : '1px solid #e8e1d5',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                    }}
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

                      {/* Select check badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: isSelected ? '#766352' : 'rgba(255,255,255,0.85)',
                          border: isSelected ? 'none' : '1px solid #dcd3c5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        {isSelected && <Check size={13} />}
                      </div>
                    </div>

                    <div style={{ padding: '0.35rem 0.5rem', backgroundColor: isSelected ? '#f5eee6' : '#ffffff' }}>
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
