# Nhà Có Mùi Nắng — Production Product Catalog & Admin Management

Website danh mục sản phẩm cao cấp, tối giản cho tiệm chăn ga gối đũi & linen tự nhiên, tích hợp khu vực quản trị Admin bảo mật cao.

- **Frontend:** React 19, TypeScript (Strict Mode), Vite, React Router, CSS Tokens (Thiết kế tông màu ấm mộc mạc: be, cát, nâu đất, than).
- **Backend & Database:** Supabase PostgreSQL, Row Level Security (RLS), Supabase Storage cho ảnh sản phẩm.
- **Bảo mật:** Cơ chế **1 Admin Duy Nhất** xác thực bằng RLS và hàm `is_admin()`, không mở đăng ký tự do, không lộ secret key ra client.
- **Triển khai:** Cloudflare Pages (Chi phí duy trì 0đ, cấu hình SPA Fallback `_redirects` cho route chi tiết sản phẩm và F5 trình duyệt).

---

## Cấu trúc thư mục

```text
├── public/
│   ├── _redirects            # SPA redirect rule cho Cloudflare Pages
│   ├── 404.html              # Fallback cho static host
│   └── images/               # Thư mục ảnh sản phẩm đã tối ưu WebP
│       ├── BCG001/
│       ├── GA001/
│       └── ...
├── src/
│   ├── admin/                # Khu vực Quản trị Admin
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminProductsPage.tsx
│   │   ├── AdminProductFormPage.tsx
│   │   ├── AdminCategoriesPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminLayout.tsx
│   │   └── AdminProtectedRoute.tsx
│   ├── components/           # Public components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductFilters.tsx
│   │   └── ProductGallery.tsx
│   ├── config/
│   │   └── site.ts           # Cấu hình liên hệ (Zalo, Messenger, hotline, giá)
│   ├── context/
│   │   └── AuthContext.tsx   # React Auth Context cho Admin session
│   ├── data/
│   │   ├── categories.ts
│   │   ├── colors.ts
│   │   └── initialProducts.ts# Dữ liệu hạt nhân & offline fallback
│   ├── lib/
│   │   └── supabase.ts       # Supabase client an toàn
│   ├── pages/
│   │   ├── CatalogPage.tsx   # Trang danh mục, tìm kiếm, lọc đa tiêu chí
│   │   ├── ProductPage.tsx   # Trang chi tiết sản phẩm, gallery, tư vấn
│   │   └── NotFoundPage.tsx  # 404
│   ├── services/
│   │   ├── authService.ts    # Service xác thực Admin
│   │   └── productService.ts # Data Access Layer cho Products & Storage
│   ├── styles/
│   │   ├── global.css        # Thiết kế vải linen mộc, responsive grid
│   │   └── admin.css         # Giao diện bảng điều khiển Admin
│   ├── types/
│   │   └── product.ts        # TypeScript schemas & types
│   ├── utils/
│   │   ├── filterProducts.ts # Lọc đa tiêu chí AND, tìm kiếm tiếng Việt
│   │   └── formatCurrency.ts # Định dạng tiền tệ VND
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── schema.sql            # SQL tạo bảng, RLS và Storage policies
│   └── seed.sql              # SQL khởi tạo danh mục và sản phẩm mẫu
├── scripts/
│   ├── prepare-images.mjs    # Chuyển đổi và nén ảnh WebP
│   └── validate-catalog.mjs  # Kiểm tra tính toàn vẹn dữ liệu và ảnh
├── package.json
└── tsconfig.json
```

---

## Các lệnh thao tác chính

```bash
# Cài đặt thư viện
npm install

# Kiểm tra dữ liệu và đường dẫn ảnh
npm run validate

# Khởi chạy môi trường phát triển
npm run dev

# Kiểm tra TypeScript và build phiên bản xuất xưởng (dist)
npm run build
```

Xem chi tiết cách tạo tài khoản Admin và cấu hình Supabase tại [SETUP_GUIDE.md](./SETUP_GUIDE.md).
