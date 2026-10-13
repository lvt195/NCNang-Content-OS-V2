import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Folder,
  FolderPlus,
  Upload,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Search,
  ArrowLeft,
  ChevronRight,
  Eye,
  X,
  FileImage,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { mediaService, StorageItem } from '../services/mediaService';

export const AdminMediaLibraryPage: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New folder modal
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  // Preview modal
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);

  // Delete confirm modal
  const [itemToDelete, setItemToDelete] = useState<StorageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadMedia = async (folder: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await mediaService.listItems(folder);
      // Filter out internal marker files like .folder_marker
      const visibleItems = res.items.filter((i) => !i.name.startsWith('.'));
      setItems(visibleItems);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải kho ảnh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(currentFolder);
  }, [currentFolder]);

  // Navigate folder
  const handleOpenFolder = (folderName: string) => {
    const nextPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    setCurrentFolder(nextPath);
  };

  const handleNavigateBreadcrumb = (index: number, segments: string[]) => {
    if (index === -1) {
      setCurrentFolder('');
    } else {
      const targetPath = segments.slice(0, index + 1).join('/');
      setCurrentFolder(targetPath);
    }
  };

  const handleBackOneLevel = () => {
    if (!currentFolder) return;
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
  };

  // Upload files
  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      setErrorMsg('Vui lòng chọn file hình ảnh (JPG, PNG, WebP, AVIF).');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setUploadProgress(`Đang tải 0/${fileArray.length} ảnh...`);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        setUploadProgress(`Đang tải ${i + 1}/${fileArray.length} ảnh...`);
        await mediaService.uploadFile(fileArray[i], currentFolder);
      }
      setSuccessMsg(`Đã tải lên ${fileArray.length} ảnh thành công!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tải ảnh');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Create folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    setErrorMsg('');
    try {
      await mediaService.createFolder(newFolderName.trim(), currentFolder);
      setSuccessMsg(`Đã tạo thư mục "${newFolderName.trim().toUpperCase()}"!`);
      setShowNewFolderModal(false);
      setNewFolderName('');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi tạo thư mục');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Delete file or folder
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (itemToDelete.isFolder) {
        await mediaService.deleteFolder(itemToDelete.fullPath);
      } else {
        await mediaService.deleteFile(itemToDelete.fullPath);
      }
      setSuccessMsg(`Đã xóa "${itemToDelete.name}" thành công.`);
      setItemToDelete(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadMedia(currentFolder);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi xóa');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const breadcrumbs = currentFolder ? currentFolder.split('/') : [];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2c2825', margin: 0 }}>
            Kho Ảnh Online (Media Library)
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#685e54', margin: '3px 0 0' }}>
            Lưu trữ trên Supabase Storage Cloud • Băng thông cao • Truy cập mọi nơi
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FolderPlus size={16} />
            <span>Tạo thư mục</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary btn-sm"
            disabled={isUploading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Upload size={16} />
            <span>{isUploading ? uploadProgress : 'Tải ảnh lên'}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#edf7ed',
            border: '1px solid #c8e6c9',
            color: '#1b5e20',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
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
            marginBottom: '1rem',
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

      {/* Navigation & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e8e1d5',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Breadcrumb path */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
          {currentFolder && (
            <button
              type="button"
              onClick={handleBackOneLevel}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.2rem 0.45rem', marginRight: '0.25rem' }}
              title="Quay lại thư mục trước"
            >
              <ArrowLeft size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavigateBreadcrumb(-1, [])}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: currentFolder ? '#766352' : '#2c2825',
              fontWeight: currentFolder ? 500 : 700,
              padding: '2px 4px',
            }}
          >
            🏠 Thư mục Gốc
          </button>

          {breadcrumbs.map((seg, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                <ChevronRight size={14} color="#9e9387" />
                <button
                  type="button"
                  onClick={() => handleNavigateBreadcrumb(idx, breadcrumbs)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: isLast ? 'default' : 'pointer',
                    color: isLast ? '#2c2825' : '#766352',
                    fontWeight: isLast ? 700 : 500,
                    padding: '2px 4px',
                  }}
                >
                  {seg}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Search & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <div style={{ position: 'relative', width: '200px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9e9387',
              }}
            />
            <input
              type="text"
              placeholder="Tìm file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2rem', paddingRight: '0.5rem', fontSize: '0.8rem', height: '32px' }}
            />
          </div>

          <button
            type="button"
            onClick={() => loadMedia(currentFolder)}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem 0.6rem' }}
            title="Làm mới danh sách"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Drag & Drop Overlay Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUploadFiles(e.dataTransfer.files);
          }
        }}
        style={{
          border: isDraggingOver ? '2px dashed #766352' : '2px dashed transparent',
          backgroundColor: isDraggingOver ? '#f7f4ee' : 'transparent',
          borderRadius: '10px',
          transition: 'all 0.2s ease',
          minHeight: '300px',
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#766352' }}>
            <RefreshCw size={26} className="spin" />
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Đang tải ảnh từ Supabase Cloud...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e8e1d5',
            }}
          >
            <FileImage size={40} color="#b4a99a" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2c2825' }}>
              {searchQuery ? 'Không tìm thấy file phù hợp' : 'Thư mục này hiện đang trống'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#8c8277', marginTop: '0.25rem' }}>
              Kéo thả file ảnh vào đây hoặc bấm nút "Tải ảnh lên" phía trên để lưu ảnh lên Supabase.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {filteredItems.map((item) => {
              if (item.isFolder) {
                return (
                  <div
                    key={item.name}
                    onClick={() => handleOpenFolder(item.name)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e8e1d5',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#766352';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e8e1d5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Folder size={48} color="#bfa382" style={{ marginBottom: '0.5rem' }} />
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#2c2825',
                        textAlign: 'center',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#9e9387', marginTop: '2px' }}>
                      Thư mục
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#c62828',
                        padding: '4px',
                        opacity: 0.6,
                      }}
                      title="Xóa thư mục"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              }

              // Image item card
              return (
                <div
                  key={item.fullPath}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8e1d5',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '85%',
                      backgroundColor: '#f3eee6',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPreviewItem(item)}
                  >
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

                    {/* Preview overlay icon */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <Eye size={22} />
                    </div>
                  </div>

                  {/* Body details */}
                  <div style={{ padding: '0.6rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontSize: '0.775rem',
                        fontWeight: 500,
                        color: '#2c2825',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </span>

                    <span style={{ fontSize: '0.7rem', color: '#9e9387', marginTop: '2px' }}>
                      {formatFileSize(item.size)}
                    </span>
                  </div>

                  {/* Actions bar */}
                  <div
                    style={{
                      borderTop: '1px solid #f0eae1',
                      padding: '0.4rem 0.6rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#faf8f5',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.publicUrl || '')}
                      className="btn btn-outline btn-sm"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Sao chép link ảnh"
                    >
                      {copiedUrl === item.publicUrl ? <Check size={12} color="#1b5e20" /> : <Copy size={12} />}
                      <span>{copiedUrl === item.publicUrl ? 'Đã chép' : 'Copy link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#c62828',
                        padding: '4px',
                      }}
                      title="Xóa ảnh khỏi kho"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Folder */}
      {showNewFolderModal &&
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => !isCreatingFolder && setShowNewFolderModal(false)}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                padding: '1.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
                Tạo Thư Mục Mới
              </h3>
              <form onSubmit={handleCreateFolder}>
                <div className="form-group">
                  <label className="form-label">Tên thư mục (Mã SP hoặc Danh mục)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: GA001, CHAN_HE, TOPPER..."
                    className="form-input"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                  <span className="form-help">
                    Thư mục sẽ được tạo trong: <strong>{currentFolder || 'Thư mục gốc'}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowNewFolderModal(false)}
                    disabled={isCreatingFolder}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isCreatingFolder}>
                    {isCreatingFolder ? 'Đang tạo...' : 'Tạo thư mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Full Preview */}
      {previewItem &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => setPreviewItem(null)}
            />
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                zIndex: 10001,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #e8e1d5',
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2c2825' }}>
                  {previewItem.name} ({formatFileSize(previewItem.size)})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(previewItem.publicUrl || '')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Copy size={13} />
                    <span>Copy link</span>
                  </button>
                  <a
                    href={previewItem.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '1rem', textAlign: 'center', overflow: 'auto', maxHeight: '78vh' }}>
                <img
                  src={previewItem.publicUrl}
                  alt={previewItem.name}
                  style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '6px' }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Delete Confirmation */}
      {itemToDelete &&
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
              }}
              onClick={() => !isDeleting && setItemToDelete(null)}
            />
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '440px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
                zIndex: 10001,
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#c62828' }}>
                <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2c2825' }}>
                    Xác nhận xóa {itemToDelete.isFolder ? 'thư mục' : 'ảnh'}?
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#685e54', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    Bạn có chắc muốn xóa{' '}
                    <strong>{itemToDelete.name}</strong>?{' '}
                    {itemToDelete.isFolder && 'Toàn bộ ảnh bên trong thư mục này cũng sẽ bị xóa vĩnh viễn.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setItemToDelete(null)}
                  disabled={isDeleting}
                >
                  Hủy
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
