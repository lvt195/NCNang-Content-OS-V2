# Hướng Dẫn Cấu Hình Supabase, Admin & Triển Khai Cloudflare Pages

Dự án website catalog **Nhà Có Mùi Nắng** (Linen & Đũi tự nhiên) được thiết kế hiện đại, responsive, không phát sinh chi phí duy trì (0đ chi phí vận hành), tích hợp khu vực Quản trị Admin bảo mật thông qua Supabase.

---

## 1. Cơ Chế Bảo Mật & Xác Thực Admin Duy Nhất (Single Admin Security)

Theo yêu cầu nghiệp vụ, website chỉ có **DUY NHẤT 1 TÀI KHOẢN ADMIN**.

Hệ thống **KHÔNG** mở trang đăng ký công khai (No public registration) và không cấp quyền dựa trên frontend:
- Bảng `public.admin_users` lưu UUID và Email của Admin được chỉ định.
- Hàm PostgreSQL `is_admin()` kiểm tra `auth.uid()` của người dùng đang đăng nhập có tồn tại trong `admin_users` hay không.
- **Row Level Security (RLS)**:
  - Khách vãng lai (`public`): Chỉ được phép `SELECT` các sản phẩm có `published = true` và danh mục công khai.
  - Chỉ khi `is_admin() = true`: Được phép Thêm (`INSERT`), Sửa (`UPDATE`), Xóa (`DELETE`), Ẩn/Hiện (`toggle publish`) sản phẩm và danh mục.
  - Storage Bucket `product-images`: Khách chỉ xem ảnh, chỉ Admin duy nhất mới có quyền upload hoặc xóa ảnh.

---

## 2. Các Bước Cài Đặt Supabase (5 Phút)

### Bước 2.1: Tạo Project Supabase miễn phí
1. Truy cập [supabase.com](https://supabase.com) và đăng nhập (hoặc đăng ký tài khoản miễn phí).
2. Bấm **New project**, đặt tên project (ví dụ: `ncnang-catalog`), đặt mật khẩu cơ sở dữ liệu và chọn vùng (Singapore / Tokyo để tốc độ tải từ VN nhanh nhất).

### Bước 2.2: Chạy SQL Schema và Dữ liệu mẫu (Seed Data)
1. Trong Dashboard Supabase, bấm vào menu **SQL Editor** ở thanh bên trái.
2. Mở file `supabase/schema.sql` trong mã nguồn dự án, sao chép toàn bộ nội dung và dán vào SQL Editor, sau đó bấm **Run**.
3. Tiếp tục mở file `supabase/seed.sql`, dán vào SQL Editor và bấm **Run** để khởi tạo danh mục và 12 sản phẩm ban đầu.

### Bước 2.3: Tạo và Cấp quyền cho Tài khoản Admin Duy Nhất
1. Trong Supabase Dashboard, vào menu **Authentication** -> **Users** -> bấm nút **Add user** -> chọn **Create user**.
2. Điền email và mật khẩu admin của bạn (ví dụ: `admin@nhacomuinang.vn` và mật khẩu an toàn). Bấm **Create user**.
3. Quay lại **SQL Editor**, chạy câu lệnh sau (thay email bằng email bạn vừa tạo):

```sql
INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'admin@nhacomuinang.vn'
ON CONFLICT (user_id) DO NOTHING;
```

> **Cách lấy lại quyền hoặc đổi mật khẩu nếu quên:**
> - Vào Supabase Dashboard -> **Authentication** -> **Users** -> bấm vào tài khoản Admin -> chọn **Send password reset** hoặc bấm **Edit user** để cập nhật mật khẩu mới trực tiếp.

### Bước 2.4: Lấy API Key và URL
1. Trong Supabase Dashboard, vào **Project Settings** (biểu tượng bánh răng) -> **API**.
2. Sao chép 2 giá trị:
   - **Project URL**
   - **anon / public key** (Lưu ý: **KHÔNG** dùng `service_role` key trong frontend).

---

## 3. Cấu Hình Môi Trường Local

1. Tạo file `.env` tại thư mục gốc dự án (dựa trên mẫu `.env.example`):
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Khởi chạy môi trường phát triển:
```bash
npm run dev
```

3. Kiểm tra tính toàn vẹn dữ liệu và đường dẫn ảnh:
```bash
npm run validate
```

---

## 4. Hướng Dẫn Sử Dụng Khu Vực Admin

- Đường dẫn đăng nhập: `/admin/login`
- Đăng nhập bằng Email và Password đã tạo ở Bước 2.3.
- Các chức năng quản trị:
  - **Tổng quan (`/admin`)**: Xem thống kê tổng sản phẩm, số sản phẩm đang hiển thị, bản nháp, sản phẩm nổi bật.
  - **Quản lý sản phẩm (`/admin/products`)**:
    - Tìm kiếm theo mã SP hoặc tên.
    - Lọc theo danh mục và trạng thái hiển thị (Đang hiện / Đang ẩn).
    - Bật/tắt nhanh trạng thái hiển thị (1 click).
    - Nút xóa có hộp thoại xác nhận an toàn.
  - **Thêm / Chỉnh sửa sản phẩm (`/admin/products/new`, `/admin/products/:id/edit`)**:
    - Nhập mã SP, tên, slug, giá niêm yết (VND), danh mục, chất liệu mô tả.
    - Chọn màu sắc tự nhiên và kích thước tiêu chuẩn (hỗ trợ nhập kích thước riêng).
    - Hỗ trợ sản phẩm Combo (chia nhỏ từng món thành phần kèm số lượng).
    - **Tải ảnh lên Supabase Storage**: Kéo thả hoặc chọn nhiều ảnh, chọn ảnh bìa (Cover), đổi thứ tự hiển thị, xóa ảnh.
    - **Xem trước trực tiếp (Live Preview)**: Xem ngay giao diện thẻ sản phẩm và thông số trước khi lưu.
  - **Quản lý danh mục (`/admin/categories`)**: Thêm mới, chỉnh sửa tên, mô tả và thứ tự sắp xếp danh mục.

---

## 5. Hướng Dẫn Triển Khai Lên Cloudflare Pages (Miễn Phí 100%)

### Cách 1: Kết nối trực tiếp qua GitHub Repository (Khuyên dùng)
1. Đẩy mã nguồn lên GitHub:
```bash
git add .
git commit -m "feat: complete product catalog with secure admin management"
git push origin main
```
2. Đăng nhập [dash.cloudflare.com](https://dash.cloudflare.com) -> vào **Workers & Pages** -> chọn **Create application** -> **Pages** -> **Connect to Git**.
3. Chọn repository của bạn.
4. Cấu hình Build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Mở mục **Environment variables**, thêm 2 biến môi trường:
   - `VITE_SUPABASE_URL`: URL project Supabase của bạn
   - `VITE_SUPABASE_ANON_KEY`: Anon public key của bạn
6. Bấm **Save and Deploy**.
   - Cloudflare Pages sẽ tự động build và cấp domain miễn phí dạng `*.pages.dev`.
   - File `public/_redirects` đã được cấu hình sẵn `/* /index.html 200` giúp toàn bộ URL chi tiết (`/products/:slug`) và trang Admin hoạt động mượt mà khi F5 / refresh trang.

---

## 6. Sao Lưu & Xuất Dữ Liệu (Backup)
- Trong Supabase Dashboard, bạn có thể xuất toàn bộ bảng sản phẩm ra file CSV bất cứ lúc nào:
  Vào **Table Editor** -> chọn bảng `products` -> bấm **Export** -> chọn **Export to CSV**.
