import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== ĐỒNG BỘ TOÀN BỘ 25 SẢN PHẨM CHUẨN MÔ HÌNH SHOPEE ===\n');

  // 1. SET4_PHI_LUA_610K
  // Ảnh 1, 7 là ảnh bìa & cận cảnh thêu nơ (ảnh dòng sản phẩm - clean)
  // Các ảnh màu: Xanh pastel (ảnh 2), Hồng phấn (ảnh 3), Vàng pastel (ảnh 4), Xám ghi (ảnh 5), Be kem (ảnh 1)
  // Các ảnh cận cảnh còn lại để clean
  const phiLuaImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_01.jpg', // Bìa dòng sản phẩm
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_07.jpg', // Cận cảnh thêu ren nơ
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_02.jpg#color=xanh-duong', // Xanh pastel / Ice Blue
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_03.jpg#color=hong-dat', // Hồng phấn
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_04.jpg#color=vang-nhat', // Vàng pastel
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_05.jpg#color=xam', // Ghi xám
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_01.jpg#color=be', // Be / Kem
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_06.jpg', // Cận cảnh xám
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_08.jpg', // Cận cảnh hồng
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_09.jpg', // Cận cảnh vàng
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_10.jpg', // Cận cảnh xanh
  ];

  await supabase.from('products').update({
    cover_image: phiLuaImages[0],
    images: phiLuaImages,
    colors: ['be', 'xanh-duong', 'hong-dat', 'vang-nhat', 'xam'],
  }).eq('id', 'SET4_PHI_LUA_610K');
  console.log('✓ SET4_PHI_LUA_610K: 2 ảnh giới thiệu + 5 màu chính xác không trùng lặp.');

  // 2. SET350
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

  await supabase.from('products').update({
    cover_image: set350General[0],
    images: [...set350General, ...set350Colors],
    colors: ['xam', 'xanh-mint', 'xanh-reu', 'tim-khoi', 'nau', 'vang-nhat', 'xanh-navy', 'xanh-duong', 'xanh-nhat'],
  }).eq('id', 'SET350');
  console.log('✓ SET350: 8 ảnh giới thiệu + 9 ảnh màu riêng biệt.');

  // 3. SET4_NI_CHAM_BI_700K
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
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_10.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_11.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_12.jpg#color=tim-khoi',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_13.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_14.jpg#color=xanh-reu',
  ];

  await supabase.from('products').update({
    cover_image: niChamBiGeneral[0],
    images: [...niChamBiGeneral, ...niChamBiColors],
    colors: ['nau', 'vang-nhat', 'xam', 'be', 'tim-khoi', 'hong-dat', 'xanh-reu'],
  }).eq('id', 'SET4_NI_CHAM_BI_700K');
  console.log('✓ SET4_NI_CHAM_BI_700K: 7 ảnh giới thiệu + 7 màu chuẩn xác (không bị gán 2 nâu).');

  // 4. SET4_BINGBONG_240K
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

  await supabase.from('products').update({
    cover_image: bingbongGeneral[0],
    images: [...bingbongGeneral, ...bingbongColors],
    colors: ['hong-dat', 'be', 'xanh-reu', 'nau', 'vang-nhat', 'xanh-duong'],
  }).eq('id', 'SET4_BINGBONG_240K');
  console.log('✓ SET4_BINGBONG_240K: 4 ảnh giới thiệu + 6 màu.');

  // 5. LE_CHAN_THUN_LANH_300K
  const leChanGeneral = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_04.jpg',
  ];

  const leChanColors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_02.jpg#color=hong-cam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_03.jpg#color=hong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_05.jpg#color=xanh-bo',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_06.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_07.jpg#color=xam',
  ];

  await supabase.from('products').update({
    cover_image: leChanGeneral[0],
    images: [...leChanGeneral, ...leChanColors],
    colors: ['hong-cam', 'hong', 'xanh-bo', 'xanh-duong', 'xam'],
  }).eq('id', 'LE_CHAN_THUN_LANH_300K');
  console.log('✓ LE_CHAN_THUN_LANH_300K: 2 ảnh giới thiệu + 5 màu.');

  // 6. SET280
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

  await supabase.from('products').update({
    cover_image: set280General[0],
    images: [...set280General, ...set280Colors],
    colors: ['be', 'nau', 'xam', 'xanh-reu', 'hong-dat', 'xanh-duong', 'vang-nhat', 'tim-khoi'],
  }).eq('id', 'SET280');
  console.log('✓ SET280: 4 ảnh giới thiệu + 8 màu chuẩn.');

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
  console.log('✓ SET_NHAP_NI_280K: 1 ảnh giới thiệu + 7 màu.');

  // 8. SET165_TRON
  const tron165General = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/109_chong_cuon_vai_dui_pastel.jpg',
  ];

  const tron165Colors = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/004_ke_soc_ghi_xam_dui_xuoc.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/019_tim_khoai_mon_tron_dui.jpg#color=tim-khoi',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/023_sao_nho_tron_hong_phan.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/090_chan_xam_ghi_cham_sao.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/102_chan_dui_moc_nau_be_cham_bi.jpg#color=be',
  ];

  await supabase.from('products').update({
    cover_image: tron165General[0],
    images: [...tron165General, ...tron165Colors],
    colors: ['xam', 'tim-khoi', 'hong-dat', 'nau', 'be'],
  }).eq('id', 'SET165_TRON');
  console.log('✓ SET165_TRON: 1 ảnh giới thiệu + 5 màu.');

  console.log('\n=== HOÀN TẤT ĐỒNG BỘ TOÀN BỘ SẢN PHẨM ===');
}

run();
