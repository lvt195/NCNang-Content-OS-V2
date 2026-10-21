import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== TÁCH VÀ CƠ CẤU LẠI TOÀN BỘ SẢN PHẨM CHUẨN SOLID (KHÔNG LẪN HỌA TIẾT) ===\n');

  // =========================================================================
  // 1. XOÁ 2 SẢN PHẨM 380K CŨ BỊ LẪN LỘN (SET380_HOAKE và SET380_HINHTHU)
  // =========================================================================
  console.log('1. Xóa 2 sản phẩm SET380 cũ bị lẫn lộn...');
  await supabase.from('products').delete().in('id', ['SET380_HOAKE', 'SET380_HINHTHU']);
  console.log('✓ Đã xóa SET380_HOAKE và SET380_HINHTHU thành công.');

  // =========================================================================
  // 2. TẠO 4 SẢN PHẨM 380K SOLID HOÀN TOÀN:
  //    - SET4_380K_HOANHI: Set 4 món chăn ga cotton đũi Hoa nhí & Hoa cỏ Vintage
  //    - SET4_380K_CHAMBI_CARO: Set 4 món chăn ga cotton đũi Chấm bi & Kẻ caro Hàn Quốc
  //    - SET4_380K_DAUTAY_BANHNGOT: Set 4 món chăn ga cotton đũi Dâu tây & Bánh ngọt Sweet Cafe
  //    - SET4_380K_HINHTHU: Set 4 món chăn ga cotton đũi Thỏ ngọc & Thú cưng đáng yêu
  // =========================================================================
  console.log('\n2. Tạo 4 sản phẩm 380k chuẩn Solid...');

  // --- SẢN PHẨM 1: HOA NHÍ & HOA CỎ VINTAGE ---
  const hoaNhiVariants = [
    { label: 'Vàng bơ hoa cúc nhí', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_06.jpg', colorId: 'vang-nhat' },
    { label: 'Tím lavender hoa nhí vintage', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_10.jpg', colorId: 'tim-khoi' },
    { label: 'Hoa nhí tím nhạt nền kem', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_11.jpg', colorId: 'tim-khoi' },
    { label: 'Hoa nhí tím nền tím mộng mơ', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_23.jpg', colorId: 'tim-khoi' },
    { label: 'Tím nhạt hoa nhí dịu dàng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_25.jpg', colorId: 'tim-khoi' },
    { label: 'Hoa cỏ tĩnh hương thuần khiết', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_33.jpg', colorId: 'be' },
    { label: 'Nắng ấm hoa cỏ xanh nhạt', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_34.jpg', colorId: 'xanh-mint' },
    { label: 'Mùa hoa anh đào đỏ kem rạng rỡ', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_41.jpg', colorId: 'hong-dat' },
  ];

  const hoaNhiImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_01.jpg', // Ảnh giới thiệu showroom
    ...hoaNhiVariants.map(v => `${v.image}#color=${v.colorId}`)
  ];

  const hoaNhiDesc = `Trọn bộ 4 món chăn ga gối cotton đũi họa tiết hoa nhí vintage đồng nội và hoa cỏ mùa hạ nhẹ nhàng, thanh lịch giá 380.000đ. Chất liệu đũi cotton tự nhiên mềm mại, thoáng mát, dịu nhẹ với da, giặt máy thoải mái không xù lông.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn lồng được ruột bông (kích thước 2m x 2m2 có khóa kéo)
- 1 Ga trải giường (bo chun hoặc phủ theo yêu cầu cỡ nệm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-hoa-nhi"]-->
<!--vars:${JSON.stringify(hoaNhiVariants)}-->`;

  await supabase.from('products').upsert({
    id: 'SET4_380K_HOANHI',
    slug: 'set-4-mon-chan-ga-cotton-dui-hoa-nhi-vintage-380k',
    name: 'Set 4 món chăn ga gối cotton đũi Hoa nhí & Hoa cỏ Vintage',
    category_id: 'set-4-mon',
    price: 380000,
    currency: 'VND',
    type: 'combo',
    colors: ['vang-nhat', 'tim-khoi', 'be', 'xanh-mint', 'hong-dat'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun hoặc ga phủ theo yêu cầu', quantity: 1, note: 'May đúng kích thước đệm' },
      { name: 'Vỏ chăn hè thu đông', quantity: 1, note: '2m x 2m2, có khóa kéo' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: '45x65cm' }
    ],
    cover_image: hoaNhiImages[0],
    images: hoaNhiImages,
    description: hoaNhiDesc,
    featured: true,
    published: true,
  });
  console.log('✓ Đã tạo SET4_380K_HOANHI (8 mẫu hoa nhí, 1 ảnh giới thiệu)');

  // --- SẢN PHẨM 2: CHẤM BI & KẺ CARO HÀN QUỐC ---
  const chamBiVariants = [
    { label: 'Chấm bi hoa quả vàng kem', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_07.jpg', colorId: 'vang-nhat' },
    { label: 'Xanh mint chấm bi nhẹ nhàng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_08.jpg', colorId: 'xanh-mint' },
    { label: 'Chấm bi đen trắng cá tính', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_09.jpg', colorId: 'xam' },
    { label: 'Chấm bi kem sữa tinh nghịch', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_32.jpg', colorId: 'be' },
    { label: 'Kẻ caro Tây Tây Lý xanh pastel', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_35.jpg', colorId: 'xanh-duong' },
    { label: 'Chấm bi sóng biển xanh mát', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_37.jpg', colorId: 'xanh-mint' },
    { label: 'Chấm bi đen tuyền phong cách', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_39.jpg', colorId: 'xam' },
  ];

  const chamBiImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_02.jpg', // Ảnh giới thiệu showroom
    ...chamBiVariants.map(v => `${v.image}#color=${v.colorId}`)
  ];

  const chamBiDesc = `Trọn bộ 4 món chăn ga gối cotton đũi họa tiết chấm bi Polka Dot và kẻ caro hiện đại, trẻ trung chuẩn phong cách Hàn Quốc giá 380.000đ. Chất liệu đũi tự nhiên đanh sợi, êm mát, không xù lông khi giặt máy.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn lồng được ruột bông (kích thước 2m x 2m2 có khóa kéo)
- 1 Ga trải giường (bo chun hoặc phủ theo yêu cầu cỡ nệm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-ke"]-->
<!--vars:${JSON.stringify(chamBiVariants)}-->`;

  await supabase.from('products').upsert({
    id: 'SET4_380K_CHAMBI_CARO',
    slug: 'set-4-mon-chan-ga-cotton-dui-cham-bi-ke-caro-380k',
    name: 'Set 4 món chăn ga gối cotton đũi Chấm bi & Kẻ caro Hàn Quốc',
    category_id: 'set-4-mon',
    price: 380000,
    currency: 'VND',
    type: 'combo',
    colors: ['vang-nhat', 'xanh-mint', 'xam', 'be', 'xanh-duong'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun hoặc ga phủ theo yêu cầu', quantity: 1, note: 'May đúng kích thước đệm' },
      { name: 'Vỏ chăn hè thu đông', quantity: 1, note: '2m x 2m2, có khóa kéo' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: '45x65cm' }
    ],
    cover_image: chamBiImages[0],
    images: chamBiImages,
    description: chamBiDesc,
    featured: true,
    published: true,
  });
  console.log('✓ Đã tạo SET4_380K_CHAMBI_CARO (7 mẫu chấm bi & caro, 1 ảnh giới thiệu)');

  // --- SẢN PHẨM 3: DÂU TÂY & BÁNH NGỌT SWEET CAFE ---
  const dauTayVariants = [
    { label: 'Bánh ngọt kem xanh mint', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_14.jpg', colorId: 'xanh-mint' },
    { label: 'Dâu tây hồng kem ngọt ngào', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_15.jpg', colorId: 'hong-dat' },
    { label: 'Xanh mint dâu tây tươi mát', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_18.jpg', colorId: 'xanh-mint' },
    { label: 'Bánh ngọt donut hồng pastel', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_19.jpg', colorId: 'hong-dat' },
    { label: 'Trái tim đỏ nền kem lãng mạn', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_21.jpg', colorId: 'hong-dat' },
    { label: 'Bánh ngọt donut xanh ngộ nghĩnh', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_24.jpg', colorId: 'xanh-duong' },
    { label: 'Bánh ngọt donut hồng kem', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_25.jpg', colorId: 'hong-dat' },
  ];

  const dauTayImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_03.jpg', // Ảnh giới thiệu showroom Cafe Paris
    ...dauTayVariants.map(v => `${v.image}#color=${v.colorId}`)
  ];

  const dauTayDesc = `Trọn bộ 4 món chăn ga gối cotton đũi họa tiết dâu tây tươi mát, bánh ngọt donut và trái tim kẹo ngọt xinh xắn phong cách quán cafe Paris giá 380.000đ. Chất liệu đũi cotton mềm mại, thoáng mát, dịu nhẹ cho mọi làn da.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn lồng được ruột bông (kích thước 2m x 2m2 có khóa kéo)
- 1 Ga trải giường (bo chun hoặc phủ theo yêu cầu cỡ nệm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(dauTayVariants)}-->`;

  await supabase.from('products').upsert({
    id: 'SET4_380K_DAUTAY_BANHNGOT',
    slug: 'set-4-mon-chan-ga-cotton-dui-dau-tay-banh-ngot-380k',
    name: 'Set 4 món chăn ga gối cotton đũi Dâu tây & Bánh ngọt Sweet Cafe',
    category_id: 'set-4-mon',
    price: 380000,
    currency: 'VND',
    type: 'combo',
    colors: ['xanh-mint', 'hong-dat', 'xanh-duong'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun hoặc ga phủ theo yêu cầu', quantity: 1, note: 'May đúng kích thước đệm' },
      { name: 'Vỏ chăn hè thu đông', quantity: 1, note: '2m x 2m2, có khóa kéo' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: '45x65cm' }
    ],
    cover_image: dauTayImages[0],
    images: dauTayImages,
    description: dauTayDesc,
    featured: true,
    published: true,
  });
  console.log('✓ Đã tạo SET4_380K_DAUTAY_BANHNGOT (7 mẫu dâu tây & bánh ngọt, 1 ảnh giới thiệu)');

  // --- SẢN PHẨM 4: HÌNH THÚ & THÚ CƯNG ĐÁNG YÊU ---
  const hinhThuVariants = [
    { label: 'Thỏ kem nâu vintage', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_12.jpg', colorId: 'be' },
    { label: 'Thỏ dâu tây hồng kem', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_13.jpg', colorId: 'hong-dat' },
    { label: 'Mây xanh gấu nhỏ Hàn Quốc', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_16.jpg', colorId: 'xanh-duong' },
    { label: 'Kẻ sọc be gấu nâu ấm áp', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_17.jpg', colorId: 'nau' },
    { label: 'Cún con xanh da trời đáng yêu', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_20.jpg', colorId: 'xanh-duong' },
    { label: 'Mây xanh gấu con ngủ ngoan', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_22.jpg', colorId: 'xanh-duong' },
    { label: 'Thỏ hồng hoa cúc tươi tắn', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_27.jpg', colorId: 'hong-dat' },
    { label: 'Thỏ kem mộng mơ êm dịu', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_28.jpg', colorId: 'be' },
    { label: 'Thỏ vàng bơ nhạt ấm cúng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_29.jpg', colorId: 'vang-nhat' },
    { label: 'Mèo kem ước nguyện ngộ nghĩnh', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_30.jpg', colorId: 'be' },
    { label: 'Voi con mây trời xanh thanh bình', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_31.jpg', colorId: 'xanh-duong' },
    { label: 'Vịt vàng xanh trời tự do', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_32.jpg', colorId: 'vang-nhat' },
    { label: 'Thỏ tiểu thư kem nâu cổ điển', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_36.jpg', colorId: 'be' },
    { label: 'Nhật ký Kitty kem nâu thơ mộng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_38.jpg', colorId: 'be' },
    { label: 'Cún con vui vẻ kem nâu thân thiện', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_40.jpg', colorId: 'nau' },
    { label: 'Bé gái Dora kem sắc màu', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_42.jpg', colorId: 'be' },
  ];

  const hinhThuImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-chan-380k/set4_chan_04.jpg', // Ảnh giới thiệu showroom
    ...hinhThuVariants.map(v => `${v.image}#color=${v.colorId}`)
  ];

  const hinhThuDesc = `Trọn bộ 4 món chăn ga gối cotton đũi họa tiết thỏ ngọc, gấu nhỏ, mèo con và thú cưng hoạt hình siêu đáng yêu cho bé và bạn gái giá 380.000đ. Chất liệu đũi cotton tự nhiên mềm mại, thoáng mát, dịu nhẹ cho mọi làn da.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn lồng được ruột bông (kích thước 2m x 2m2 có khóa kéo)
- 1 Ga trải giường (bo chun hoặc phủ theo yêu cầu cỡ nệm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(hinhThuVariants)}-->`;

  await supabase.from('products').upsert({
    id: 'SET4_380K_HINHTHU',
    slug: 'set-4-mon-chan-ga-cotton-dui-tho-ngoc-thu-cung-380k',
    name: 'Set 4 món chăn ga gối cotton đũi Thỏ ngọc & Thú cưng đáng yêu',
    category_id: 'set-4-mon',
    price: 380000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'hong-dat', 'xanh-duong', 'nau', 'vang-nhat'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun hoặc ga phủ theo yêu cầu', quantity: 1, note: 'May đúng kích thước đệm' },
      { name: 'Vỏ chăn hè thu đông', quantity: 1, note: '2m x 2m2, có khóa kéo' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: '45x65cm' }
    ],
    cover_image: hinhThuImages[0],
    images: hinhThuImages,
    description: hinhThuDesc,
    featured: true,
    published: true,
  });
  console.log('✓ Đã tạo SET4_380K_HINHTHU (16 mẫu hình thú, 1 ảnh giới thiệu)');

  // =========================================================================
  // 3. CHUẨN HÓA SET 4 MÓN 370K (SET370_HANQUOC_1 & SET370_HANQUOC_2)
  //    Thêm ảnh giới thiệu tổng quan ở index 0, chuẩn hóa màu sắc và tên mẫu
  // =========================================================================
  console.log('\n3. Chuẩn hóa Set 4 món 370k Cotton vibe Hàn Quốc...');

  const vars370_1 = [
    { label: 'Hoa nhí cúc vàng kem', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_02.jpg', colorId: 'vang-nhat' },
    { label: 'Hoa cỏ đồng nội nâu be', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_03.jpg', colorId: 'be' },
    { label: 'Hoa nhí xanh biển Pastel', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_04.jpg', colorId: 'xanh-duong' },
    { label: 'Hoa nhí be ấm vintage', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_05.jpg', colorId: 'be' },
    { label: 'Cúc họa mi xám trắng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_06.jpg', colorId: 'xam' },
    { label: 'Hoa nhí nâu đất thanh lịch', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_07.jpg', colorId: 'nau' },
    { label: 'Hoa nhí ghi xám hiện đại', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_08.jpg', colorId: 'xam' },
    { label: 'Hoa cúc nhí nâu cafe', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_09.jpg', colorId: 'nau' },
    { label: 'Hoa nhí hồng đào dịu mắt', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_10.jpg', colorId: 'hong-dat' },
    { label: 'Hoa cúc trắng nền be sữa', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_11.jpg', colorId: 'be' },
    { label: 'Hoa cỏ vàng mù tạt cổ điển', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_12.jpg', colorId: 'vang-nhat' },
    { label: 'Hoa nhí be kem nhẹ nhàng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_13.jpg', colorId: 'be' },
  ];

  const images370_1 = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_01.jpg', // Bìa phòng ngủ giới thiệu
    ...vars370_1.map(v => `${v.image}#color=${v.colorId}`)
  ];

  await supabase.from('products').update({
    cover_image: images370_1[0],
    images: images370_1,
    colors: ['vang-nhat', 'be', 'xanh-duong', 'xam', 'nau', 'hong-dat'],
    description: `Set 4 món chăn ga cotton phong cách Hàn Quốc tone hoa nhí vintage nhẹ nhàng, trẻ trung và ngọt ngào giá 370.000đ. Chất liệu vải cotton mềm mại, thoáng mát mùa hè và êm ấm mùa thu đông.
Trọn bộ 4 món gồm:
- 1 Ga chun hoặc ga phủ bọc đệm (vừa đệm dày tới 20cm)
- 1 Vỏ chăn kéo khóa lồng ruột (2m x 2m2)
- 2 Vỏ gối nằm đồng bộ (45x65cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-hoa-nhi"]-->
<!--vars:${JSON.stringify(vars370_1)}-->`,
  }).eq('id', 'SET370_HANQUOC_1');
  console.log('✓ Cập nhật SET370_HANQUOC_1: 1 ảnh giới thiệu + 12 mẫu hoa nhí chuẩn màu.');

  const vars370_2 = [
    { label: 'Kẻ sọc be hiện đại', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_15.jpg', colorId: 'be' },
    { label: 'Caro xám ghi tối giản', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_16.jpg', colorId: 'xam' },
    { label: 'Kẻ caro nâu cafe ấm cúng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_17.jpg', colorId: 'nau' },
    { label: 'Caro trắng đen trẻ trung', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_18.jpg', colorId: 'xam' },
    { label: 'Gấu nhỏ nâu nền be', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_19.jpg', colorId: 'be' },
    { label: 'Kẻ sọc ghi sáng phong cách', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_20.jpg', colorId: 'xam' },
    { label: 'Caro xám đen cá tính', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_21.jpg', colorId: 'xam' },
    { label: 'Thỏ nâu dễ thương', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_22.jpg', colorId: 'nau' },
    { label: 'Hồng phấn hình thú ngộ nghĩnh', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_23.jpg', colorId: 'hong-dat' },
    { label: 'Kẻ caro be ấm thanh lịch', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_24.jpg', colorId: 'be' },
    { label: 'Snoopy hoạt hình xanh nhạt', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_25.jpg', colorId: 'xanh-duong' },
    { label: 'Kẻ sọc trắng xám nhã nhặn', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_26.jpg', colorId: 'xam' },
  ];

  const images370_2 = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-cotton-370k/c370_14.jpg', // Bìa giới thiệu phòng ngủ
    ...vars370_2.map(v => `${v.image}#color=${v.colorId}`)
  ];

  await supabase.from('products').update({
    cover_image: images370_2[0],
    images: images370_2,
    colors: ['be', 'xam', 'nau', 'hong-dat', 'xanh-duong'],
    description: `Set 4 món chăn ga cotton vibe Hàn Quốc họa tiết kẻ caro phối tone hiện đại và các nhân vật dễ thương giá 370.000đ. Chất vải cotton bền màu, thấm hút tốt, giặt máy thoải mái không xù lông.
Trọn bộ 4 món gồm:
- 1 Ga chun hoặc ga phủ bọc đệm (vừa đệm dày tới 20cm)
- 1 Vỏ chăn kéo khóa lồng ruột (2m x 2m2)
- 2 Vỏ gối nằm đồng bộ (45x65cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-ke","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(vars370_2)}-->`,
  }).eq('id', 'SET370_HANQUOC_2');
  console.log('✓ Cập nhật SET370_HANQUOC_2: 1 ảnh giới thiệu + 12 mẫu caro & hình thú.');

  // =========================================================================
  // 4. CHUẨN HÓA SET XINKK 220K (SET_XINKK_220K)
  //    Thêm ảnh giới thiệu tổng quan ở index 0, đa dạng hóa màu sắc (không hardcode be)
  // =========================================================================
  console.log('\n4. Chuẩn hóa Set Xinkk 220k...');
  const xinkkColorsMap = [
    'be', 'xam', 'hong-dat', 'be', 'nau', 'hong-dat', 'vang-nhat', 'be',
    'nau', 'hong-dat', 'be', 'be', 'xam', 'xam', 'xam', 'nau', 'nau', 'be', 'nau', 'be'
  ];

  const varsXinkk = [];
  for (let i = 1; i < 20; i++) {
    const num = i + 1;
    const cId = xinkkColorsMap[i] || 'be';
    varsXinkk.push({
      label: `Mẫu ${String(i).padStart(2, '0')} - Pastel Hàn Quốc`,
      image: `https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_${String(num).padStart(2, '0')}.jpg`,
      colorId: cId
    });
  }

  const imagesXinkk = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_01.jpg', // Bìa giới thiệu bộ đũi Xinkk
    ...varsXinkk.map(v => `${v.image}#color=${v.colorId}`)
  ];

  await supabase.from('products').update({
    cover_image: imagesXinkk[0],
    images: imagesXinkk,
    colors: ['be', 'xam', 'hong-dat', 'nau', 'vang-nhat'],
    description: `Set 3 món chăn ga gối đũi cotton mẫu xinh xắn hạt dẻ phong cách pastel Hàn Quốc giá 220.000đ. Nhiều họa tiết hoạt hình, gấu nhỏ và hoa cúc nhẹ nhàng, giá cực kỳ học sinh sinh viên.
Trọn bộ gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-3-mon","chat-lieu-dui","hoa-tiet-de-thuong","hoa-tiet-hoa-nhi"]-->
<!--vars:${JSON.stringify(varsXinkk)}-->`,
  }).eq('id', 'SET_XINKK_220K');
  console.log('✓ Cập nhật SET_XINKK_220K: 1 ảnh giới thiệu + 19 mẫu đũi pastel.');

  // =========================================================================
  // 5. CHUẨN HÓA CÁC BỘ SET 165K (Thêm ảnh lookbook cuộn vải đũi ở index 0)
  // =========================================================================
  console.log('\n5. Thêm ảnh bìa giới thiệu bộ sưu tập cho các set 165k...');
  const overview165 = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/109_chong_cuon_vai_dui_pastel.jpg';

  const prods165 = ['SET165_CARO', 'SET165_SOC', 'SET165_HOANHI', 'SET165_HOACO', 'SET165_GAU', 'SET165_THU', 'SET165_TRAITIM', 'SET165_HOATHINH'];
  for (const pid of prods165) {
    const { data: p } = await supabase.from('products').select('images, description, cover_image').eq('id', pid).single();
    if (!p) continue;
    // Kiểm tra nếu chưa có ảnh overview ở đầu
    if (p.images && p.images[0] !== overview165) {
      const newImages = [overview165, ...p.images];
      await supabase.from('products').update({
        cover_image: overview165,
        images: newImages,
      }).eq('id', pid);
      console.log(`  ✓ Đã thêm ảnh giới thiệu chung cho ${pid}`);
    }
  }

  console.log('\n=== HOÀN TẤT CƠ CẤU TOÀN BỘ SẢN PHẨM SOLID CHUẨN SHOPEE ===');
}

run().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
