-- Migration: Hỗ trợ một sản phẩm thuộc nhiều danh mục cùng lúc (Đa danh mục)
-- Chạy câu lệnh này trong Supabase Dashboard -> SQL Editor

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_ids JSONB DEFAULT '[]'::jsonb;

-- Khởi tạo category_ids cho các sản phẩm hiện có nếu chưa có
UPDATE public.products 
SET category_ids = jsonb_build_array(category_id)
WHERE category_ids IS NULL OR jsonb_array_length(category_ids) = 0;

-- Tạo index cho JSONB để truy vấn lọc theo danh mục nhanh hơn
CREATE INDEX IF NOT EXISTS idx_products_category_ids ON public.products USING GIN (category_ids);
