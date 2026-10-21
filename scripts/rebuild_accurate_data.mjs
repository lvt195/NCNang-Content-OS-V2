import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map gallery color names to slug
const colorMap165 = {
  'Xanh_Duong_Pastel': 'xanh-duong',
  'Xam_Ghi_Den': 'xam',
  'Hong_Do_Dao': 'hong-dat',
  'Vang_Cam': 'vang-nhat',
  'Trang_Kem_Be': 'be',
  'Nau_Dat_Cafe': 'nau',
  'Tim_Lavender': 'tim-khoi',
  'Xanh_La_Mint': 'xanh-mint',
};

// Viet diacritics helper for Set 165k names
function format165Label(name) {
  return name
    .replace(/caro/g, 'Caro')
    .replace(/ke_soc/g, 'Kẻ sọc')
    .replace(/ke_caro/g, 'Kẻ caro')
    .replace(/hoa_nhi/g, 'Hoa nhí')
    .replace(/hoa_cuc/g, 'Hoa cúc')
    .replace(/hoa_hong/g, 'Hoa hồng')
    .replace(/hoa_tulip/g, 'Hoa tulip')
    .replace(/hoa_la/g, 'Hoa lá')
    .replace(/gau_pooh/g, 'Gấu Pooh')
    .replace(/gau_teddy/g, 'Gấu Teddy')
    .replace(/gau_cute/g, 'Gấu cute')
    .replace(/gau_bong/g, 'Gấu bông')
    .replace(/gau_con/g, 'Gấu con')
    .replace(/trai_tim/g, 'Trái tim')
    .replace(/tho_ngoc/g, 'Thỏ ngọc')
    .replace(/tho_trang/g, 'Thỏ trắng')
    .replace(/meo_cun/g, 'Mèo cún')
    .replace(/banh_mi/g, 'Bánh mì')
    .replace(/dau_tay/g, 'Dâu tây')
    .replace(/cham_bi/g, 'Chấm bi')
    .replace(/xanh_duong/g, 'Xanh dương')
    .replace(/xanh_da_troi/g, 'Xanh da trời')
    .replace(/xanh_mint/g, 'Xanh mint')
    .replace(/xanh_bo/g, 'Xanh bơ')
    .replace(/xanh_la/g, 'Xanh lá')
    .replace(/xanh_pastel/g, 'Xanh pastel')
    .replace(/hong_phan/g, 'Hồng phấn')
    .replace(/hong_dao/g, 'Hồng đào')
    .replace(/hong_dat/g, 'Hồng đất')
    .replace(/hong_pastel/g, 'Hồng pastel')
    .replace(/vang_kem/g, 'Vàng kem')
    .replace(/vang_cam/g, 'Vàng cam')
    .replace(/vang_nhat/g, 'Vàng nhạt')
    .replace(/trang_kem/g, 'Trắng kem')
    .replace(/be_am/g, 'Be ấm')
    .replace(/be_kem/g, 'Be kem')
    .replace(/nau_dat/g, 'Nâu đất')
    .replace(/nau_be/g, 'Nâu be')
    .replace(/ghi_xam/g, 'Ghi xám')
    .replace(/xam_nhat/g, 'Xám nhạt')
    .replace(/tim_pastel/g, 'Tím pastel')
    .replace(/tim_lavender/g, 'Tím lavender')
    .replace(/tim_khoai_mon/g, 'Tím khoai môn')
    .replace(/vintage/g, 'Vintage')
    .replace(/pastel/g, 'Pastel')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^([a-z])/i, (m, c) => c.toUpperCase());
}

async function rebuildAll() {
  console.log('=== STARTING REBUILD ACCURATE DATA ===');

  // 1. SET4_BINGBONG_240K
  console.log('1. Rebuilding SET4_BINGBONG_240K...');
  const bingbongImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_02.jpg', // Bìa logo BINGBONG
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_09.jpg', // 9 bộ trên sàn
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_10.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_06.jpg', // Be Nâu
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_03.jpg', // Hồng Pastel
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_05.jpg', // Xanh Cốm
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_08.jpg', // Xanh Ocean
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_07.jpg', // Vàng Pastel
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_04.jpg', // Be Sáng
  ];

  // Exactly 6 color/pattern variants (exclude overview photos bb_01, bb_02, bb_09, bb_10)
  const bingbongVariants = [
    { label: 'Be Nâu', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_06.jpg', colorId: 'nau' },
    { label: 'Hồng Pastel', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_03.jpg', colorId: 'hong-dat' },
    { label: 'Xanh Cốm', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_05.jpg', colorId: 'xanh-reu' },
    { label: 'Xanh Ocean', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_08.jpg', colorId: 'xanh-duong' },
    { label: 'Vàng Pastel', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_07.jpg', colorId: 'vang-nhat' },
    { label: 'Be Sáng', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_04.jpg', colorId: 'be' },
  ];

  const bingbongDesc = `Set 4 món chăn ga gối kèm gối ôm BingBong siêu dễ thương tone màu pastel kẹo ngọt cho bé và cả gia đình. Chất vải đũi cotton mát mịn, êm ái, rất an toàn và dịu nhẹ cho làn da nhạy cảm.
Trọn bộ 4 món bao gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 1 Vỏ chăn hè kéo khóa lồng ruột
- 1 Vỏ gối nằm tiêu chuẩn (45x65cm)
- 1 Vỏ gối ôm BingBong tròn đáng yêu (35x100cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(bingbongVariants)}-->`;

  await supabase.from('products').update({
    cover_image: bingbongImages[0],
    images: bingbongImages,
    colors: ['nau', 'hong-dat', 'xanh-reu', 'xanh-duong', 'vang-nhat', 'be'],
    description: bingbongDesc,
  }).eq('id', 'SET4_BINGBONG_240K');
  console.log('  ✓ SET4_BINGBONG_240K updated with 6 distinct variants.');

  // 2. LE_CHAN_THUN_LANH_300K
  console.log('2. Rebuilding LE_CHAN_THUN_LANH_300K...');
  const thunLanhVariants = [
    { label: 'Hồng Cam Đào', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_02.jpg', colorId: 'hong-dat' },
    { label: 'Hồng Cherry', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_03.jpg', colorId: 'hong-dat' },
    { label: 'Xanh Cốm', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_05.jpg', colorId: 'xanh-reu' },
    { label: 'Xanh Blue', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_06.jpg', colorId: 'xanh-duong' },
    { label: 'Xám Đậm', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_07.jpg', colorId: 'xam' },
    { label: 'Xám Nhạt', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_01.jpg', colorId: 'xam' },
  ];

  const thunLanhDesc = `Chăn hè thun lạnh Tencel Ice Silk cao cấp chần viền vi tính tinh tế. Bề mặt vải mềm rũ mượt mà, chạm vào mát lạnh tức thì, kháng khuẩn và siêu thoáng khí cho những đêm hè oi bức hay phòng điều hòa mát mẻ.
Trọn bộ gồm:
- 1 Vỏ chăn hè thun lạnh chần viền cao cấp (kích thước 2m x 2m2)
<!--cats:["mon-le","chat-lieu-lanh","mau-tron"]-->
<!--vars:${JSON.stringify(thunLanhVariants)}-->`;

  await supabase.from('products').update({
    colors: ['hong-dat', 'xanh-reu', 'xanh-duong', 'xam'],
    description: thunLanhDesc,
  }).eq('id', 'LE_CHAN_THUN_LANH_300K');
  console.log('  ✓ LE_CHAN_THUN_LANH_300K updated with 6 distinct color variants.');

  // 3. SET4_PHI_LUA_610K
  console.log('3. Rebuilding SET4_PHI_LUA_610K...');
  const phiLuaVariants = [
    { label: 'Trắng Kem Bèo Ren', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_01.jpg', colorId: 'be' },
    { label: 'Xanh Ngọc Bích', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_02.jpg', colorId: 'xanh-mint' },
    { label: 'Hồng Phấn Lãng Mạn', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_03.jpg', colorId: 'hong-dat' },
    { label: 'Vàng Nhạt Hoàng Gia', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_04.jpg', colorId: 'vang-nhat' },
    { label: 'Ghi Xám Khói', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_05.jpg', colorId: 'xam' },
    { label: 'Xanh Mint Dịu Nhẹ', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_06.jpg', colorId: 'xanh-mint' },
    { label: 'Be Cát Thanh Lịch', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_07.jpg', colorId: 'be' },
    { label: 'Hồng Đất Vintage', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_08.jpg', colorId: 'hong-dat' },
    { label: 'Vàng Mơ Ấm Áp', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_09.jpg', colorId: 'vang-nhat' },
    { label: 'Xanh Khói Hiện Đại', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_10.jpg', colorId: 'xanh-duong' },
  ];

  const phiLuaDesc = `Romance Quilting nhẹ nhàng thủ thỉ câu chuyện ngày hạ. Được hoàn thiện trên nền chất liệu vải phi lụa mềm mại, thoáng khí, chăn ga chần bông êm ái cùng điểm nhấn bèo ren bao quanh tạo nên tổng thể nhẹ nhàng mà đầy lôi cuốn.
Bộ chăn ga 4 món bao gồm :
▪ 01 Chăn hè chần bông (2m x 2m2)
▪ 01 Ga chần phủ freesize
▪ 02 Vỏ gối đầu 48*74cm trần bông
<!--cats:["set-4-mon","chat-lieu-lua","mau-tron"]-->
<!--vars:${JSON.stringify(phiLuaVariants)}-->`;

  await supabase.from('products').update({
    colors: ['be', 'xanh-mint', 'hong-dat', 'vang-nhat', 'xam', 'xanh-duong'],
    description: phiLuaDesc,
  }).eq('id', 'SET4_PHI_LUA_610K');
  console.log('  ✓ SET4_PHI_LUA_610K updated with descriptive Romance variants.');

  // 4. SET4_NI_CHAM_BI_700K
  console.log('4. Rebuilding SET4_NI_CHAM_BI_700K...');
  const niChamBiVariants = [
    { label: 'Chấm Bi Nâu Be Hạt Dẻ', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_08.jpg', colorId: 'nau' },
    { label: 'Chấm Bi Vàng Mù Tạt', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_09.jpg', colorId: 'vang-nhat' },
    { label: 'Chấm Bi Xanh Rêu Mộc', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_10.jpg', colorId: 'xanh-reu' },
    { label: 'Chấm Bi Kem Be Vintage', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_11.jpg', colorId: 'be' },
    { label: 'Chấm Bi Ghi Xám Hiện Đại', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_12.jpg', colorId: 'xam' },
    { label: 'Chấm Bi Hồng Đất Ngọt Ngào', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_13.jpg', colorId: 'hong-dat' },
    { label: 'Chấm Bi Nâu Trầm Ấm', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_14.jpg', colorId: 'nau' },
  ];

  const niChamBiDesc = `Bộ chăn ga gối nỉ nhung chần bông họa tiết chấm bi Polka Dot ấm áp mùa đông giá 700.000đ. Chất vải nỉ nhung cao cấp đanh sợi, giữ nhiệt vượt trội, bề mặt chần bông êm ái xốp mịn.
Bộ chăn ga 4 món bao gồm:
▪ 01 Chăn chần bông dày dặn (2m x 2m2)
▪ 01 Ga chần phủ freesize 
▪ 02 Vỏ gối đầu 48*74cm
<!--cats:["set-4-mon","chat-lieu-ni","mua-dong","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(niChamBiVariants)}-->`;

  await supabase.from('products').update({
    colors: ['nau', 'vang-nhat', 'xanh-reu', 'be', 'xam', 'hong-dat'],
    description: niChamBiDesc,
  }).eq('id', 'SET4_NI_CHAM_BI_700K');
  console.log('  ✓ SET4_NI_CHAM_BI_700K updated with 7 distinct Polka Dot variants.');

  // 5. SET4_BONG_XOP_400K
  console.log('5. Rebuilding SET4_BONG_XOP_400K...');
  const bongXopVariants = [
    { label: 'Chấm Bi Slogan I Will Always Love You', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-bong-xop-400k/bongxop_02.jpg', colorId: 'be' },
    { label: 'Chấm Bi Slogan It\'s Ok Not To Be Ok', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-bong-xop-400k/bongxop_03.jpg', colorId: 'xanh-duong' },
    { label: 'Chấm Bi Slogan Whatever You Like', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-bong-xop-400k/bongxop_04.jpg', colorId: 'vang-nhat' },
    { label: 'Chấm Bi Bánh Ngọt Toda', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-bong-xop-400k/bongxop_05.jpg', colorId: 'nau' },
    { label: 'Chấm Bi Portrait Artist Xanh Mint', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-bong-xop-400k/bongxop_06.jpg', colorId: 'xanh-mint' },
    { label: 'Chấm Bi Detergent Vàng Bơ', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-bong-xop-400k/bongxop_01.jpg', colorId: 'vang-nhat' },
  ];

  const bongXopDesc = `Puff pastry 🥨🥞 Lấy cảm hứng từ chiếc bánh puff pastry đan xen các lớp bột và bơ, chất liệu cotton đũi sợi bông xốp nhiều tầng tạo nên sự mềm mại, giữ màu tốt, hoạ tiết chấm bi trẻ trung hiện đại.
Full set 4 món bao gồm:
. 02 vỏ gối nằm
. 01 ga trải giường freesize
. 01 vỏ chăn có khoá kéo
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(bongXopVariants)}-->`;

  await supabase.from('products').update({
    colors: ['be', 'xanh-duong', 'vang-nhat', 'nau', 'xanh-mint'],
    description: bongXopDesc,
  }).eq('id', 'SET4_BONG_XOP_400K');
  console.log('  ✓ SET4_BONG_XOP_400K updated with 6 Puff Pastry variants.');

  // 6. LE_CHAN_NI_THO_300K
  console.log('6. Rebuilding LE_CHAN_NI_THO_300K...');
  const niThoVariants = [
    { label: 'Cún Con Puppy Vàng Kem', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-ni-tho-300k/nitho_01.jpg', colorId: 'vang-nhat' },
    { label: 'Arietta The Best Kem Be', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-ni-tho-300k/nitho_02.jpg', colorId: 'be' },
    { label: 'Gấu Bông Cute Hồng Nhạt', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-ni-tho-300k/nitho_04.jpg', colorId: 'hong-dat' },
    { label: 'Gấu Teddy Bánh Kem Nâu', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-ni-tho-300k/nitho_07.jpg', colorId: 'nau' },
    { label: 'Puppy & Thỏ Ngọc Xanh Mint', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-ni-tho-300k/nitho_08.jpg', colorId: 'xanh-mint' },
    { label: 'Gấu Nâu The Ned Ghi Xám', image: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-ni-tho-300k/nitho_12.jpg', colorId: 'xam' },
  ];

  const niThoDesc = `Vỏ chăn lẻ chất liệu nỉ lông thỏ cao cấp mềm mịn như nhung, siêu ấm áp cho mùa đông giá 300.000đ. Mặt lông thỏ tơ mềm mại, không xù lông khi giặt máy, giữ nhiệt cực tốt.
Trọn bộ gồm:
- 1 Vỏ chăn lẻ nỉ lông thỏ có khóa kéo (kích thước 2m x 2m2)
<!--cats:["mon-le","chat-lieu-ni","mua-dong","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(niThoVariants)}-->`;

  await supabase.from('products').update({
    colors: ['vang-nhat', 'be', 'hong-dat', 'nau', 'xanh-mint', 'xam'],
    description: niThoDesc,
  }).eq('id', 'LE_CHAN_NI_THO_300K');
  console.log('  ✓ LE_CHAN_NI_THO_300K updated with 6 distinct variants.');

  // 7. SET 165K (9 link sản phẩm theo chủ đề, lấy đúng tên tiếng Việt chi tiết từ gallery_chi_tiet)
  console.log('7. Rebuilding 9 Set 165k products with accurate Vietnamese diacritic names from gallery_chi_tiet...');
  const galleryPath = 'image/Set 3 món ga + 2 vỏ gối/Set 165k (Phan loai chi tiet)/gallery_chi_tiet.html';
  if (fs.existsSync(galleryPath)) {
    const rawHtml = fs.readFileSync(galleryPath, 'utf-8');
    const match = rawHtml.match(/const data = (\[.*?\]);/s);
    if (match) {
      const items165 = JSON.parse(match[1]);
      console.log(`  Loaded ${items165.length} items from gallery_chi_tiet.html`);

      // 9 collections
      const collections = [
        { id: 'SET165_CARO', name: 'Set 3 món ga gối đũi Kẻ Caro Hàn Quốc', filter: (it) => it.patterns.includes('Ke_Caro'), cat2: 'hoa-tiet-ke' },
        { id: 'SET165_SOC', name: 'Set 3 món ga gối đũi Kẻ Sọc & Hình học hiện đại', filter: (it) => it.patterns.includes('Ke_Soc') || it.patterns.includes('Hinh_Hoc_Truu_Tuong'), cat2: 'hoa-tiet-ke' },
        { id: 'SET165_HOANHI', name: 'Set 3 món ga gối đũi Hoa nhí Vintage cổ điển', filter: (it) => it.patterns.includes('Hoa_Nhi_Hoa_Co') && it.tones.includes('Vintage_Retro_Co_Dien'), cat2: 'hoa-tiet-hoa-nhi' },
        { id: 'SET165_HOACO', name: 'Set 3 món ga gối đũi Hoa cúc & Hoa cỏ mùa hạ', filter: (it) => it.patterns.includes('Hoa_Nhi_Hoa_Co') && !it.tones.includes('Vintage_Retro_Co_Dien'), cat2: 'hoa-tiet-hoa-nhi' },
        { id: 'SET165_GAU', name: 'Set 3 món ga gối đũi Gấu Teddy & Bánh quy ấm áp', filter: (it) => it.patterns.includes('Gau_Dong_Vat') && (it.name.includes('gau') || it.name.includes('biscuit') || it.name.includes('banh')), cat2: 'hoa-tiet-de-thuong' },
        { id: 'SET165_THU', name: 'Set 3 món ga gối đũi Thỏ ngọc & Thú cưng đáng yêu', filter: (it) => it.patterns.includes('Gau_Dong_Vat') && (it.name.includes('tho') || it.name.includes('cun') || it.name.includes('meo') || it.name.includes('khi')), cat2: 'hoa-tiet-de-thuong' },
        { id: 'SET165_TRAITIM', name: 'Set 3 món ga gối đũi Trái tim & Dâu tây ngọt ngào', filter: (it) => it.patterns.includes('Trai_Tim_No') || it.name.includes('dau_tay'), cat2: 'hoa-tiet-de-thuong' },
        { id: 'SET165_HOATHINH', name: 'Set 3 món ga gối đũi Hoạt hình trẻ em & Sanrio', filter: (it) => it.patterns.includes('Hoat_Hinh_Tre_Em') || it.name.includes('sanrio'), cat2: 'hoa-tiet-de-thuong' },
        { id: 'SET165_TRON', name: 'Set 3 món ga gối đũi Màu trơn & Tối giản thanh lịch', filter: (it) => it.patterns.includes('Tron_Toi_Gian'), cat2: 'mau-tron' },
      ];

      for (const col of collections) {
        const matchedItems = items165.filter(col.filter).slice(0, 18);
        if (matchedItems.length === 0) continue;

        const variants = matchedItems.map((it) => {
          const colorKey = it.colors && it.colors[0] ? it.colors[0] : 'Trang_Kem_Be';
          const colorSlug = colorMap165[colorKey] || 'be';
          return {
            label: format165Label(it.name),
            image: `https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/${it.filename}`,
            colorId: colorSlug,
          };
        });

        const distinctColors = Array.from(new Set(variants.map((v) => v.colorId)));
        const images = variants.map((v) => v.image);

        const desc = `Bộ chăn ga gối đũi cotton tự nhiên 3 món Nhà Có Mùi Nắng giá 165.000đ. Chất liệu đũi mộc tự nhiên thoáng khí, thấm hút mồ hôi cực tốt, tạo cảm giác mềm mại mát mẻ cho giấc ngủ thư thái.
Trọn bộ 3 món bao gồm:
- 1 Ga chun bọc đệm theo kích thước (vừa đệm dày tới 15cm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-3-mon","chat-lieu-dui","${col.cat2}"]-->
<!--vars:${JSON.stringify(variants)}-->`;

        await supabase.from('products').update({
          name: col.name,
          images: images,
          cover_image: images[0],
          colors: distinctColors,
          description: desc,
        }).eq('id', col.id);
        console.log(`  ✓ Updated ${col.id}: ${variants.length} named variants (e.g. "${variants[0].label}")`);
      }
    }
  }

  console.log('=== ALL PRODUCTS REBUILT SUCCESSFULLY! ===');
}

rebuildAll().catch((err) => {
  console.error('Rebuild failed:', err);
  process.exit(1);
});
