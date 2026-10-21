import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== 1. CHUẨN HÓA DANH MỤC (CATEGORIES) ===');
  
  // Xóa danh mục trùng lặp 'mua-dong'
  await supabase.from('categories').delete().eq('id', 'mua-dong');
  console.log('  ✓ Đã xóa danh mục trùng lặp "mua-dong"');

  // Danh mục 11 nhóm chuẩn, phân chia hợp lý
  const standardCats = [
    { id: 'set-3-mon', name: 'Set 3 món (Ga + 2 gối)', description: 'Bộ ga chun bọc đệm + 2 vỏ gối nằm đồng bộ', display_order: 1 },
    { id: 'set-4-mon', name: 'Set 4 món (Có vỏ chăn)', description: 'Bộ ga chun + 2 vỏ gối + vỏ chăn hè thu', display_order: 2 },
    { id: 'mon-le', name: 'Vỏ chăn & Món lẻ', description: 'Vỏ chăn nỉ lông, chăn hè làm mát tách lẻ', display_order: 3 },
    { id: 'chat-lieu-dui', name: 'Vải đũi cotton', description: 'Chất liệu đũi tự nhiên mộc mạc, thoáng khí êm dịu', display_order: 4 },
    { id: 'chat-lieu-lanh', name: 'Thun lạnh Tencel', description: 'Thun lạnh Ice Silk mát lạnh mịn màng', display_order: 5 },
    { id: 'chat-lieu-ni', name: 'Nỉ lông & Mùa đông', description: 'Nỉ lông chuột, nỉ lông thỏ ấm áp giữ nhiệt đón mùa lạnh', display_order: 6 },
    { id: 'chat-lieu-lua', name: 'Lụa & Phi lụa cao cấp', description: 'Phi lụa thêu viền ren quý phái, mềm mại', display_order: 7 },
    { id: 'hoa-tiet-ke', name: 'Kẻ caro & sọc', description: 'Họa tiết kẻ caro, kẻ sọc hiện đại Hàn Quốc', display_order: 8 },
    { id: 'hoa-tiet-hoa-nhi', name: 'Hoa nhí Vintage', description: 'Họa tiết hoa nhí, hoa cỏ mùa hạ nhẹ nhàng', display_order: 9 },
    { id: 'hoa-tiet-de-thuong', name: 'Hình thú & hoạt hình', description: 'Họa tiết gấu, thỏ, chấm bi, hoạt hình đáng yêu', display_order: 10 },
    { id: 'mau-tron', name: 'Màu trơn tối giản', description: 'Tông màu trơn sang trọng, hiện đại tối giản', display_order: 11 },
  ];

  for (const c of standardCats) {
    await supabase.from('categories').upsert(c, { onConflict: 'id' });
  }
  console.log(`  ✓ Đã cập nhật ${standardCats.length} danh mục chuẩn vào Database.`);

  console.log('\n=== 2. CHUẨN HÓA SẢN PHẨM CHIA THEO MÀU (COLOR-BASED) ===');
  console.log('-> Không chia type, chỉ cần chọn màu là đổi đúng ảnh 100%!');

  // 2.1. SET4_BINGBONG_240K (Set 4 món kèm gối ôm BingBong)
  const bingbongImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_02.jpg', // Bìa logo
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_09.jpg', // Ảnh tổng thể 9 bộ trên sàn
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_06.jpg#color=nau', // Be Nâu
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_03.jpg#color=hong-dat', // Hồng Pastel
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_05.jpg#color=xanh-reu', // Xanh Cốm
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_08.jpg#color=xanh-duong', // Xanh Ocean
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_07.jpg#color=vang-nhat', // Vàng Pastel
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_04.jpg#color=be', // Be Sáng
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-bingbong-240k/bb_10.jpg',
  ];

  const bingbongDesc = `Set 4 món chăn ga gối kèm gối ôm BingBong siêu dễ thương tone màu pastel kẹo ngọt cho bé và cả gia đình. Chất vải đũi cotton mát mịn, êm ái, rất an toàn và dịu nhẹ cho làn da nhạy cảm.
Trọn bộ 4 món bao gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 1 Vỏ chăn hè kéo khóa lồng ruột
- 1 Vỏ gối nằm tiêu chuẩn (45x65cm)
- 1 Vỏ gối ôm BingBong tròn đáng yêu (35x100cm)
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->`;

  await supabase.from('products').update({
    cover_image: bingbongImages[0],
    images: bingbongImages,
    colors: ['nau', 'hong-dat', 'xanh-reu', 'xanh-duong', 'vang-nhat', 'be'],
    description: bingbongDesc,
  }).eq('id', 'SET4_BINGBONG_240K');
  console.log('  ✓ SET4_BINGBONG_240K: Chuyển về chọn màu đổi ảnh (gỡ bỏ type, tag #color)');

  // 2.2. LE_CHAN_THUN_LANH_300K
  const thunLanhChanImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_02.jpg#color=hong-dat', // Hồng Cam Đào
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_03.jpg#color=hong', // Hồng Cherry
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_05.jpg#color=xanh-reu', // Xanh Cốm
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_06.jpg#color=xanh-duong', // Xanh Blue
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_07.jpg#color=xam', // Xám Đậm
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/vo-chan-thun-lanh/thunlanh_01.jpg#color=be', // Xám Nhạt / Be
  ];

  const thunLanhDesc = `Chăn hè thun lạnh Tencel Ice Silk cao cấp chần viền vi tính tinh tế. Bề mặt vải mềm rũ mượt mà, chạm vào mát lạnh tức thì, kháng khuẩn và siêu thoáng khí cho những đêm hè oi bức hay phòng điều hòa mát mẻ.
Trọn bộ gồm:
- 1 Vỏ chăn hè thun lạnh chần viền cao cấp (kích thước 2m x 2m2)
<!--cats:["mon-le","chat-lieu-lanh","mau-tron"]-->`;

  await supabase.from('products').update({
    cover_image: thunLanhChanImages[0].split('#')[0],
    images: thunLanhChanImages,
    colors: ['hong-dat', 'hong', 'xanh-reu', 'xanh-duong', 'xam', 'be'],
    description: thunLanhDesc,
  }).eq('id', 'LE_CHAN_THUN_LANH_300K');
  console.log('  ✓ LE_CHAN_THUN_LANH_300K: Khớp URL ảnh thật + tag #color');

  // 2.3. SET4_PHI_LUA_610K
  const phiLuaImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_01.jpg#color=be', // Trắng Kem
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_02.jpg#color=xanh-mint', // Xanh Ngọc
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_03.jpg#color=hong-dat', // Hồng Phấn
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_04.jpg#color=vang-nhat', // Vàng Nhạt
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_05.jpg#color=xam', // Ghi Xám
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_06.jpg#color=xanh-reu', // Xanh Mint
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_07.jpg#color=nau', // Be Cát Nâu
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_08.jpg#color=hong', // Hồng Đất
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_09.jpg#color=vang', // Vàng Mơ
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-phi-lua-610k/philua_10.jpg#color=xanh-duong', // Xanh Khói
  ];

  const phiLuaDesc = `Romance Quilting nhẹ nhàng thủ thỉ câu chuyện ngày hạ. Được hoàn thiện trên nền chất liệu vải phi lụa mềm mại, thoáng khí, chăn ga chần bông êm ái cùng điểm nhấn bèo ren bao quanh tạo nên tổng thể nhẹ nhàng mà đầy lôi cuốn.
Bộ chăn ga 4 món bao gồm:
▪ 01 Chăn hè chần bông (2m x 2m2)
▪ 01 Ga chần phủ freesize
▪ 02 Vỏ gối đầu 48*74cm trần bông
<!--cats:["set-4-mon","chat-lieu-lua","mau-tron"]-->`;

  await supabase.from('products').update({
    cover_image: phiLuaImages[0].split('#')[0],
    images: phiLuaImages,
    colors: ['be', 'xanh-mint', 'hong-dat', 'vang-nhat', 'xam', 'xanh-reu', 'nau', 'hong', 'vang', 'xanh-duong'],
    description: phiLuaDesc,
  }).eq('id', 'SET4_PHI_LUA_610K');
  console.log('  ✓ SET4_PHI_LUA_610K: Chuyển về chọn màu đổi ảnh (tag #color)');

  // 2.4. SET4_NI_CHAM_BI_700K
  const niChamBiImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_01.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_02.jpg',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_08.jpg#color=nau', // Chấm Bi Nâu Be
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_09.jpg#color=vang-nhat', // Chấm Bi Vàng
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_10.jpg#color=xanh-reu', // Chấm Bi Xanh Rêu
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_11.jpg#color=be', // Chấm Bi Kem Be
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_12.jpg#color=xam', // Chấm Bi Ghi Xám
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_13.jpg#color=hong-dat', // Chấm Bi Hồng Đất
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-cham-bi-700k/nichambi_14.jpg#color=nau',
  ];

  const niChamBiDesc = `Bộ chăn ga gối nỉ nhung chần bông họa tiết chấm bi Polka Dot ấm áp mùa đông giá 700.000đ. Chất vải nỉ nhung cao cấp đanh sợi, giữ nhiệt vượt trội, bề mặt chần bông êm ái xốp mịn.
Bộ chăn ga 4 món bao gồm:
▪ 01 Chăn chần bông dày dặn (2m x 2m2)
▪ 01 Ga chần phủ freesize 
▪ 02 Vỏ gối đầu 48*74cm
<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong"]-->`;

  await supabase.from('products').update({
    cover_image: niChamBiImages[0].split('#')[0],
    images: niChamBiImages,
    colors: ['nau', 'vang-nhat', 'xanh-reu', 'be', 'xam', 'hong-dat'],
    description: niChamBiDesc,
  }).eq('id', 'SET4_NI_CHAM_BI_700K');
  console.log('  ✓ SET4_NI_CHAM_BI_700K: Chuyển về chọn màu đổi ảnh (tag #color)');

  // 2.5. SET350 (Set ga thun lạnh CEELING)
  const thunLanh350Images = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_01.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_02.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_04.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_05.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_06.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_07.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_08.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-thunlanh-350k/thunlanh_09.jpg#color=trang',
  ];

  const thunLanh350Desc = `Set ga chun và 2 vỏ gối chất liệu thun lạnh Tencel Ice Silk cao cấp thương hiệu CEELING giá 350.000đ. Bề mặt siêu mềm mịn, mát lạnh tức thì ngay khi chạm vào, kháng khuẩn tự nhiên. Tông màu trơn thanh lịch, phù hợp với mọi phong cách phòng ngủ hiện đại.
Trọn bộ gồm:
- 1 Ga chun thun lạnh Tencel (vừa đệm dày tới 20cm)
- 2 Vỏ gối nằm thun lạnh (45x65cm)
<!--cats:["set-3-mon","chat-lieu-lanh","mau-tron"]-->`;

  await supabase.from('products').update({
    cover_image: thunLanh350Images[0].split('#')[0],
    images: thunLanh350Images,
    colors: ['xam', 'xanh-duong', 'xanh-reu', 'hong-dat', 'vang-nhat', 'nau', 'be', 'trang'],
    description: thunLanh350Desc,
  }).eq('id', 'SET350');
  console.log('  ✓ SET350: Chuyển về chọn màu đổi ảnh (tag #color)');

  // 2.6. SET165_TRON (Set 3 món đũi màu trơn)
  const tron165Images = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/004_ke_soc_ghi_xam_dui_xuoc.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/019_tim_khoai_mon_tron_dui.jpg#color=tim-khoi',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/023_sao_nho_tron_hong_phan.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/090_chan_xam_ghi_cham_sao.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/102_chan_dui_moc_nau_be_cham_bi.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/109_chong_cuon_vai_dui_pastel.jpg#color=xanh-duong',
  ];

  const tron165Desc = `Bộ chăn ga gối đũi cotton tự nhiên 3 món Màu Trơn Tối Giản Nhà Có Mùi Nắng giá 165.000đ. Chất liệu đũi mộc tự nhiên thoáng khí, thấm hút mồ hôi cực tốt, tạo cảm giác mềm mại mát mẻ cho giấc ngủ thư thái.
Trọn bộ 3 món bao gồm:
- 1 Ga chun bọc đệm theo kích thước (vừa đệm dày tới 15cm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
<!--cats:["set-3-mon","chat-lieu-dui","mau-tron"]-->`;

  await supabase.from('products').update({
    cover_image: tron165Images[0].split('#')[0],
    images: tron165Images,
    colors: ['xam', 'tim-khoi', 'hong-dat', 'nau', 'be', 'xanh-duong'],
    description: tron165Desc,
  }).eq('id', 'SET165_TRON');
  console.log('  ✓ SET165_TRON: Chuyển về chọn màu đổi ảnh (tag #color)');

  // 2.7. SET280 (Set 3 món nỉ lông chuột Pureloom)
  const ni280Images = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_01.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_02.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_03.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_04.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_05.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_06.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_07.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-280k/set3_ni_08.jpg#color=tim-khoi',
  ];

  const ni280Desc = `Set 3 món chăn ga gối chất liệu nỉ lông chuột cao cấp thương hiệu Pureloom giá 280.000đ. Mềm mịn như nhung, giữ ấm cực tốt, không xù lông khi giặt máy. Phù hợp thời tiết se lạnh mùa thu đông.
Trọn bộ gồm:
- 1 Ga chun nỉ lông chuột bọc đệm (vừa đệm dày tới 20cm)
- 2 Vỏ gối nằm nỉ lông chuột (45x65cm)
<!--cats:["set-3-mon","chat-lieu-ni"]-->`;

  await supabase.from('products').update({
    cover_image: ni280Images[0].split('#')[0],
    images: ni280Images,
    colors: ['be', 'nau', 'xam', 'xanh-reu', 'hong-dat', 'xanh-duong', 'vang-nhat', 'tim-khoi'],
    description: ni280Desc,
  }).eq('id', 'SET280');
  console.log('  ✓ SET280: Chuyển về chọn màu đổi ảnh (tag #color)');

  // 2.8. SET_NHAP_NI_280K
  const nhapNiImages = [
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_01.jpg#color=be',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_02.jpg#color=nau',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_03.jpg#color=xam',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_04.jpg#color=xanh-reu',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_05.jpg#color=hong-dat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_06.jpg#color=xanh-duong',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_07.jpg#color=vang-nhat',
    'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set-nhap-ve/nhap_08.jpg#color=tim-khoi',
  ];

  const nhapNiDesc = `Set 3 món chăn ga nỉ nhung cao cấp giữ nhiệt mùa đông giá 280.000đ. Chất liệu nỉ lông dày dặn, đanh sợi, êm ái giữ ấm tức thì khi nằm xuống.
Trọn bộ 3 món bao gồm:
- 1 Ga chun nỉ nhung cao cấp
- 2 Vỏ gối nằm đồng bộ (45x65cm)
<!--cats:["set-3-mon","chat-lieu-ni"]-->`;

  await supabase.from('products').update({
    cover_image: nhapNiImages[0].split('#')[0],
    images: nhapNiImages,
    colors: ['be', 'nau', 'xam', 'xanh-reu', 'hong-dat', 'xanh-duong', 'vang-nhat', 'tim-khoi'],
    description: nhapNiDesc,
  }).eq('id', 'SET_NHAP_NI_280K');
  console.log('  ✓ SET_NHAP_NI_280K: Chuyển về chọn màu đổi ảnh (tag #color)');

  console.log('\n=== 3. CHUẨN HÓA SẢN PHẨM CHIA THEO HỌA TIẾT (PATTERN-BASED) ===');
  console.log('-> Có tên họa tiết rõ ràng, chuẩn ảnh, bấm là đổi ảnh chính xác!');

  // 3.1. SET380_HINHTHU & SET380_HOAKE (Fix undefined colorId)
  const { data: p380HinhThu } = await supabase.from('products').select('*').eq('id', 'SET380_HINHTHU').single();
  if (p380HinhThu) {
    const match = p380HinhThu.description.match(/<!--vars:(.*?)-->/);
    if (match) {
      const vars = JSON.parse(match[1]);
      const fixedVars = vars.map((v, i) => ({
        label: v.label.replace(/^Mẫu \d+\s*-\s*/, ''),
        image: v.image,
        colorId: ['hong-dat', 'tim-khoi', 'be', 'nau', 'vang-nhat', 'xanh-duong', 'xanh-mint', 'xam'][i % 8],
      }));
      const newDesc = p380HinhThu.description
        .replace(/<!--vars:.*?-->/, `<!--vars:${JSON.stringify(fixedVars)}-->`)
        .replace(/"mua-dong",?/g, '');
      await supabase.from('products').update({
        description: newDesc,
        colors: ['hong-dat', 'tim-khoi', 'be', 'nau', 'vang-nhat', 'xanh-duong', 'xanh-mint', 'xam'],
      }).eq('id', 'SET380_HINHTHU');
      console.log('  ✓ SET380_HINHTHU: Sửa nhãn họa tiết và gắn mã màu chuẩn');
    }
  }

  const { data: p380HoaKe } = await supabase.from('products').select('*').eq('id', 'SET380_HOAKE').single();
  if (p380HoaKe) {
    const match = p380HoaKe.description.match(/<!--vars:(.*?)-->/);
    if (match) {
      const vars = JSON.parse(match[1]);
      const fixedVars = vars.map((v, i) => ({
        label: v.label.replace(/^Mẫu \d+\s*-\s*/, ''),
        image: v.image,
        colorId: ['vang-nhat', 'vang', 'xanh-mint', 'xam', 'be', 'hong-dat', 'nau', 'xanh-duong'][i % 8],
      }));
      const newDesc = p380HoaKe.description
        .replace(/<!--vars:.*?-->/, `<!--vars:${JSON.stringify(fixedVars)}-->`)
        .replace(/"mua-dong",?/g, '');
      await supabase.from('products').update({
        description: newDesc,
        colors: ['vang-nhat', 'vang', 'xanh-mint', 'xam', 'be', 'hong-dat', 'nau', 'xanh-duong'],
      }).eq('id', 'SET380_HOAKE');
      console.log('  ✓ SET380_HOAKE: Sửa nhãn họa tiết và gắn mã màu chuẩn');
    }
  }

  console.log('\n=== TOÀN BỘ DANH MỤC VÀ SẢN PHẨM ĐÃ ĐƯỢC CHUẨN HÓA XONG! ===');
}

run().catch(err => {
  console.error('Lỗi chuẩn hóa:', err);
  process.exit(1);
});
