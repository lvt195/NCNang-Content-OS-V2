import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const sb = createClient(url, key);

const base = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ga-bingbong-350k/';

const variants = [
  { label: 'Mẫu 01 - Hoa nhí tím vintage (M6)', image: base + '05.jpg', colorId: 'tim' },
  { label: 'Mẫu 02 - Hoa cúc nhí xanh trắng', image: base + '36.jpg', colorId: 'xanh-la' },
  { label: 'Mẫu 03 - Vòng tròn Pastel tối giản', image: base + '09.jpg', colorId: 'be' },
  { label: 'Mẫu 04 - Caro Patchwork ô vuông hồng pastel', image: base + '10.jpg', colorId: 'hong' },
  { label: 'Mẫu 05 - Caro Patchwork xanh xám', image: base + '11.jpg', colorId: 'xanh-duong' },
  { label: 'Mẫu 06 - Kẻ sọc nâu cà phê ấm áp (2M2)', image: base + '13.jpg', colorId: 'nau' },
  { label: 'Mẫu 07 - Thổ cẩm kẻ ziczac xanh xám', image: base + '14.jpg', colorId: 'xanh-duong' },
  { label: 'Mẫu 08 - Hoa nhí tím hồng Lavender (M6)', image: base + '15.jpg', colorId: 'tim' },
  { label: 'Mẫu 09 - Hoa cỏ mùa xuân cam hồng pastel (M8)', image: base + '17.jpg', colorId: 'hong' },
  { label: 'Mẫu 10 - Kẻ thổ cẩm sọc ngang pastel', image: base + '19.jpg', colorId: 'be' },
  { label: 'Mẫu 11 - Hình học Zigzag ghi xám KISS-ME', image: base + '20.jpg', colorId: 'xam' },
  { label: 'Mẫu 12 - Hoa nhí hồng dâu ngọt ngào (M6)', image: base + '23.jpg', colorId: 'hong' },
  { label: 'Mẫu 13 - Kẻ ngang xanh ghi biển', image: base + '24.jpg', colorId: 'xanh-duong' },
  { label: 'Mẫu 14 - Tim đen nhỏ nền be kem Minimalist', image: base + '30.jpg', colorId: 'be' },
  { label: 'Mẫu 15 - Ngôi sao mặt trăng xám bạc', image: base + '35.jpg', colorId: 'xam' },
  { label: 'Mẫu 16 - Kẻ viền hoa nhí hồng phấn Studio', image: base + '40.jpg', colorId: 'hong' },
  { label: 'Mẫu 17 - Chấm bi đen trắng tối giản', image: base + '41.jpg', colorId: 'trang' },
  { label: 'Mẫu 18 - Kẻ sọc chấm bi đen thanh lịch', image: base + '43.jpg', colorId: 'trang' },
  { label: 'Mẫu 19 - Kẻ sọc Pastel đa sắc Hàn Quốc', image: base + '45.jpg', colorId: 'be' },
  { label: 'Mẫu 20 - Viền xanh nơ nhí baby', image: base + '48.jpg', colorId: 'xanh-duong' },
  { label: 'Mẫu 21 - Hoa tuyết nâu xám Vintage', image: base + '49.jpg', colorId: 'xam' },
];

// 1. 21 Main representative images
const mainImages = variants.map(v => `${v.image}#color=${v.colorId}`);

// 2. 25 Detailed / alternate angle images
const extraImages = [
  base + '08.jpg#color=tim',
  base + '06.jpg#color=xanh-la',
  base + '07.jpg#color=xanh-la',
  base + '37.jpg#color=xanh-la',
  base + '33.jpg#color=hong',
  base + '34.jpg#color=hong',
  base + '12.jpg#color=xanh-duong',
  base + '27.jpg#color=xanh-duong',
  base + '28.jpg#color=xanh-duong',
  base + '29.jpg#color=xanh-duong',
  base + '18.jpg#color=nau',
  base + '16.jpg#color=tim',
  base + '38.jpg#color=be',
  base + '39.jpg#color=be',
  base + '21.jpg#color=xam',
  base + '22.jpg#color=xam',
  base + '25.jpg#color=xanh-duong',
  base + '26.jpg#color=xanh-duong',
  base + '31.jpg#color=be',
  base + '32.jpg#color=be',
  base + '42.jpg#color=trang',
  base + '44.jpg#color=trang',
  base + '46.jpg#color=be',
  base + '47.jpg#color=xanh-duong',
  base + '50.jpg#color=xam',
];

// 3. 4 Overview / warehouse packaging photos
const generalImages = [
  base + '01.jpg#color=be',
  base + '02.jpg#color=be',
  base + '03.jpg#color=be',
  base + '04.jpg#color=be',
];

const fullImages = [...mainImages, ...extraImages, ...generalImages];

const descText = `Set 3 món ga gối thương hiệu BingBong cao cấp chần bông đa kim sắc sảo từng đường chỉ cả ga lẫn gối, đợt này sale đồng giá 350.000đ. Chất liệu thun mát lạnh mịn màng, ruột chần bông kháng khuẩn dày dặn êm ái, giặt máy thoải mái không lo xô bông hay vón cục.\nTrọn bộ 3 món gồm:\n- 1 Ga chun chần bông bọc đệm êm ái (vừa đệm dày tới 25cm)\n- 2 Vỏ gối nằm chần bông đồng bộ (45x65cm)\n*Lưu ý: Dòng BingBong có bán chăn thun chần bông lẻ 300k cùng họa tiết để ghép thành trọn bộ (xem thêm link Chăn hè BingBong 300k).\n<!--cats:["set-3-mon","chat-lieu-lanh","hoa-tiet-hoa-nhi","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(variants)}-->`;

const colorsList = ['tim', 'xanh-la', 'be', 'hong', 'xanh-duong', 'nau', 'xam', 'trang'];

const { data, error } = await sb.from('products').update({
  description: descText,
  images: fullImages,
  cover_image: base + '05.jpg',
  colors: colorsList,
}).eq('id', 'SET3_BINGBONG_350K').select();

if (error) {
  console.error('Update error:', error);
} else {
  console.log('Update success! Updated', data[0].id);
  console.log('Variants count:', variants.length);
  console.log('Total images:', fullImages.length);
  console.log('Cover image:', data[0].cover_image);
}
