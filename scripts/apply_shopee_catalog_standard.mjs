import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== CHUẨN HÓA DATA THEO MÔ HÌNH SHOPEE (ẢNH CHUNG & ẢNH BIẾN THỂ TÁCH BIỆT) ===\n');

  // 1. SET350: Set ga chun 2 gối thun lạnh CEELING 350k
  // 8 ảnh đầu: Ảnh giới thiệu dòng sản phẩm (Bìa showroom 9 cuộn, cận cảnh vải, tem mác CEELING, túi xách...) -> CLEAN URLS
  // 9 ảnh sau: Ảnh thực tế từng màu -> CÓ TAG #color=...
  const set350General = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_02.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_03.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_04.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_05.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_06.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_07.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_08.jpg',
  ];

  const set350Colors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_09.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_10.jpg#color=xanh-mint',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_11.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_12.jpg#color=tim-khoi',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_13.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_14.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_15.jpg#color=xanh-navy',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_16.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_17.jpg#color=xanh-nhat',
  ];

  const set350Desc = `Set ga chun và 2 vỏ gối chất liệu thun lạnh Tencel Ice Silk cao cấp thương hiệu CEELING giá 350.000đ. Bề mặt siêu mềm mịn, mát lạnh tức thì ngay khi chạm vào, kháng khuẩn tự nhiên. Tông màu trơn thanh lịch, phù hợp với mọi phong cách phòng ngủ hiện đại.
Trọn bộ gồm:
- 1 Ga chun thun lạnh Tencel (vừa đệm dày tới 20cm)
- 2 Vỏ gối nằm thun lạnh (45x65cm)
<!--cats:["set-3-mon","chat-lieu-lanh","mau-tron"]-->`;

  await supabase.from('products').update({
    cover_image: set350General[0],
    images: [...set350General, ...set350Colors],
    colors: ['xam', 'xanh-mint', 'xanh-reu', 'tim-khoi', 'nau', 'vang-nhat', 'xanh-navy', 'xanh-duong', 'xanh-nhat'],
    description: set350Desc,
  }).eq('id', 'SET350');
  console.log('✓ SET350: Đã cập nhật 8 ảnh giới thiệu chung + 9 ảnh màu riêng biệt.');

  // 2. SET4_BINGBONG_240K: Set 4 món kèm gối ôm BingBong
  // 4 ảnh đầu: Ảnh bìa, logo, ảnh trải 9 bộ, chi tiết ruột gối -> CLEAN URLS
  // 6 ảnh sau: 6 màu tương ứng -> CÓ TAG #color=...
  const bingbongGeneral = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_02.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_09.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_10.jpg',
  ];

  const bingbongColors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_03.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_04.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_05.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_06.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_07.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_08.jpg#color=xanh-duong',
  ];

  const bingbongDesc = `Set 4 món chăn ga gối kèm gối ôm BingBong siêu dễ thương tone màu pastel kẹo ngọt cho bé và cả gia đình. Chất vải đũi cotton mát mịn, êm ái, rất an toàn và dịu nhẹ cho làn da nhạy cảm.
Trọn bộ 4 món bao gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 1 Vỏ chăn hè kéo khóa lồng ruột
- 1 Vỏ gối nằm tiêu chuẩn (45x65cm)
- 1 Vỏ gối ôm BingBong tròn đáng yêu (35x100cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->`;

  await supabase.from('products').update({
    cover_image: bingbongGeneral[0],
    images: [...bingbongGeneral, ...bingbongColors],
    colors: ['hong-dat', 'be', 'xanh-reu', 'nau', 'vang-nhat', 'xanh-duong'],
    description: bingbongDesc,
  }).eq('id', 'SET4_BINGBONG_240K');
  console.log('✓ SET4_BINGBONG_240K: Đã cập nhật 4 ảnh giới thiệu chung + 6 ảnh màu riêng biệt.');

  // 3. SET4_NI_CHAM_BI_700K: Nỉ chấm bi mùa đông
  // 7 ảnh đầu: Lookbook phòng ngủ, cận cảnh lớp chần bông, chi tiết chun -> CLEAN URLS
  // 6 ảnh sau: 6 màu riêng biệt -> CÓ TAG #color=...
  const niChamBiGeneral = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_02.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_03.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_04.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_05.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_06.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_07.jpg',
  ];

  const niChamBiColors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_08.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_09.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_10.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_11.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_12.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_13.jpg#color=hong-dat',
  ];

  const niChamBiDesc = `Bộ chăn ga gối nỉ nhung chần bông họa tiết chấm bi Polka Dot ấm áp mùa đông giá 700.000đ. Chất vải nỉ nhung cao cấp đanh sợi, giữ nhiệt vượt trội, bề mặt chần bông êm ái xốp mịn.
Bộ chăn ga 4 món bao gồm:
▪ 01 Chăn chần bông dày dặn (2m x 2m2)
▪ 01 Ga chần phủ freesize 
▪ 02 Vỏ gối đầu 48*74cm
<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong"]-->`;

  await supabase.from('products').update({
    cover_image: niChamBiGeneral[0],
    images: [...niChamBiGeneral, ...niChamBiColors],
    colors: ['nau', 'vang-nhat', 'xanh-reu', 'be', 'xam', 'hong-dat'],
    description: niChamBiDesc,
  }).eq('id', 'SET4_NI_CHAM_BI_700K');
  console.log('✓ SET4_NI_CHAM_BI_700K: Đã cập nhật 7 ảnh giới thiệu chung + 6 ảnh màu riêng biệt.');

  // 4. SET4_PHI_LUA_610K: Phi lụa thêu viền ren
  const phiLuaGeneral = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_07.jpg',
  ];

  const phiLuaColors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_02.jpg#color=xanh-mint',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_03.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_04.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_05.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_06.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_08.jpg#color=hong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_09.jpg#color=vang',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_10.jpg#color=xanh-duong',
  ];

  const phiLuaDesc = `Romance Quilting nhẹ nhàng thủ thỉ câu chuyện ngày hạ. Được hoàn thiện trên nền chất liệu vải phi lụa mềm mại, thoáng khí, chăn ga chần bông êm ái cùng điểm nhấn bèo ren bao quanh tạo nên tổng thể nhẹ nhàng mà đầy lôi cuốn.
Bộ chăn ga 4 món bao gồm:
▪ 01 Chăn hè chần bông (2m x 2m2)
▪ 01 Ga chần phủ freesize
▪ 02 Vỏ gối đầu 48*74cm trần bông
<!--cats:["set-4-mon","chat-lieu-lua","mau-tron"]-->`;

  await supabase.from('products').update({
    cover_image: phiLuaGeneral[0],
    images: [...phiLuaGeneral, ...phiLuaColors],
    colors: ['xanh-mint', 'hong-dat', 'vang-nhat', 'xam', 'xanh-reu', 'hong', 'vang', 'xanh-duong'],
    description: phiLuaDesc,
  }).eq('id', 'SET4_PHI_LUA_610K');
  console.log('✓ SET4_PHI_LUA_610K: Đã cập nhật 2 ảnh giới thiệu chung + 8 ảnh màu riêng biệt.');

  // 5. LE_CHAN_THUN_LANH_300K: Vỏ chăn thun lạnh lẻ
  const leChanGeneral = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_04.jpg',
  ];

  const leChanColors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_02.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_03.jpg#color=hong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_05.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_06.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_07.jpg#color=xam',
  ];

  const leChanDesc = `Chăn hè thun lạnh Tencel Ice Silk cao cấp chần viền vi tính tinh tế. Bề mặt vải mềm rũ mượt mà, chạm vào mát lạnh tức thì, kháng khuẩn và siêu thoáng khí cho những đêm hè oi bức hay phòng điều hòa mát mẻ.
Trọn bộ gồm:
- 1 Vỏ chăn hè thun lạnh chần viền cao cấp (kích thước 2m x 2m2)
<!--cats:["mon-le","chat-lieu-lanh","mau-tron"]-->`;

  await supabase.from('products').update({
    cover_image: leChanGeneral[0],
    images: [...leChanGeneral, ...leChanColors],
    colors: ['hong-dat', 'hong', 'xanh-reu', 'xanh-duong', 'xam'],
    description: leChanDesc,
  }).eq('id', 'LE_CHAN_THUN_LANH_300K');
  console.log('✓ LE_CHAN_THUN_LANH_300K: Đã cập nhật 2 ảnh giới thiệu chung + 5 ảnh màu riêng biệt.');

  // 6. SET280: Set nỉ lông chuột Pureloom
  const set280General = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_02.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_03.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_04.jpg',
  ];

  const set280Colors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_05.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_06.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_07.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_08.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_09.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_10.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_11.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_12.jpg#color=tim-khoi',
  ];

  const set280Desc = `Set 3 món chăn ga gối chất liệu nỉ lông chuột cao cấp thương hiệu Pureloom giá 280.000đ. Mềm mịn như nhung, giữ ấm cực tốt, không xù lông khi giặt máy. Phù hợp thời tiết se lạnh mùa thu đông.
Trọn bộ gồm:
- 1 Ga chun nỉ lông chuột bọc đệm (vừa đệm dày tới 20cm)
- 2 Vỏ gối nằm nỉ lông chuột (45x65cm)
<!--cats:["set-3-mon","chat-lieu-ni"]-->`;

  await supabase.from('products').update({
    cover_image: set280General[0],
    images: [...set280General, ...set280Colors],
    colors: ['be', 'nau', 'xam', 'xanh-reu', 'hong-dat', 'xanh-duong', 'vang-nhat', 'tim-khoi'],
    description: set280Desc,
  }).eq('id', 'SET280');
  console.log('✓ SET280: Đã cập nhật 4 ảnh giới thiệu chung + 8 ảnh màu riêng biệt.');

  // 7. SET_NHAP_NI_280K
  const nhapNiGeneral = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_01.jpg',
  ];

  const nhapNiColors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_02.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_03.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_04.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_05.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_06.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_07.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_08.jpg#color=vang-nhat',
  ];

  await supabase.from('products').update({
    cover_image: nhapNiGeneral[0],
    images: [...nhapNiGeneral, ...nhapNiColors],
    colors: ['be', 'nau', 'xam', 'xanh-reu', 'hong-dat', 'xanh-duong', 'vang-nhat'],
  }).eq('id', 'SET_NHAP_NI_280K');
  console.log('✓ SET_NHAP_NI_280K: Đã cập nhật 1 ảnh giới thiệu chung + 7 ảnh màu riêng biệt.');

  // 8. LE_CHAN_NI_THO_300K: Xóa tag cũ 'mua-dong' thay bằng 'chat-lieu-ni'
  const { data: thoProd } = await supabase.from('products').select('description').eq('id', 'LE_CHAN_NI_THO_300K').single();
  if (thoProd) {
    const updatedDesc = thoProd.description.replace('"mua-dong",', '').replace(',"mua-dong"', '');
    await supabase.from('products').update({ description: updatedDesc }).eq('id', 'LE_CHAN_NI_THO_300K');
    console.log('✓ LE_CHAN_NI_THO_300K: Đã gỡ bỏ category cũ mua-dong.');
  }

  console.log('\n=== HOÀN TẤT CHUẨN HÓA DATA THEO MÔ HÌNH SHOPEE ===');
}

run();
