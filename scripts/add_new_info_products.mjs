/**
 * scripts/add_new_info_products.mjs
 * Script thêm 5 sản phẩm mới từ 5 thư mục có file info:
 * 1. image/Lẻ/Vỏ chăn nỉ lông thỏ 300k  (18 ảnh) -> 1 sản phẩm
 * 2. image/Lẻ/Vỏ chăn thun lạnh (7 ảnh) -> 1 sản phẩm
 * 3. image/Set 4 món có chăn/Set 4 Vải phi lụa (10 ảnh) -> 1 sản phẩm
 * 4. image/Set 4 món có chăn/Set 4 món nỉ chấm bi (14 ảnh) -> 1 sản phẩm
 * 5. image/Set 4 món có chăn/Set 4 vải sợi bông xốp 400k (8 ảnh) -> 1 sản phẩm
 *
 * Đồng thời:
 * - Cập nhật bảng categories để đảm bảo KHÔNG CÓ category nào bị rỗng (0 sản phẩm)
 * - Tự động upload ảnh lên Supabase Storage bucket product-images
 * - Gắn multi-category và Shopee-style variants <!--vars:[...]--> cho mỗi sản phẩm
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

// Upload ảnh lên Supabase Storage
async function uploadImage(localPath, storagePath) {
  if (!fs.existsSync(localPath)) {
    console.warn(`  ⚠️ File không tồn tại: ${localPath}`);
    return null;
  }
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

// Danh mục chuẩn đầy đủ
const CATEGORIES = [
  { id: 'set-3-mon', name: 'Set 3 món (Ga + 2 gối)', description: 'Bộ ga chun bọc đệm + 2 vỏ gối nằm đồng bộ', display_order: 1 },
  { id: 'set-4-mon', name: 'Set 4 món (Có vỏ chăn)', description: 'Bộ ga chun + 2 vỏ gối + vỏ chăn hè thu', display_order: 2 },
  { id: 'mon-le', name: 'Vỏ chăn & Món lẻ', description: 'Vỏ chăn nỉ lông, chăn hè làm mát tách lẻ', display_order: 3 },
  { id: 'chat-lieu-dui', name: 'Vải đũi cotton', description: 'Chất liệu đũi tự nhiên mộc mạc, thoáng khí êm dịu', display_order: 4 },
  { id: 'chat-lieu-ni', name: 'Vải nỉ lông mùa đông', description: 'Nỉ lông chuột, nỉ lông thỏ ấm áp giữ nhiệt cực tốt', display_order: 5 },
  { id: 'chat-lieu-lanh', name: 'Thun lạnh Tencel', description: 'Thun lạnh Ice Silk mát lạnh mịn màng', display_order: 6 },
  { id: 'chat-lieu-lua', name: 'Lụa & Phi lụa cao cấp', description: 'Phi lụa thêu viền ren quý phái, mềm mại', display_order: 7 },
  { id: 'hoa-tiet-ke', name: 'Kẻ caro & sọc', description: 'Họa tiết kẻ caro, kẻ sọc hiện đại Hàn Quốc', display_order: 8 },
  { id: 'hoa-tiet-hoa-nhi', name: 'Hoa nhí Vintage', description: 'Họa tiết hoa nhí, hoa cỏ mùa hạ nhẹ nhàng', display_order: 9 },
  { id: 'hoa-tiet-de-thuong', name: 'Hình thú & hoạt hình', description: 'Họa tiết gấu, thỏ, chấm bi, hoạt hình đáng yêu', display_order: 10 },
  { id: 'mau-tron', name: 'Màu trơn tối giản', description: 'Tông màu trơn sang trọng, hiện đại tối giản', display_order: 11 },
  { id: 'mua-dong', name: 'Ấm áp mùa đông', description: 'Bộ chăn ga nỉ dày dặn đón mùa lạnh', display_order: 12 },
];

async function main() {
  console.log('🚀 Bắt đầu thêm 5 sản phẩm mới từ các folder có file info...');

  // 1. Đồng bộ bảng categories
  console.log('\n1. Cập nhật bảng categories...');
  for (const cat of CATEGORIES) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'id' });
    if (error) {
      console.error(`  ❌ Lỗi cập nhật category ${cat.id}: ${error.message}`);
    } else {
      console.log(`  ✓ Danh mục: ${cat.id} - ${cat.name}`);
    }
  }

  // 2. Folder 1: Vỏ chăn nỉ lông thỏ 300k
  console.log('\n2. Xử lý Vỏ chăn nỉ lông thỏ 300k...');
  const dirNiTho = path.resolve(rootDir, 'image', 'Lẻ', 'Vỏ chăn nỉ lông thỏ 300k ');
  const filesNiTho = fs.readdirSync(dirNiTho).filter(f => f.toLowerCase().endsWith('.jpg'));
  const urlsNiTho = [];
  const varsNiTho = [];

  for (let i = 0; i < filesNiTho.length; i++) {
    const f = filesNiTho[i];
    const storagePath = `vo-chan-ni-tho-300k/nitho_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(path.join(dirNiTho, f), storagePath);
    if (url) {
      urlsNiTho.push(url);
      varsNiTho.push({
        label: `Mẫu ${String(i + 1).padStart(2, '0')}`,
        image: url,
        colorId: 'be'
      });
    }
  }

  const prodNiTho = {
    id: 'LE_CHAN_NI_THO_300K',
    slug: 'vo-chan-ni-long-tho-am-ap-thu-dong-300k',
    name: 'Vỏ chăn nỉ lông thỏ ấm áp thu đông',
    category_id: 'mon-le',
    price: 300000,
    currency: 'VND',
    type: 'single',
    colors: ['be', 'xam', 'hong-dat', 'xanh-duong'],
    sizes: ['2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Vỏ chăn nỉ lông thỏ 2 lớp', quantity: 1, note: 'Kích thước 2m x 2m2, có thể lồng thêm ruột hoặc dùng trực tiếp' }
    ],
    description: `Vỏ chăn nỉ lông thỏ ấm áp đón thu đông cực xinh xắn và mềm mại. Chất liệu lông thỏ êm mịn như mây, giữ nhiệt cực tốt, không xù lông rụng sợi khi giặt máy. Kích thước 2m x 2m2 có khóa kéo tiện lợi, có thể lồng thêm ruột bông vào mùa đại hàn hoặc dùng đắp trực tiếp mùa thu se lạnh.\n<!--cats:["mon-le","chat-lieu-ni","mua-dong","hoa-tiet-de-thuong"]-->\n<!--vars:${JSON.stringify(varsNiTho)}-->`,
    images: urlsNiTho,
    cover_image: urlsNiTho[0] || null,
    featured: true,
    published: true,
  };

  const { error: err1 } = await supabase.from('products').upsert(prodNiTho, { onConflict: 'id' });
  console.log(err1 ? `  ❌ Lỗi: ${err1.message}` : `  ✓ Thêm thành công ${prodNiTho.id} (${urlsNiTho.length} ảnh)`);

  // 3. Folder 2: Vỏ chăn thun lạnh
  console.log('\n3. Xử lý Chăn hè thun lạnh Tencel chần viền vi tính...');
  const dirThunLanh = path.resolve(rootDir, 'image', 'Lẻ', 'Vỏ chăn thun lạnh');
  const filesThunLanh = fs.readdirSync(dirThunLanh).filter(f => f.toLowerCase().endsWith('.jpg'));
  const urlsThunLanh = [];

  const labelsThunLanh = [
    { label: 'Xám Nhạt', colorId: 'xam' },
    { label: 'Hồng Cam Đào', colorId: 'hong-dat' },
    { label: 'Hồng Cheery', colorId: 'hong-dat' },
    { label: 'Xám Khói', colorId: 'xam' },
    { label: 'Xanh Cốm', colorId: 'xanh-mint' },
    { label: 'Xanh Blue', colorId: 'xanh-duong' },
    { label: 'Xám Đậm', colorId: 'xam' }
  ];

  const varsThunLanh = [];
  for (let i = 0; i < filesThunLanh.length; i++) {
    const f = filesThunLanh[i];
    const storagePath = `chan-he-thun-lanh-300k/thunlanh_chan_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(path.join(dirThunLanh, f), storagePath);
    if (url) {
      urlsThunLanh.push(url);
      const meta = labelsThunLanh[i] || { label: `Màu ${i + 1}`, colorId: 'xam' };
      varsThunLanh.push({
        label: `Mẫu ${String(i + 1).padStart(2, '0')} - ${meta.label}`,
        image: url,
        colorId: meta.colorId
      });
    }
  }

  const prodThunLanh = {
    id: 'LE_CHAN_THUN_LANH_300K',
    slug: 'chan-he-thun-lanh-tencel-ice-silk-chan-vien-300k',
    name: 'Chăn hè thun lạnh Tencel Ice Silk chần viền vi tính',
    category_id: 'mon-le',
    price: 300000,
    currency: 'VND',
    type: 'single',
    colors: ['xam', 'hong-dat', 'xanh-mint', 'xanh-duong'],
    sizes: ['2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Chăn hè thun lạnh Tencel viền vi tính', quantity: 1, note: 'Kích thước 2m x 2m2, ruột chần bông kháng khuẩn mỏng mát' }
    ],
    description: `Chăn hè thun lạnh Tencel Ice Silk cao cấp chần viền vi tính sang trọng. Bề mặt vải trơn mát lạnh tức thì ngay khi chạm vào da, công nghệ làm mát tản nhiệt độc quyền cho giấc ngủ hè sảng khoái mát lành. Viền chăn may mí đôi tỉ mỉ, độ bền cao, giặt máy thoải mái không xô lệch.\n<!--cats:["mon-le","chat-lieu-lanh","mau-tron"]-->\n<!--vars:${JSON.stringify(varsThunLanh)}-->`,
    images: urlsThunLanh,
    cover_image: urlsThunLanh[0] || null,
    featured: true,
    published: true,
  };

  const { error: err2 } = await supabase.from('products').upsert(prodThunLanh, { onConflict: 'id' });
  console.log(err2 ? `  ❌ Lỗi: ${err2.message}` : `  ✓ Thêm thành công ${prodThunLanh.id} (${urlsThunLanh.length} ảnh)`);

  // 4. Folder 3: Set 4 Vải phi lụa
  console.log('\n4. Xử lý Set 4 Vải phi lụa Romance Quilting 610k...');
  const dirPhiLua = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 Vải phi lụa');
  const filesPhiLua = fs.readdirSync(dirPhiLua).filter(f => f.toLowerCase().endsWith('.jpg'));
  const urlsPhiLua = [];
  const varsPhiLua = [];

  for (let i = 0; i < filesPhiLua.length; i++) {
    const f = filesPhiLua[i];
    const storagePath = `set4-phi-lua-610k/philua_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(path.join(dirPhiLua, f), storagePath);
    if (url) {
      urlsPhiLua.push(url);
      varsPhiLua.push({
        label: `Mẫu ${String(i + 1).padStart(2, '0')} - Romance Lụa ren`,
        image: url,
        colorId: 'be'
      });
    }
  }

  const prodPhiLua = {
    id: 'SET4_PHI_LUA_610K',
    slug: 'set-4-mon-chan-ga-phi-lua-romance-quilting-610k',
    name: 'Set 4 món chăn ga phi lụa Romance Quilting thêu viền ren',
    category_id: 'set-4-mon',
    price: 610000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'trang', 'xam'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Chăn hè chần bông viền ren Romance', quantity: 1, note: 'Chăn chần êm ái, bèo ren tinh xảo' },
      { name: 'Ga chần phủ freesize', quantity: 1, note: 'Phù hợp mọi kích thước nệm từ 1m6 đến 2m2' },
      { name: 'Vỏ gối đầu trần bông 48x74cm', quantity: 2, note: 'Bọc viền ren sang trọng' }
    ],
    description: `Mỗi một thiết kế lại như kể nên một câu chuyện riêng biệt, Romance Quilting mang trong mình hơi thở lãng mạn và êm dịu của buổi chiều hè khi những ánh nắng cuối ngày dịu dàng buông. Được hoàn thiện trên nền chất liệu vải phi lụa mềm mại, thoáng khí. Từng đường kim mũi chỉ được chăm chút tỉ mỉ, chăn ga chần bông êm ái đem lại những khoảnh khắc thư giãn tuyệt vời sau cả ngày dài làm việc. Tone màu nền nã thời thượng cùng điểm nhấn bèo ren bao quanh phần chăn ga gối tạo nên tổng thể nhẹ nhàng mà đầy lôi cuốn.\n<!--cats:["set-4-mon","chat-lieu-lua","mau-tron"]-->\n<!--vars:${JSON.stringify(varsPhiLua)}-->`,
    images: urlsPhiLua,
    cover_image: urlsPhiLua[0] || null,
    featured: true,
    published: true,
  };

  const { error: err3 } = await supabase.from('products').upsert(prodPhiLua, { onConflict: 'id' });
  console.log(err3 ? `  ❌ Lỗi: ${err3.message}` : `  ✓ Thêm thành công ${prodPhiLua.id} (${urlsPhiLua.length} ảnh)`);

  // 5. Folder 4: Set 4 món nỉ chấm bi 700k
  console.log('\n5. Xử lý Set 4 món nỉ chấm bi 700k...');
  const dirNiChamBi = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món nỉ chấm bi');
  const filesNiChamBi = fs.readdirSync(dirNiChamBi).filter(f => f.toLowerCase().endsWith('.jpg'));
  const urlsNiChamBi = [];
  const varsNiChamBi = [];

  for (let i = 0; i < filesNiChamBi.length; i++) {
    const f = filesNiChamBi[i];
    const storagePath = `set4-ni-cham-bi-700k/nichambi_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(path.join(dirNiChamBi, f), storagePath);
    if (url) {
      urlsNiChamBi.push(url);
      varsNiChamBi.push({
        label: `Mẫu ${String(i + 1).padStart(2, '0')} - Chấm bi nỉ nhung`,
        image: url,
        colorId: 'nau'
      });
    }
  }

  const prodNiChamBi = {
    id: 'SET4_NI_CHAM_BI_700K',
    slug: 'set-4-mon-chan-ga-goi-ni-nhung-cham-bi-polka-dot-700k',
    name: 'Set 4 món chăn ga gối nỉ nhung chấm bi Polka Dot cao cấp',
    category_id: 'set-4-mon',
    price: 700000,
    currency: 'VND',
    type: 'combo',
    colors: ['nau', 'xam', 'be', 'hong-dat'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Chăn chần nỉ nhung chấm bi', quantity: 1, note: 'Chần bông giữ nhiệt mùa đông cực ấm' },
      { name: 'Ga chần phủ freesize đồng bộ', quantity: 1, note: 'May phủ hoặc bo chun theo cỡ nệm' },
      { name: 'Vỏ gối đầu nỉ nhung 48x74cm', quantity: 2, note: 'Chất liệu nỉ nhung mềm mại' }
    ],
    description: `Set 4 món chăn ga gối nỉ nhung chấm bi Polka Dot ấm áp thu đông. Chất nỉ nhung dày dặn, lông mềm mượt êm ái như nhung tuyết, không bai xù hay tích điện. Họa tiết chấm bi retro mang vẻ đẹp trẻ trung, hiện đại cho phòng ngủ những ngày đông lạnh giá.\n<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong","mua-dong"]-->\n<!--vars:${JSON.stringify(varsNiChamBi)}-->`,
    images: urlsNiChamBi,
    cover_image: urlsNiChamBi[0] || null,
    featured: true,
    published: true,
  };

  const { error: err4 } = await supabase.from('products').upsert(prodNiChamBi, { onConflict: 'id' });
  console.log(err4 ? `  ❌ Lỗi: ${err4.message}` : `  ✓ Thêm thành công ${prodNiChamBi.id} (${urlsNiChamBi.length} ảnh)`);

  // 6. Folder 5: Set 4 vải sợi bông xốp 400k
  console.log('\n6. Xử lý Set 4 vải sợi bông xốp Puff Pastry 400k...');
  const dirBongXop = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 vải sợi bông xốp 400k');
  const filesBongXop = fs.readdirSync(dirBongXop).filter(f => f.toLowerCase().endsWith('.jpg'));
  const urlsBongXop = [];
  const varsBongXop = [];

  for (let i = 0; i < filesBongXop.length; i++) {
    const f = filesBongXop[i];
    const storagePath = `set4-bong-xop-400k/bongxop_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(path.join(dirBongXop, f), storagePath);
    if (url) {
      urlsBongXop.push(url);
      varsBongXop.push({
        label: `Mẫu ${String(i + 1).padStart(2, '0')} - Puff Pastry chấm bi`,
        image: url,
        colorId: 'xanh-duong'
      });
    }
  }

  const prodBongXop = {
    id: 'SET4_BONG_XOP_400K',
    slug: 'set-4-mon-chan-ga-cotton-dui-bong-xop-puff-pastry-400k',
    name: 'Set 4 món chăn ga cotton đũi bông xốp Puff Pastry chấm bi',
    category_id: 'set-4-mon',
    price: 400000,
    currency: 'VND',
    type: 'combo',
    colors: ['xanh-duong', 'nau', 'be', 'xam'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Vỏ chăn có khóa kéo Puff Pastry', quantity: 1, note: 'Kích thước tiêu chuẩn lồng ruột tiện lợi' },
      { name: 'Ga trải giường freesize', quantity: 1, note: 'Bo chun hoặc trải phủ theo yêu cầu' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: 'Kích thước 45x65cm viền răng cưa xinh xắn' }
    ],
    description: `Lấy cảm hứng từ chiếc bánh Puff Pastry kết cấu nhiều tầng đan xen bột và bơ, dòng chất liệu cotton đũi sợi bông xốp mới ra mắt với ưu điểm vượt trội: mềm mại xốp nhẹ, thoáng khí và giữ màu cực tốt. Họa tiết chấm bi Polka Dot bắt trend kết hợp viền ren răng cưa độc đáo tạo nên căn phòng ngủ xinh xắn phong cách Hàn Quốc.\n<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->\n<!--vars:${JSON.stringify(varsBongXop)}-->`,
    images: urlsBongXop,
    cover_image: urlsBongXop[0] || null,
    featured: true,
    published: true,
  };

  const { error: err5 } = await supabase.from('products').upsert(prodBongXop, { onConflict: 'id' });
  console.log(err5 ? `  ❌ Lỗi: ${err5.message}` : `  ✓ Thêm thành công ${prodBongXop.id} (${urlsBongXop.length} ảnh)`);

  // 7. Kiểm tra tổng kết và đếm sản phẩm trong từng category
  console.log('\n=============================================');
  console.log('📊 KIỂM TRA ĐỘ PHỦ DANH MỤC TRÊN TOÀN BỘ SẢN PHẨM:');
  const { data: allProds } = await supabase.from('products').select('id, name, category_id, description');
  const { data: allCats } = await supabase.from('categories').select('*').order('display_order');

  console.log(`Tổng số sản phẩm hiện có: ${allProds?.length}`);
  console.log(`Tổng số danh mục: ${allCats?.length}`);

  let emptyCount = 0;
  for (const cat of allCats || []) {
    const matchingProds = allProds?.filter(p => {
      if (p.category_id === cat.id) return true;
      const desc = p.description || '';
      const match = desc.match(/<!--cats:(.*?)-->/);
      if (match) {
        try {
          const cats = JSON.parse(match[1]);
          return Array.isArray(cats) && cats.includes(cat.id);
        } catch {
          return false;
        }
      }
      return false;
    });

    const count = matchingProds?.length || 0;
    const status = count > 0 ? `✓ ${count} sản phẩm` : '❌ RỖNG (0 SẢN PHẨM)';
    if (count === 0) emptyCount++;
    console.log(`- [${cat.id}] ${cat.name}: ${status}`);
  }

  if (emptyCount === 0) {
    console.log('\n🎉 TUYỆT VỜI: 100% DANH MỤC ĐỀU CÓ SẢN PHẨM! KHÔNG CÒN CATEGORY NÀO BỊ RỖNG!');
  } else {
    console.warn(`\n⚠️ CẢNH BÁO: Còn ${emptyCount} category chưa có sản phẩm!`);
  }
}

main().catch(console.error);
