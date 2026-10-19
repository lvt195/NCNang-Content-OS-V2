import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Category, ProductCategory } from '../types/product';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { DEFAULT_CATEGORIES } from '../data/categories';

// Map database row to TypeScript Product
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToProduct(row: any): Product {
  const images = Array.isArray(row.images) ? row.images : [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_id as ProductCategory,
    price: Number(row.price),
    currency: row.currency || 'VND',
    type: row.type || 'single',
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    description: row.description || '',
    comboItems: Array.isArray(row.combo_items) ? row.combo_items : [],
    images: images,
    coverImage: row.cover_image || images[0] || '',
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    available: true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map Product to database insert/update payload
function mapProductToRow(product: Partial<Product>) {
  return {
    id: product.id?.trim().toUpperCase(),
    slug: product.slug?.trim(),
    name: product.name?.trim(),
    category_id: product.category,
    price: Number(product.price),
    currency: product.currency || 'VND',
    type: product.type || 'single',
    colors: product.colors || [],
    sizes: product.sizes || [],
    description: product.description || '',
    combo_items: product.comboItems || [],
    images: product.images || [],
    cover_image: product.coverImage || product.images?.[0] || null,
    featured: Boolean(product.featured),
    published: product.published !== undefined ? Boolean(product.published) : true,
  };
}

export const productService = {
  /**
   * Public: Fetch published products
   */
  async getPublishedProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      return INITIAL_PRODUCTS.filter((p) => p.published !== false);
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query error:', error.message);
        return [];
      }

      return (data || []).map(mapRowToProduct);
    } catch (err) {
      console.warn('Network error fetching products:', err);
      return [];
    }
  },

  /**
   * Public: Fetch a single product by slug or id
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured || !supabase) {
      const found = INITIAL_PRODUCTS.find(
        (p) => p.slug === slug || p.id.toLowerCase() === slug.toLowerCase()
      );
      return found || null;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug.toUpperCase()}`)
        .single();

      if (error || !data) {
        return null;
      }

      return mapRowToProduct(data);
    } catch {
      return null;
    }
  },

  /**
   * Admin: Fetch all products (published + drafts)
   */
  async getAllProductsAdmin(): Promise<Product[]> {
    if (!isSupabaseConfigured || !supabase) {
      return INITIAL_PRODUCTS;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map(mapRowToProduct);
  },

  /**
   * Admin: Get single product by ID (including draft)
   */
  async getProductByIdAdmin(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured || !supabase) {
      const found = INITIAL_PRODUCTS.find((p) => p.id === id);
      return found || null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return mapRowToProduct(data);
  },

  /**
   * Admin: Create a product
   */
  async createProduct(product: Partial<Product>): Promise<Product> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.'
      );
    }

    const payload = mapProductToRow(product);

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ [productService.createProduct] Supabase error:', error, { payload });
      if (error.code === '23505') {
        throw new Error(`Mã sản phẩm hoặc slug "${product.id}" đã tồn tại. Vui lòng chọn mã hoặc tên khác.`);
      }
      if (error.code === '23503') {
        throw new Error(`Danh mục sản phẩm "${product.category}" không tồn tại trong hệ thống. Vui lòng chọn lại danh mục.`);
      }
      if (error.code === '42501') {
        throw new Error('Lỗi quyền hạn (RLS 42501): Phiên đăng nhập Admin hết hạn hoặc tài khoản chưa có quyền quản trị. Vui lòng đăng xuất và đăng nhập lại.');
      }
      throw new Error(`Lỗi CSDL (${error.code || 'ERR'}): ${error.message}`);
    }

    return mapRowToProduct(data);
  },

  /**
   * Admin: Update an existing product
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.'
      );
    }

    const payload = mapProductToRow({ ...updates, id });

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [productService.updateProduct] Supabase error:', error, { payload });
      if (error.code === '23505') {
        throw new Error(`Mã sản phẩm hoặc slug "${id}" bị trùng lặp.`);
      }
      if (error.code === '23503') {
        throw new Error(`Danh mục sản phẩm "${updates.category}" không tồn tại trong hệ thống.`);
      }
      if (error.code === '42501') {
        throw new Error('Lỗi quyền hạn (RLS 42501): Phiên đăng nhập Admin hết hạn. Vui lòng đăng nhập lại.');
      }
      throw new Error(`Lỗi cập nhật (${error.code || 'ERR'}): ${error.message}`);
    }

    return mapRowToProduct(data);
  },

  /**
   * Admin: Toggle published status
   */
  async togglePublish(id: string, published: boolean): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase chưa được kết nối.');
    }

    const { error } = await supabase
      .from('products')
      .update({ published })
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  /**
   * Admin: Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase chưa được kết nối.');
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /**
   * Categories: Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured || !supabase) {
      return DEFAULT_CATEGORIES;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Supabase query error fetching categories:', error.message);
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        displayOrder: row.display_order,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Admin: Create category
   */
  async createCategory(category: Category): Promise<Category> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase chưa cấu hình');
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: category.id.trim().toLowerCase(),
        name: category.name.trim(),
        description: category.description || '',
        display_order: category.displayOrder || 0,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      displayOrder: data.display_order,
    };
  },

  /**
   * Admin: Update category
   */
  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase chưa cấu hình');
    const { data, error } = await supabase
      .from('categories')
      .update({
        name: category.name?.trim(),
        description: category.description,
        display_order: category.displayOrder,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      displayOrder: data.display_order,
    };
  },

  /**
   * Admin: Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase chưa cấu hình');
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /**
   * Admin: Upload image to Supabase Storage bucket 'product-images'
   */
  async uploadProductImage(file: File, productCode: string): Promise<string> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase Storage chưa được cấu hình trong .env');
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File ${file.name} vượt quá dung lượng tối đa 5MB.`);
    }

    // Validate type (support standard images, jpeg/jpg/png/webp/avif/gif/heic)
    const isImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|avif|gif|heic)$/i.test(file.name);
    if (!isImage) {
      throw new Error(`Định dạng file không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WebP hoặc AVIF.`);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const timestamp = Date.now();
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const targetFolder = (productCode || 'SP').trim().toUpperCase();
    const filePath = `${targetFolder}/${timestamp}_${cleanName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ [productService.uploadProductImage] Storage error:', uploadError);
      throw new Error(`Lỗi tải ảnh lên Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  /**
   * Admin: Safe deletion of an image from storage
   */
  async deleteProductImage(pathOrUrl: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // Extract storage path from public URL if needed
      let storagePath = pathOrUrl;
      if (pathOrUrl.includes('/product-images/')) {
        storagePath = pathOrUrl.split('/product-images/')[1];
      }

      if (storagePath && !storagePath.startsWith('/images/')) {
        await supabase.storage.from('product-images').remove([storagePath]);
      }
    } catch (err) {
      console.warn('Could not delete image from storage:', err);
    }
  },
};
