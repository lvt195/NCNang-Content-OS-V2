import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StorageItem {
  id?: string | null;
  name: string;
  isFolder: boolean;
  fullPath: string;
  publicUrl?: string;
  size?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const BUCKET_NAME = 'product-images';

export const mediaService = {
  /**
   * List files and folders in a given path (folder)
   */
  async listItems(folder = ''): Promise<{ items: StorageItem[]; currentPath: string }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase chưa được cấu hình.');
    }

    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(cleanFolder, {
      limit: 200,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(`Lỗi tải danh sách ảnh: ${error.message}`);
    }

    const items: StorageItem[] = (data || []).map((entry) => {
      // In Supabase Storage, if entry.id is null or metadata is null, it's a folder
      const isFolder = !entry.id || !entry.metadata;
      const fullPath = cleanFolder ? `${cleanFolder}/${entry.name}` : entry.name;
      
      let publicUrl: string | undefined;
      if (!isFolder) {
        const { data: urlData } = supabase!.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
        publicUrl = urlData.publicUrl;
      }

      return {
        id: entry.id,
        name: entry.name,
        isFolder,
        fullPath,
        publicUrl,
        size: entry.metadata?.size,
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
      };
    });

    // Sort: Folders first, then files
    items.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    return { items, currentPath: cleanFolder };
  },

  /**
   * Upload an image file to a specific folder in bucket
   */
  async uploadFile(file: File, folder = ''): Promise<StorageItem> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase chưa được cấu hình.');
    }

    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const timestamp = Date.now();
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const fileName = `${timestamp}_${cleanName}.${ext}`;
    const fullPath = cleanFolder ? `${cleanFolder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fullPath, file, {
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Lỗi tải ảnh: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);

    return {
      name: fileName,
      isFolder: false,
      fullPath,
      publicUrl: urlData.publicUrl,
      size: file.size,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Create a new folder (by creating a placeholder marker)
   */
  async createFolder(folderName: string, parentPath = ''): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase chưa được cấu hình.');
    }

    const cleanParent = parentPath.replace(/^\/+|\/+$/g, '');
    const cleanFolderName = folderName
      .trim()
      .toUpperCase()
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    if (!cleanFolderName) {
      throw new Error('Tên thư mục không hợp lệ.');
    }

    const targetPath = cleanParent
      ? `${cleanParent}/${cleanFolderName}/.folder_marker`
      : `${cleanFolderName}/.folder_marker`;

    // Empty blob
    const markerBlob = new Blob([''], { type: 'text/plain' });

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(targetPath, markerBlob, { upsert: true });

    if (error) {
      throw new Error(`Lỗi tạo thư mục: ${error.message}`);
    }
  },

  /**
   * Delete a single file by full path
   */
  async deleteFile(fullPath: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([fullPath]);
    if (error) {
      throw new Error(`Lỗi xóa file: ${error.message}`);
    }
  },

  /**
   * Delete an entire folder and all its contents
   */
  async deleteFolder(folderPath: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(cleanFolder, { limit: 1000 });

    if (listError) {
      throw new Error(`Lỗi quét file trong thư mục: ${listError.message}`);
    }

    if (files && files.length > 0) {
      const pathsToDelete = files.map((f) => `${cleanFolder}/${f.name}`);
      const { error: removeError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(pathsToDelete);

      if (removeError) {
        throw new Error(`Lỗi xóa các file trong thư mục: ${removeError.message}`);
      }
    }
  },
};
