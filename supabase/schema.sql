-- ====================================================================
-- SCHEMA: Nhà Có Mùi Nắng - Linen & Bedding Product Catalog
-- Single Admin Authorization & Row Level Security (RLS)
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create admin_users table (stores the single authorized admin)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin() returns TRUE only if the current caller is in admin_users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only authenticated admins can read admin_users table
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 3. Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY, -- e.g. 'ga-giuong', 'vo-goi', 'chan-he', 'bo-chan-ga', 'combo'
  name TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can read all categories
CREATE POLICY "Public read categories"
  ON public.categories
  FOR SELECT
  TO public
  USING (true);

-- Only admin can modify categories
CREATE POLICY "Admin write categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY, -- Product code, e.g. 'BCG001', 'GA001'
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
  price NUMERIC(12, 0) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'VND',
  type TEXT NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'combo')),
  colors JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of color slugs, e.g. ["be", "nau"]
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of sizes, e.g. ["1m6 x 2m", "1m8 x 2m"]
  description TEXT NOT NULL DEFAULT '',
  combo_items JSONB DEFAULT '[]'::jsonb,    -- list of {name, quantity, note}
  images JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of image URL/paths
  cover_image TEXT,                         -- cover image URL/path
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can read published products only; Admin can read all products
CREATE POLICY "Public read published products"
  ON public.products
  FOR SELECT
  TO public
  USING (published = true OR public.is_admin());

-- Only admin can insert, update, or delete products
CREATE POLICY "Admin write products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Storage Bucket Configuration for 'product-images'
-- Note: Create the bucket 'product-images' as public in Supabase Storage dashboard if not exists.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
-- Allow anyone to read product images
CREATE POLICY "Public read product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Only authorized admin can upload images
CREATE POLICY "Admin upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    public.is_admin()
  );

-- Only authorized admin can update/overwrite images
CREATE POLICY "Admin update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    public.is_admin()
  );

-- Only authorized admin can delete product images
CREATE POLICY "Admin delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    public.is_admin()
  );

-- ====================================================================
-- FIRST ADMIN PROVISIONING INSTRUCTIONS:
-- 1. In Supabase Dashboard -> Authentication -> Users -> Add User (Create user with email + password).
-- 2. In SQL Editor, run:
--    INSERT INTO public.admin_users (user_id, email)
--    SELECT id, email FROM auth.users WHERE email = 'your-admin-email@domain.com'
--    ON CONFLICT (user_id) DO NOTHING;
-- ====================================================================
