# Quy Tắc Quản Lý Catalog & Xử Lý Ảnh (NCNang Catalog & Media Rules)

Khi thêm mới hoặc cập nhật sản phẩm từ thư mục ảnh:
1. **Mỗi mẫu/biến thể chỉ 1 ảnh đại diện:** Khi đọc thư mục ảnh, mỗi phân loại mẫu (type / họa tiết / màu sắc) chỉ được gán đúng 1 ảnh đại diện làm biến thể (`variants`).
2. **Giới hạn số lượng ảnh chung:** Ảnh chung (ảnh tổng quan phòng, kệ trưng bày, bao bì, ảnh chi tiết các góc phụ) tối đa không quá **2 lần số lượng mẫu** (`Số ảnh chung <= 2 * Số lượng mẫu`). Loại bỏ các ảnh chụp góc trùng lặp quá nhiều.
3. **Thứ tự sắp xếp ảnh trong danh sách ảnh sản phẩm (`images` array):**
   - **ĐẨY ẢNH CHUNG LÊN CÁC VỊ TRÍ ĐẦU TIÊN:** Đặt các ảnh chung / ảnh tổng quan / kệ trưng bày / ảnh trải giường bối cảnh đẹp lên đầu danh sách `images` để khách hàng mở trang xem được ngay bối cảnh tổng thể và chất lượng sản phẩm.
   - Tiếp theo mới đến các ảnh đại diện của từng mẫu.
