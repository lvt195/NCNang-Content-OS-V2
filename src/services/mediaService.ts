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

export interface DuplicateGroup {
  size: number;
  items: StorageItem[];
}

const BUCKET_NAME = 'product-images';

// In-memory cache for media items to prevent reloading every time
const listCache = new Map<string, { items: StorageItem[]; currentPath: string; timestamp: number }>();
let recursiveAllFilesCache: { data: StorageItem[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export const mediaService = {
  /**
   * Clear all media cache when changes occur (upload, move, delete)
   */
  clearCache(): void {
    listCache.clear();
    recursiveAllFilesCache = null;
    try {
      sessionStorage.removeItem('media_all_files_cache');
    } catch {
      // ignore
    }
  },

  /**
   * List files and folders in a given path (folder) with caching
   */
  async listItems(folder = '', forceRefresh = false): Promise<{ items: StorageItem[]; currentPath: string }> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase chưa được cấu hình.');
    }

    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const cacheKey = cleanFolder;

    // Check memory cache
    if (!forceRefresh) {
      const cached = listCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return { items: cached.items, currentPath: cached.currentPath };
      }
    }

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

    const result = { items, currentPath: cleanFolder };
    listCache.set(cacheKey, { ...result, timestamp: Date.now() });

    return result;
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
    this.clearCache();

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
    this.clearCache();
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
    this.clearCache();
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
    this.clearCache();
  },

  /**
   * Move / Rename a file in bucket (e.g. change category)
   */
  async moveFile(fromPath: string, toPath: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase chưa được cấu hình.');
    }
    const cleanFrom = fromPath.replace(/^\/+|\/+$/g, '');
    const cleanTo = toPath.replace(/^\/+|\/+$/g, '');

    const { error } = await supabase.storage.from(BUCKET_NAME).move(cleanFrom, cleanTo);
    if (error) {
      throw new Error(`Lỗi di chuyển file: ${error.message}`);
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(cleanTo);
    this.clearCache();
    return urlData.publicUrl;
  },

  /**
   * List all files recursively across all folders with in-memory & session caching
   */
  async listAllFilesRecursive(rootFolder = '', maxDepth = 4, forceRefresh = false): Promise<StorageItem[]> {
    if (!isSupabaseConfigured || !supabase) return [];

    const isRoot = !rootFolder || rootFolder === '';

    // Check memory cache for root
    if (isRoot && !forceRefresh) {
      if (recursiveAllFilesCache && Date.now() - recursiveAllFilesCache.timestamp < CACHE_TTL_MS) {
        return recursiveAllFilesCache.data;
      }
      try {
        const stored = sessionStorage.getItem('media_all_files_cache');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.data) && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            recursiveAllFilesCache = parsed;
            return parsed.data;
          }
        }
      } catch {
        // ignore
      }
    }

    const results: StorageItem[] = [];

    async function traverse(currentPath: string, depth: number) {
      if (depth > maxDepth) return;
      const { data, error } = await supabase!.storage.from(BUCKET_NAME).list(currentPath, {
        limit: 500,
        offset: 0,
      });
      if (error || !data) return;

      for (const entry of data) {
        if (entry.name.startsWith('.')) continue; // ignore markers
        const isFolder = !entry.id || !entry.metadata;
        const fullPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

        if (isFolder) {
          await traverse(fullPath, depth + 1);
        } else {
          const { data: urlData } = supabase!.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
          results.push({
            id: entry.id,
            name: entry.name,
            isFolder: false,
            fullPath,
            publicUrl: urlData.publicUrl,
            size: entry.metadata?.size,
            createdAt: entry.created_at,
            updatedAt: entry.updated_at,
          });
        }
      }
    }

    await traverse(rootFolder.replace(/^\/+|\/+$/g, ''), 1);

    if (isRoot) {
      recursiveAllFilesCache = { data: results, timestamp: Date.now() };
      try {
        sessionStorage.setItem('media_all_files_cache', JSON.stringify(recursiveAllFilesCache));
      } catch {
        // ignore
      }
    }

    return results;
  },

  /**
   * Compute exact binary SHA-256 hash from File or Blob or ArrayBuffer
   */
  async computeBinaryHash(data: Blob | ArrayBuffer): Promise<string> {
    const buffer = data instanceof ArrayBuffer ? data : await data.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Compute 64-bit Perceptual Hash (Difference Hash / dHash) of an image
   * This identifies visually identical images even if re-encoded, resized, or saved in different formats (JPG/PNG/WebP).
   */
  async computePerceptualHash(imageSource: string | Blob): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      let objectUrl: string | null = null;
      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else {
        objectUrl = URL.createObjectURL(imageSource);
        img.src = objectUrl;
      }

      img.onload = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        try {
          const canvas = document.createElement('canvas');
          const width = 9;
          const height = 8;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve('');
            return;
          }

          // Draw scaled down
          ctx.drawImage(img, 0, 0, width, height);
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          // Compute grayscale values
          const grayValues: number[] = [];
          for (let i = 0; i < data.length; i += 4) {
            // standard luminance formula: 0.299*R + 0.587*G + 0.114*B
            const gray = Math.round(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
            grayValues.push(gray);
          }

          // Compare adjacent pixels horizontally (9 cols -> 8 differences per row -> 64 bits)
          let binaryStr = '';
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width - 1; x++) {
              const left = grayValues[y * width + x];
              const right = grayValues[y * width + (x + 1)];
              binaryStr += left > right ? '1' : '0';
            }
          }

          // Convert 64-bit binary string into 16-character hex string
          let hex = '';
          for (let i = 0; i < binaryStr.length; i += 4) {
            const nibble = binaryStr.substring(i, i + 4);
            hex += parseInt(nibble, 2).toString(16);
          }
          resolve(hex);
        } catch (e) {
          console.warn('Perceptual hash computation failed (CORS or canvas error):', e);
          resolve('');
        }
      };

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        // Fallback: return empty string
        resolve('');
      };
    });
  },

  /**
   * Calculate Hamming Distance between two 16-hex perceptual hashes (0..64)
   * Distance <= 4 means virtually identical images
   */
  hammingDistance(hexA: string, hexB: string): number {
    if (!hexA || !hexB || hexA.length !== hexB.length) return 999;
    let dist = 0;
    for (let i = 0; i < hexA.length; i++) {
      const valA = parseInt(hexA[i], 16);
      const valB = parseInt(hexB[i], 16);
      let xor = valA ^ valB;
      while (xor > 0) {
        dist += xor & 1;
        xor >>= 1;
      }
    }
    return dist;
  },

  /**
   * Get cached fingerprint or compute from publicUrl
   */
  async getImageFingerprint(
    item: StorageItem,
    onProgress?: (msg: string) => void
  ): Promise<{ sha256?: string; pHash?: string }> {
    if (!item.publicUrl) return {};

    const cacheKey = `img_fp_${item.fullPath}_${item.size || 0}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }

    if (onProgress) onProgress(`Đang phân tích dữ liệu: ${item.name}...`);

    let pHash = '';
    let sha256 = '';

    try {
      // First try perceptual hash directly from URL
      pHash = await this.computePerceptualHash(item.publicUrl);
    } catch {
      // ignore
    }

    try {
      // Fetch blob for exact binary SHA-256 hash
      const resp = await fetch(item.publicUrl);
      if (resp.ok) {
        const blob = await resp.blob();
        sha256 = await this.computeBinaryHash(blob);
        if (!pHash) {
          pHash = await this.computePerceptualHash(blob);
        }
      }
    } catch {
      // ignore fetch errors
    }

    const result = { sha256, pHash };
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // ignore quota limits
    }

    return result;
  },

  /**
   * Group duplicate files by actual image data (SHA-256 binary hash or visual Perceptual Hash)
   */
  async findDuplicatesByData(
    items: StorageItem[],
    onProgress?: (progressText: string) => void
  ): Promise<DuplicateGroup[]> {
    const files = items.filter((i) => !i.isFolder && i.publicUrl);
    if (files.length <= 1) return [];

    const fingerprints = new Map<string, { sha256: string; pHash: string; item: StorageItem }>();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (onProgress) {
        onProgress(`Đang phân tích dữ liệu ảnh ${i + 1}/${files.length} (${file.name})...`);
      }
      const fp = await this.getImageFingerprint(file);
      fingerprints.set(file.fullPath, {
        sha256: fp.sha256 || '',
        pHash: fp.pHash || '',
        item: file,
      });
    }

    // Cluster matching images
    const visited = new Set<string>();
    const duplicateGroups: DuplicateGroup[] = [];

    const list = Array.from(fingerprints.values());
    for (let i = 0; i < list.length; i++) {
      const current = list[i];
      if (visited.has(current.item.fullPath)) continue;

      const group: StorageItem[] = [current.item];
      visited.add(current.item.fullPath);

      for (let j = i + 1; j < list.length; j++) {
        const target = list[j];
        if (visited.has(target.item.fullPath)) continue;

        let isMatch = false;
        // 1. Exact binary data match (SHA-256)
        if (current.sha256 && target.sha256 && current.sha256 === target.sha256) {
          isMatch = true;
        }
        // 2. Visual content match (dHash Hamming distance <= 4 out of 64 bits = >= 94% visual match)
        else if (current.pHash && target.pHash) {
          const dist = this.hammingDistance(current.pHash, target.pHash);
          if (dist <= 4) {
            isMatch = true;
          }
        }
        // 3. Fallback: exact file size in bytes if hashes couldn't be loaded
        else if (
          current.item.size &&
          target.item.size &&
          current.item.size === target.item.size &&
          current.item.size > 0
        ) {
          isMatch = true;
        }

        if (isMatch) {
          group.push(target.item);
          visited.add(target.item.fullPath);
        }
      }

      if (group.length > 1) {
        duplicateGroups.push({
          size: current.item.size || 0,
          items: group,
        });
      }
    }

    return duplicateGroups;
  },

  /**
   * Fast initial grouping by size
   */
  findDuplicates(items: StorageItem[]): DuplicateGroup[] {
    const sizeMap = new Map<number, StorageItem[]>();
    for (const item of items) {
      if (item.isFolder || !item.size || item.size <= 0) continue;
      const group = sizeMap.get(item.size) || [];
      group.push(item);
      sizeMap.set(item.size, group);
    }

    const duplicateGroups: DuplicateGroup[] = [];
    for (const [size, group] of sizeMap.entries()) {
      if (group.length > 1) {
        duplicateGroups.push({ size, items: group });
      }
    }

    return duplicateGroups;
  },
};
