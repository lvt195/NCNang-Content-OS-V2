-- ====================================================================
-- SCHEMA: Orders table for Nhà Có Mùi Nắng
-- Tracks customer orders, workshop costs, shipping and payment status
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,                       -- e.g. 'DH-261026-01'
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT DEFAULT '',
  tracking_code TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { productName, imageUrl, color, size, quantity, unitPrice, workshopCost, note }
  total_amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
  workshop_total_cost NUMERIC(12, 0) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(12, 0) NOT NULL DEFAULT 0,
  customer_paid BOOLEAN NOT NULL DEFAULT false,
  workshop_paid BOOLEAN NOT NULL DEFAULT false,
  workshop_paid_date DATE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'workshop_processing', 'workshop_paid', 'shipping', 'completed', 'cancelled')),
  notes TEXT DEFAULT '',
  order_date DATE DEFAULT CURRENT_DATE,
  delivered_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin can view and modify orders
CREATE POLICY "Admin view orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin write orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-update updated_at trigger
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
