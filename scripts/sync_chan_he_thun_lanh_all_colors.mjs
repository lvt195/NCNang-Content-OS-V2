import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

async function main() {
  const storageFolder = 'chan-he-thun-lanh-300k';
  const baseStorage = `https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/${storageFolder}/`;

  // 11 Distinct Variants (Gộp Hồng cherry & Hồng phấn thành 1 mẫu)
  const variants = [
    { label: 'Mẫu 01 - Xám nhạt (Ghi sáng)', image: baseStorage + 'thunlanh_chan_01.jpg', colorId: 'xam' },
    { label: 'Mẫu 02 - Xám đậm (Ghi đậm)', image: baseStorage + 'thunlanh_chan_07.jpg', colorId: 'xam-dam' },
    { label: 'Mẫu 03 - Xanh bơ / cốm', image: baseStorage + 'thunlanh_chan_05.jpg', colorId: 'xanh-bo' },
    { label: 'Mẫu 04 - Xanh dương (Blue)', image: baseStorage + 'thunlanh_chan_06.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 05 - Xanh ghi pastel', image: baseStorage + 'thunlanh_chan_17.jpg', colorId: 'xanh-ghi' },
    { label: 'Mẫu 06 - Xanh lá đậm', image: baseStorage + 'thunlanh_chan_16.jpg', colorId: 'xanh-la-dam' },
    { label: 'Mẫu 07 - Hồng cam đào', image: baseStorage + 'thunlanh_chan_02.jpg', colorId: 'hong-cam' },
    { label: 'Mẫu 08 - Hồng cherry', image: baseStorage + 'thunlanh_chan_03.jpg', colorId: 'hong' },
    { label: 'Mẫu 09 - Tím pastel', image: baseStorage + 'thunlanh_chan_10.jpg', colorId: 'tim' },
    { label: 'Mẫu 10 - Be sữa thanh lịch', image: baseStorage + 'thunlanh_chan_12.jpg', colorId: 'be' },
    { label: 'Mẫu 11 - Nâu tây ấm áp', image: baseStorage + 'thunlanh_chan_15.jpg', colorId: 'nau' },
  ];

  // 6 Ảnh chung / bối cảnh phơi sào & góc chụp chất vải -> ĐẨY LÊN ĐẦU TIÊN
  const extraImages = [
    baseStorage + 'thunlanh_chan_08.jpg#color=xam-dam',   // phơi sào ghi đậm
    baseStorage + 'thunlanh_chan_09.jpg#color=xam',       // phơi sào ghi sáng
    baseStorage + 'thunlanh_chan_11.jpg#color=hong',      // phơi sào hồng cherry/hồng phấn
    baseStorage + 'thunlanh_chan_13.jpg#color=xanh-bo',    // phơi sào xanh cốm
    baseStorage + 'thunlanh_chan_14.jpg#color=xanh-duong', // phơi sào xanh dương
    baseStorage + 'thunlanh_chan_04.jpg#color=xam',       // cận cảnh nhấc góc chất vải
  ];

  const variantImages = variants.map(v => `${v.image}#color=${v.colorId}`);

  // ĐẨY ẢNH CHUNG LÊN CÁC VỊ TRÍ ĐẦU TIÊN, sau đó mới đến ảnh đại diện từng mẫu
  const allImages = [...extraImages, ...variantImages];

  const updateData = {
    colors: ['xam', 'xam-dam', 'xanh-bo', 'xanh-duong', 'xanh-ghi', 'xanh-la-dam', 'hong-cam', 'hong', 'tim', 'be', 'nau'],
    description: `Chăn hè thun lạnh Tencel Ice Silk cao cấp chần viền vi tính tinh tế giá 300.000đ.\nBề mặt vải mềm rũ mượt mà, chạm vào mát lạnh tức thì, kháng khuẩn và siêu thoáng khí cho những đêm hè oi bức hay phòng điều hòa mát mẻ quanh năm.\nTrọn bộ gồm:\n- 1 Vỏ chăn hè thun lạnh chần viền cao cấp (kích thước 2m x 2m2)\n- 11 gam màu đa dạng: Xám nhạt, Xám đậm, Xanh bơ, Xanh dương, Xanh ghi, Xanh lá đậm, Hồng cam đào, Hồng cherry, Tím, Be, Nâu.\n<!--cats:["mon-le","chat-lieu-lanh","mau-tron"]-->\n<!--vars:${JSON.stringify(variants)}-->`,
    images: allImages,
    cover_image: baseStorage + 'thunlanh_chan_08.jpg',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', 'LE_CHAN_THUN_LANH_300K')
    .select();

  if (error) {
    console.error('Error updating LE_CHAN_THUN_LANH_300K:', error);
    process.exit(1);
  }

  console.log('✓ Successfully updated LE_CHAN_THUN_LANH_300K in Supabase:');
  console.log(`Variants count: ${variants.length} colors`);
  console.log(`General images upfront: ${extraImages.length}`);
  console.log(`Total images: ${allImages.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
