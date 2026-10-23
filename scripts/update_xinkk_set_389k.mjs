/**
 * scripts/update_xinkk_set_389k.mjs
 * 
 * Update SET_XINKK_220K to:
 * - name: Set 4 món chăn ga gối cotton đũi viền bèo xốp Hàn Quốc
 * - slug: set-4-mon-chan-ga-cotton-dui-vien-beo-xop-han-quoc-389k
 * - price: 389000
 * - category_id: set-4-mon
 * - published: true
 * - combo_items: ga chun (20cm) + vỏ chăn viền bèo (2mx2m2) + 2 vỏ gối viền bèo (45x65cm)
 * - description: complete intro + combo details + synchronized vars for all 15 filtered bed photos
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🔄 Đang cập nhật sản phẩm Set 4 món viền bèo 389k...\n');

  const { data: current, error: getErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', 'SET_XINKK_220K')
    .single();

  if (getErr) throw getErr;

  const images = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_01.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_03.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_04.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_05.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_06.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_07.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_08.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_09.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_10.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_11.jpg#color=xanh-mint',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_12.jpg#color=tim-khoi',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_17.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_18.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_19.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_20.jpg#color=vang-nhat'
  ];

  const variants = [
    { label: 'Hoa tulip hồng phấn viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_01.jpg', colorId: 'hong-dat' },
    { label: 'Kẻ đỏ hoa sao vintage', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_03.jpg', colorId: 'hong-dat' },
    { label: 'Xanh khói phối hồng hoa nhí', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_04.jpg', colorId: 'xanh-duong' },
    { label: 'Trái tim nâu be viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_05.jpg', colorId: 'nau' },
    { label: 'Hoa nhí tím hồng ngọt ngào', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_06.jpg', colorId: 'hong-dat' },
    { label: 'Vàng bơ quả ngọt viền bèo xanh', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_07.jpg', colorId: 'vang-nhat' },
    { label: 'Gấu nâu be mộc viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_08.jpg', colorId: 'be' },
    { label: 'Họa tiết tim be xám tối giản', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_09.jpg', colorId: 'xam' },
    { label: 'Dâu tây đỏ rượu viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_10.jpg', colorId: 'hong-dat' },
    { label: 'Xanh bơ hoa cỏ viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_11.jpg', colorId: 'xanh-mint' },
    { label: 'Sọc kẻ tím pastel phối trắng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_12.jpg', colorId: 'tim-khoi' },
    { label: 'Kem sữa viền đỏ zigzag ấm áp', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_17.jpg', colorId: 'be' },
    { label: 'Sọc xanh pastel viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_18.jpg', colorId: 'xanh-duong' },
    { label: 'Sọc hoa hồng vintage viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_19.jpg', colorId: 'hong-dat' },
    { label: 'Vàng kem gấu nâu viền bèo', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_20.jpg', colorId: 'vang-nhat' }
  ];

  const description = `Trọn bộ 4 món chăn ga gối cotton đũi viền bèo xốp ren phong cách Hàn Quốc giá 389.000đ. Chất liệu đũi cotton tự nhiên siêu mềm mịn, thấm hút mồ hôi cực tốt, tạo cảm giác êm ái thoáng mát khi ngủ. Điểm nhấn là đường viền bèo ren gợn sóng tinh tế cùng các họa tiết hoa nhí vintage, gấu cưng và trái tim kẹo ngọt.
Trọn bộ 4 món gồm:
- 1 Ga chun bọc đệm theo kích thước (vừa đệm dày tới 20cm hoặc may theo yêu cầu)
- 1 Vỏ chăn kéo khóa lồng ruột có viền bèo sóng (kích thước 2m x 2m2)
- 2 Vỏ gối nằm viền bèo đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong","hoa-tiet-hoa-nhi"]-->
<!--vars:${JSON.stringify(variants)}-->`;

  const combo_items = [
    {
      name: 'Ga chun bọc đệm theo kích thước',
      note: 'Vừa đệm dày tới 20cm',
      quantity: 1
    },
    {
      name: 'Vỏ chăn kéo khóa có viền bèo xốp',
      note: 'Kích thước tiêu chuẩn 2m x 2m2',
      quantity: 1
    },
    {
      name: 'Vỏ gối nằm viền bèo đồng bộ',
      note: 'Kích thước tiêu chuẩn 45x65cm',
      quantity: 2
    }
  ];

  const updatePayload = {
    name: 'Set 4 món chăn ga gối cotton đũi viền bèo xốp Hàn Quốc',
    slug: 'set-4-mon-chan-ga-cotton-dui-vien-beo-xop-han-quoc-389k',
    price: 389000,
    category_id: 'set-4-mon',
    published: true,
    cover_image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-xinkk-220k/xinkk_01.jpg',
    images: images,
    colors: ['be', 'hong-dat', 'nau', 'vang-nhat', 'xanh-duong', 'xanh-mint', 'tim-khoi', 'xam'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: combo_items,
    description: description
  };

  const { error: updateErr } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', 'SET_XINKK_220K');

  if (updateErr) throw updateErr;

  console.log('✅ Đã cập nhật thành công SET_XINKK_220K:');
  console.log('- Tên:', updatePayload.name);
  console.log('- Slug:', updatePayload.slug);
  console.log('- Giá bán:', updatePayload.price, 'VND');
  console.log('- Danh mục:', updatePayload.category_id);
  console.log('- Số lượng ảnh giường:', images.length);
  console.log('- Trạng thái:', updatePayload.published ? 'Hiển thị (published: true)' : 'Ẩn');
}

main().catch(console.error);
