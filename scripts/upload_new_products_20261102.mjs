/**
 * scripts/upload_new_products_20261102.mjs
 * 
 * Upload images and add 6 new products added on 2026-11-02:
 * 1. SET4_DUI_TRANG_370K: Set 4 món cotton đũi trắng khách sạn Hàn Quốc 370k (6 ảnh)
 * 2. SET4_DUI_TRON_350K: Set 4 món cotton đũi màu trơn Pastel tối giản 350k (10 ảnh)
 * 3. SET4_DUI_REN_450K: Set 4 món cotton đũi ren vibe Hàn công chúa 450k (50 ảnh)
 * 4. SET4_NI_NHUNG_399K: Set 4 món chăn ga gối nỉ nhung tuyết ấm áp mùa đông 399k (26 ảnh)
 * 5. SET3_BINGBONG_350K: Set 3 món ga gối chần bông BingBong cao cấp sale 350k (50 ảnh)
 * 6. LE_CHAN_BINGBONG_300K: Chăn hè thun chần bông BingBong cao cấp 300k (16 ảnh)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadImage(localPath, storagePath) {
  if (!fs.existsSync(localPath)) return null;
  const buffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const { error } = await supabase.storage
    .from('product-images')
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) {
    console.error(`  ❌ Lỗi upload ${storagePath}: ${error.message}`);
    return null;
  }
  const { data } = supabase.storage.from('product-images').getPublicUrl(storagePath);
  return data.publicUrl;
}

async function uploadFolder(localDir, storagePrefix) {
  const files = fs.readdirSync(localDir)
    .filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'))
    .sort();
  console.log(`Uploading ${files.length} images from ${localDir} -> ${storagePrefix}/...`);
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const p = path.join(localDir, f);
    const ext = path.extname(f).toLowerCase();
    const storagePath = `${storagePrefix}/${String(i + 1).padStart(2, '0')}${ext}`;
    const url = await uploadImage(p, storagePath);
    if (url) urls.push({ originalFile: f, url });
  }
  return urls;
}

async function main() {
  console.log('🚀 Bắt đầu thêm 6 sản phẩm mới vào Supabase...\n');

  // =========================================================================
  // 1. SET4_DUI_TRANG_370K (6 ảnh)
  // =========================================================================
  const dirTrang = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món đũi hàn 370');
  const urlsTrang = await uploadFolder(dirTrang, 'set4-dui-trang-370k');

  const prodTrang = {
    id: 'SET4_DUI_TRANG_370K',
    slug: 'set-4-mon-chan-ga-cotton-dui-trang-tinh-khoi-vibe-han-370k',
    name: 'Set 4 món chăn ga gối cotton đũi trắng tinh khôi vibe Hàn Quốc',
    category_id: 'set-4-mon',
    price: 370000,
    currency: 'VND',
    type: 'combo',
    colors: ['trang', 'be'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm màu trắng', quantity: 1, note: 'Vừa đệm dày tới 20cm hoặc may theo yêu cầu' },
      { name: 'Vỏ chăn kéo khóa lồng ruột màu trắng', quantity: 1, note: 'Kích thước tiêu chuẩn 2m x 2m2' },
      { name: 'Vỏ gối nằm màu trắng đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga gối cotton đũi màu trắng tinh khôi phong cách khách sạn 5 sao và căn hộ cao cấp Hàn Quốc giá 370.000đ. Chất liệu vải cotton đũi mềm mát, bề mặt mộc tự nhiên thoáng khí, thấm hút mồ hôi tối đa mang lại cảm giác thư thái tuyệt đối cho giấc ngủ.\nTrọn bộ 4 món gồm:\n- 1 Ga chun bọc đệm trắng tinh khôi (vừa đệm dày tới 20cm hoặc may theo yêu cầu)\n- 1 Vỏ chăn kéo khóa lồng ruột màu trắng (2m x 2m2)\n- 2 Vỏ gối nằm đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-dui","mau-tron"]-->\n<!--vars:${JSON.stringify(urlsTrang.map((u, i) => ({
      label: `Góc chụp ${String(i + 1).padStart(2, '0')} - Trắng tinh khôi`,
      image: u.url,
      colorId: 'trang'
    })))}-->`,
    images: urlsTrang.map(u => `${u.url}#color=trang`),
    cover_image: urlsTrang[0]?.url || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodTrang, { onConflict: 'id' });
  console.log(`✓ [1/6] Đã thêm ${prodTrang.id} (${urlsTrang.length} ảnh)`);

  // =========================================================================
  // 2. SET4_DUI_TRON_350K (10 ảnh)
  // =========================================================================
  const dirTron = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món trơn 350');
  const urlsTron = await uploadFolder(dirTron, 'set4-dui-tron-350k');

  const tronColorMap = [
    { name: 'Xanh rêu mộc Bắc Âu', colorId: 'xanh-la' },
    { name: 'Xanh dương pastel dịu mát', colorId: 'xanh-duong' },
    { name: 'Tím than đậm sang trọng', colorId: 'tim' },
    { name: 'Ghi xám khói tối giản', colorId: 'xam' },
    { name: 'Be ghi yến mạch thanh lịch', colorId: 'be' },
    { name: 'Hồng phấn baby ngọt ngào', colorId: 'hong' },
    { name: 'Tím lavender pastel lãng mạn', colorId: 'tim' },
    { name: 'Vàng bơ kem ấm áp', colorId: 'vang' },
    { name: 'Nâu cam đất mộc mạc', colorId: 'nau' },
    { name: 'Hồng đất pastel tinh tế', colorId: 'hong' }
  ];

  const varsTron = urlsTron.map((u, i) => ({
    label: tronColorMap[i]?.name || `Màu trơn ${i + 1}`,
    image: u.url,
    colorId: tronColorMap[i]?.colorId || 'be'
  }));

  const prodTron = {
    id: 'SET4_DUI_TRON_350K',
    slug: 'set-4-mon-chan-ga-cotton-dui-mau-tron-pastel-350k',
    name: 'Set 4 món chăn ga gối cotton đũi màu trơn Pastel tối giản',
    category_id: 'set-4-mon',
    price: 350000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'hong', 'vang', 'xanh-duong', 'xanh-la', 'tim', 'xam', 'nau'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm màu trơn', quantity: 1, note: 'Vừa đệm dày tới 20cm hoặc may theo yêu cầu' },
      { name: 'Vỏ chăn kéo khóa lồng ruột', quantity: 1, note: 'Kích thước tiêu chuẩn 2m x 2m2' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga gối cotton đũi màu trơn tối giản phong cách Bắc Âu và Nhật Bản giá 350.000đ. Chất liệu đũi tự nhiên êm mềm, thoáng khí mát mẻ cho cả 4 mùa. Bảng 10 tông màu trơn pastel thanh lịch, hiện đại và rất dễ decor.\nTrọn bộ 4 món gồm:\n- 1 Ga chun bọc đệm theo kích thước (vừa đệm dày tới 20cm)\n- 1 Vỏ chăn kéo khóa lồng ruột (2m x 2m2)\n- 2 Vỏ gối nằm đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-dui","mau-tron"]-->\n<!--vars:${JSON.stringify(varsTron)}-->`,
    images: urlsTron.map((u, i) => `${u.url}#color=${tronColorMap[i]?.colorId || 'be'}`),
    cover_image: urlsTron[7]?.url || urlsTron[0]?.url, // Vàng bơ kem ấm áp làm cover
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodTron, { onConflict: 'id' });
  console.log(`✓ [2/6] Đã thêm ${prodTron.id} (${urlsTron.length} ảnh)`);

  // =========================================================================
  // 3. SET4_DUI_REN_450K (50 ảnh)
  // =========================================================================
  const dirDuiRen = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món đũi ren 02:11 450k');
  const urlsDuiRen = await uploadFolder(dirDuiRen, 'set4-dui-ren-450k');

  const varsDuiRen = urlsDuiRen.map((u, i) => {
    // Determine color based on index or pattern
    let cId = 'hong';
    if ([1, 10, 11, 23, 31, 32].includes(i)) cId = 'xanh-duong';
    else if ([6, 12, 13, 24, 33, 40].includes(i)) cId = 'xanh-la';
    else if ([2, 9, 14, 18, 19, 20].includes(i)) cId = 'tim';
    else if ([7, 16, 25, 34, 41].includes(i)) cId = 'vang';
    else if ([4, 8, 17, 26, 35, 42].includes(i)) cId = 'be';
    return {
      label: `Mẫu ${String(i + 1).padStart(2, '0')} - Đũi ren hoa nhí Vibe Hàn`,
      image: u.url,
      colorId: cId
    };
  });

  const prodDuiRen = {
    id: 'SET4_DUI_REN_450K',
    slug: 'set-4-mon-chan-ga-cotton-dui-vien-ren-vibe-han-cong-chua-450k',
    name: 'Set 4 món chăn ga gối cotton đũi viền ren vibe Hàn công chúa',
    category_id: 'set-4-mon',
    price: 450000,
    currency: 'VND',
    type: 'combo',
    colors: ['hong', 'be', 'tim', 'vang', 'xanh-duong', 'xanh-la', 'trang'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm theo kích thước', quantity: 1, note: 'Vừa đệm dày tới 20cm hoặc may theo yêu cầu' },
      { name: 'Vỏ chăn kéo khóa có viền ren mềm mại', quantity: 1, note: 'Kích thước tiêu chuẩn 2m x 2m2' },
      { name: 'Vỏ gối nằm viền ren đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `🌸 Ơi xinh quáaa… nhìn là muốn nằm thử liền luôn á 🥺💕

Bộ đũi ren vibe Hàn này đúng kiểu “nhẹ nhàng nhưng gây thương nhớ” ✨
Hoa nhí nhỏ xíu xiu + viền ren mềm mại, trải lên là thấy phòng dịu hẳn đi luôn 🌿

Chất đũi mịn 🌾
– Mềm mát, thoáng, nằm cực kỳ dễ chịu
– Bề mặt hơi nhăn nhẹ đúng kiểu vintage, càng nhìn càng mê

Điểm yêu nhất là phần ren viền 🎀
– Nhẹ nhàng, xinh xắn, không hề bị già
– Lên ảnh thì xinh, ngoài đời còn xinh hơn nữa luôn á 😭💕

💤 Set 4 món gồm:
🛏 1 ga chun bọc đệm theo kích thước
🛌 1 vỏ chăn kéo khóa lồng ruột có viền ren (2m x 2m2)
💤 2 vỏ gối viền ren đồng bộ (45x65cm)

👉 Bé này hợp phòng sáng sáng, decor kiểu Hàn nhẹ nhàng – trải lên là mood “công chúa ngủ trong nắng” liền luôn 🌷✨
<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-hoa-nhi","hoa-tiet-de-thuong"]-->
<!--vars:${JSON.stringify(varsDuiRen)}-->`,
    images: urlsDuiRen.map((u, i) => `${u.url}#color=${varsDuiRen[i].colorId}`),
    cover_image: urlsDuiRen[0]?.url || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodDuiRen, { onConflict: 'id' });
  console.log(`✓ [3/6] Đã thêm ${prodDuiRen.id} (${urlsDuiRen.length} ảnh)`);

  // =========================================================================
  // 4. SET4_NI_NHUNG_399K (26 ảnh)
  // =========================================================================
  const dirNiNhung = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món 399k 02:11');
  const urlsNiNhung = await uploadFolder(dirNiNhung, 'set4-ni-nhung-399k');

  const varsNiNhung = urlsNiNhung.map((u, i) => {
    let cId = 'hong';
    if ([1, 5, 18].includes(i)) cId = 'xanh-duong';
    else if ([3, 4, 25].includes(i)) cId = 'xanh-la';
    else if ([6, 7, 24].includes(i)) cId = 'tim';
    else if ([8, 11, 13, 23].includes(i)) cId = 'nau';
    else if ([9, 12, 14, 19, 21].includes(i)) cId = 'be';
    else if ([15, 20].includes(i)) cId = 'xam';
    else if ([17].includes(i)) cId = 'vang';
    return {
      label: `Mẫu ${String(i + 1).padStart(2, '0')} - Nỉ nhung tuyết ấm áp`,
      image: u.url,
      colorId: cId
    };
  });

  const prodNiNhung = {
    id: 'SET4_NI_NHUNG_399K',
    slug: 'set-4-mon-chan-ga-goi-ni-nhung-tuyet-am-ap-mua-dong-399k',
    name: 'Set 4 món chăn ga gối nỉ nhung tuyết ấm áp mùa đông',
    category_id: 'set-4-mon',
    price: 399000,
    currency: 'VND',
    type: 'combo',
    colors: ['hong', 'be', 'nau', 'tim', 'xanh-duong', 'xanh-la', 'xam', 'vang'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun nỉ nhung bọc đệm', quantity: 1, note: 'Vừa đệm dày tới 20cm hoặc may theo yêu cầu' },
      { name: 'Vỏ chăn nỉ nhung kéo khóa lồng ruột', quantity: 1, note: 'Kích thước tiêu chuẩn 2m x 2m2' },
      { name: 'Vỏ gối nằm nỉ nhung đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga gối nỉ nhung tuyết lông mịn cao cấp đón mùa thu đông giá 399.000đ. Chất liệu sợi nỉ tuyết siêu êm ái, chạm vào là ấm liền, giữ nhiệt cực nhanh và thoáng khí không gây bí lưng. Đa dạng họa tiết đáng yêu: gấu teddy, cún con snoopy, chấm bi pastel, kẻ caro và hoa nhí vintage.\nTrọn bộ 4 món gồm:\n- 1 Ga chun nỉ nhung bọc đệm theo kích thước\n- 1 Vỏ chăn nỉ nhung lồng ruột (2m x 2m2)\n- 2 Vỏ gối nằm nỉ nhung đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong","hoa-tiet-hoa-nhi","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsNiNhung)}-->`,
    images: urlsNiNhung.map((u, i) => `${u.url}#color=${varsNiNhung[i].colorId}`),
    cover_image: urlsNiNhung[0]?.url || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodNiNhung, { onConflict: 'id' });
  console.log(`✓ [4/6] Đã thêm ${prodNiNhung.id} (${urlsNiNhung.length} ảnh)`);

  // =========================================================================
  // 5. SET3_BINGBONG_350K (50 ảnh)
  // =========================================================================
  const dirGaBingbong = path.resolve(rootDir, 'image', 'Set 3 món ga + 2 vỏ gối', 'Set ga gối BingBong 350k - Trần cả ga cả gối đẹp đẽ rồi mấy màu này thì sale còn 350');
  const urlsGaBingbong = await uploadFolder(dirGaBingbong, 'set3-ga-bingbong-350k');

  const varsGaBingbong = urlsGaBingbong.map((u, i) => {
    let cId = 'be';
    if ([4, 11, 14, 18, 19, 31, 32].includes(i)) cId = 'hong';
    else if ([9, 13, 21, 22, 23, 24, 25, 33, 44, 45].includes(i)) cId = 'xanh-duong';
    else if ([15, 17, 34, 46, 47, 48, 49].includes(i)) cId = 'xam';
    else if ([16, 26, 27, 28, 30].includes(i)) cId = 'nau';
    return {
      label: `Mẫu ${String(i + 1).padStart(2, '0')} - Ga gối trần bông BingBong`,
      image: u.url,
      colorId: cId
    };
  });

  const prodGaBingbong = {
    id: 'SET3_BINGBONG_350K',
    slug: 'set-3-mon-ga-goi-chan-bong-bingbong-cao-cap-sale-350k',
    name: 'Set 3 món ga gối chần bông BingBong cao cấp (Sale 350k)',
    category_id: 'set-3-mon',
    price: 350000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'hong', 'xanh-duong', 'xam', 'nau'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun chần bông đa kim vi tính', quantity: 1, note: 'Trần bông cả ga, vừa đệm dày tới 25cm' },
      { name: 'Vỏ gối nằm chần bông đồng bộ', quantity: 2, note: 'Trần bông cả vỏ gối, kích thước 45x65cm' }
    ],
    description: `Set 3 món ga gối thương hiệu BingBong cao cấp chần bông đa kim sắc sảo từng đường chỉ cả ga lẫn gối, đợt này sale đồng giá 350.000đ. Chất liệu thun mát lạnh mịn màng, ruột chần bông kháng khuẩn dày dặn êm ái, giặt máy thoải mái không lo xô bông hay vón cục.\nTrọn bộ 3 món gồm:\n- 1 Ga chun chần bông bọc đệm êm ái (vừa đệm dày tới 25cm)\n- 2 Vỏ gối nằm chần bông đồng bộ (45x65cm)\n*Lưu ý: Dòng BingBong có bán chăn thun chần bông lẻ 300k cùng họa tiết để ghép thành trọn bộ (xem thêm link Chăn hè BingBong 300k).\n<!--cats:["set-3-mon","chat-lieu-lanh","hoa-tiet-hoa-nhi","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsGaBingbong)}-->`,
    images: urlsGaBingbong.map((u, i) => `${u.url}#color=${varsGaBingbong[i].colorId}`),
    cover_image: urlsGaBingbong[8]?.url || urlsGaBingbong[0]?.url, // Chọn ảnh giường trải mẫu đẹp làm cover
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodGaBingbong, { onConflict: 'id' });
  console.log(`✓ [5/6] Đã thêm ${prodGaBingbong.id} (${urlsGaBingbong.length} ảnh)`);

  // =========================================================================
  // 6. LE_CHAN_BINGBONG_300K (16 ảnh)
  // =========================================================================
  const dirChanBingbong = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn thun trânf BingBong 300 - có bán cả set ga gối(link voà phần mô tả) ');
  const urlsChanBingbong = await uploadFolder(dirChanBingbong, 'chan-thun-bingbong-300k');

  const varsChanBingbong = urlsChanBingbong.map((u, i) => ({
    label: `Mẫu chăn ${String(i + 1).padStart(2, '0')} - Chăn hè chần bông BingBong`,
    image: u.url,
    colorId: [0, 1, 3, 4, 10, 11].includes(i) ? 'hong' : ([2, 5, 8].includes(i) ? 'be' : 'xanh-duong')
  }));

  const prodChanBingbong = {
    id: 'LE_CHAN_BINGBONG_300K',
    slug: 'chan-he-thun-chan-bong-bingbong-cao-cap-300k',
    name: 'Chăn hè thun chần bông BingBong cao cấp',
    category_id: 'mon-le',
    price: 300000,
    currency: 'VND',
    type: 'single',
    colors: ['hong', 'be', 'xanh-duong'],
    sizes: ['1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Chăn hè thun chần bông kháng khuẩn BingBong', quantity: 1, note: 'Kích thước tiêu chuẩn 2m x 2m2' }
    ],
    description: `Chăn hè thun chần bông BingBong cao cấp mềm mịn mát lạnh giá 300.000đ. Ruột chăn chần bông siêu nhẹ, thoáng khí, đắp mát mùa hè và êm ấm mùa thu đông. Đường chần vi tính đa kim chắc chắn, giặt máy thoải mái không lo vón cục.\n*Gợi ý: Shop có bán trọn bộ kèm Set ga gối chần bông BingBong 350k cùng hoa văn đồng điệu (xem thêm link Set 3 món BingBong 350k).\n<!--cats:["mon-le","chat-lieu-lanh","hoa-tiet-hoa-nhi"]-->\n<!--vars:${JSON.stringify(varsChanBingbong)}-->`,
    images: urlsChanBingbong.map((u, i) => `${u.url}#color=${varsChanBingbong[i].colorId}`),
    cover_image: urlsChanBingbong[7]?.url || urlsChanBingbong[0]?.url,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodChanBingbong, { onConflict: 'id' });
  console.log(`✓ [6/6] Đã thêm ${prodChanBingbong.id} (${urlsChanBingbong.length} ảnh)`);

  console.log('\n🎉 ĐÃ THÊM THÀNH CÔNG TẤT CẢ 6 SẢN PHẨM MỚI VÀO SUPABASE!');
}

main().catch(console.error);
