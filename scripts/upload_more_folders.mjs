/**
 * scripts/upload_more_folders.mjs
 * Upload and create products for all additional photo folders:
 * 1. Set 4 món 370k cotton vibe hàn quốc (26 ảnh) -> 2 products (13 ảnh / product)
 * 2. Set 4 món gối ôm bingbong 240k (10 ảnh) -> 1 product
 * 3. Threads_Ch_n_ga_g__m__xinkk_iu_h_t_ph__1786502149 (20 ảnh) -> 1 product
 * 4. Threads___D__do_l__h_ng_em_t__nh_p_v___1786502524 (49 ảnh) -> 3 products (~16 ảnh / product)
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

async function main() {
  console.log('🚀 Bắt đầu thêm các sản phẩm từ các thư mục ảnh bổ sung...\n');

  // ==========================================
  // 1. Set 4 món 370k cotton vibe hàn quốc (26 ảnh -> 2 sản phẩm)
  // ==========================================
  const dir370 = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 mon 370k cotton vibe hàn quốc');
  const files370 = fs.readdirSync(dir370).filter(f => f.toLowerCase().endsWith('.jpg'));
  console.log(`1. Set 4 món 370k: Tìm thấy ${files370.length} ảnh`);

  const urls370 = [];
  for (let i = 0; i < files370.length; i++) {
    const p = path.join(dir370, files370[i]);
    const storagePath = `set4-cotton-370k/c370_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(p, storagePath);
    if (url) urls370.push(url);
  }

  // Tách 26 ảnh thành 2 link sản phẩm (13 mẫu/link)
  const group1_370 = urls370.slice(0, 13);
  const group2_370 = urls370.slice(13);

  const vars370_1 = group1_370.map((url, i) => ({
    label: `Mẫu ${String(i + 1).padStart(2, '0')} - Vibe Hàn Hoa nhí`,
    image: url,
    colorId: 'be'
  }));

  const prod370_1 = {
    id: 'SET370_HANQUOC_1',
    slug: 'set-4-mon-chan-ga-cotton-vibe-han-quoc-hoa-nhi-370k',
    name: 'Set 4 món chăn ga cotton vibe Hàn Quốc Hoa nhí & Vintage',
    category_id: 'set-4-mon',
    price: 370000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'hong-dat', 'xanh-mint', 'vang-nhat', 'trang'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun hoặc ga phủ bọc đệm', quantity: 1, note: 'Vừa đệm dày tới 20cm' },
      { name: 'Vỏ chăn kéo khóa lồng ruột', quantity: 1, note: '2m x 2m2' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga cotton phong cách Hàn Quốc tone hoa nhí vintage nhẹ nhàng, trẻ trung và ngọt ngào. Chất liệu vải cotton mềm mại, thoáng mát mùa hè và êm ấm mùa thu đông, tạo cảm giác thư giãn cho phòng ngủ ấm cúng.\n<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-hoa-nhi"]-->\n<!--vars:${JSON.stringify(vars370_1)}-->`,
    images: group1_370,
    cover_image: group1_370[0] || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prod370_1, { onConflict: 'id' });
  console.log(`  ✓ Đã thêm: ${prod370_1.id} (${group1_370.length} ảnh)`);

  const vars370_2 = group2_370.map((url, i) => ({
    label: `Mẫu ${String(i + 14).padStart(2, '0')} - Vibe Hàn Kẻ & Caro`,
    image: url,
    colorId: 'xanh-duong'
  }));

  const prod370_2 = {
    id: 'SET370_HANQUOC_2',
    slug: 'set-4-mon-chan-ga-cotton-vibe-han-quoc-ke-caro-370k',
    name: 'Set 4 món chăn ga cotton vibe Hàn Quốc Kẻ caro & Dễ thương',
    category_id: 'set-4-mon',
    price: 370000,
    currency: 'VND',
    type: 'combo',
    colors: ['xanh-duong', 'xam', 'be', 'nau'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun hoặc ga phủ bọc đệm', quantity: 1, note: 'Vừa đệm dày tới 20cm' },
      { name: 'Vỏ chăn kéo khóa lồng ruột', quantity: 1, note: '2m x 2m2' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga cotton vibe Hàn Quốc họa tiết kẻ caro phối tone hiện đại và các nhân vật dễ thương. Chất vải cotton bền màu, thấm hút tốt, giặt máy thoải mái không xù lông.\n<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-ke","hoa-tiet-de-thuong"]-->\n<!--vars:${JSON.stringify(vars370_2)}-->`,
    images: group2_370,
    cover_image: group2_370[0] || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prod370_2, { onConflict: 'id' });
  console.log(`  ✓ Đã thêm: ${prod370_2.id} (${group2_370.length} ảnh)`);

  // ==========================================
  // 2. Set 4 món gối ôm bingbong 240k (10 ảnh -> 1 sản phẩm)
  // ==========================================
  const dirBingbong = path.resolve(rootDir, 'image', 'Set 4 món gối ôm bingbong 240k');
  const filesBingbong = fs.readdirSync(dirBingbong).filter(f => f.toLowerCase().endsWith('.jpg'));
  console.log(`\n2. Set gối ôm BingBong 240k: Tìm thấy ${filesBingbong.length} ảnh`);

  const urlsBingbong = [];
  const varsBingbong = [];
  for (let i = 0; i < filesBingbong.length; i++) {
    const p = path.join(dirBingbong, filesBingbong[i]);
    const storagePath = `set-bingbong-240k/bb_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(p, storagePath);
    if (url) {
      urlsBingbong.push(url);
      varsBingbong.push({
        label: `Mẫu ${String(i + 1).padStart(2, '0')} - BingBong Cute`,
        image: url,
        colorId: 'hong-dat'
      });
    }
  }

  const prodBingbong = {
    id: 'SET4_BINGBONG_240K',
    slug: 'set-4-mon-chan-ga-goi-om-bingbong-240k',
    name: 'Set 4 món chăn ga kèm gối ôm BingBong đáng yêu cho bé',
    category_id: 'set-4-mon',
    price: 240000,
    currency: 'VND',
    type: 'combo',
    colors: ['hong-dat', 'vang-nhat', 'xanh-mint', 'be'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm', quantity: 1, note: 'Vừa nệm dày tới 15cm' },
      { name: 'Vỏ chăn hè hè thu', quantity: 1, note: 'Có khóa kéo lồng ruột' },
      { name: 'Vỏ gối nằm', quantity: 1, note: '45x65cm' },
      { name: 'Vỏ gối ôm BingBong', quantity: 1, note: 'Gối ôm tròn đáng yêu 35x100cm' }
    ],
    description: `Set 4 món chăn ga gối kèm gối ôm BingBong siêu dễ thương tone màu pastel kẹo ngọt. Chất vải đũi cotton mát mịn, êm ái, rất an toàn và dịu nhẹ cho làn da của bé và cả gia đình.\n<!--cats:["set-4-mon","chat-lieu-dui","hoa-tiet-de-thuong"]-->\n<!--vars:${JSON.stringify(varsBingbong)}-->`,
    images: urlsBingbong,
    cover_image: urlsBingbong[0] || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodBingbong, { onConflict: 'id' });
  console.log(`  ✓ Đã thêm: ${prodBingbong.id} (${urlsBingbong.length} ảnh)`);

  // ==========================================
  // 3. Threads_Ch_n_ga_g__m__xinkk_iu_h_t_ph__1786502149 (20 ảnh -> 1 sản phẩm)
  // ==========================================
  const dirXinkk = path.resolve(rootDir, 'image', 'Threads_Ch_n_ga_g__m__xinkk_iu_h_t_ph__1786502149');
  const filesXinkk = fs.readdirSync(dirXinkk).filter(f => f.toLowerCase().endsWith('.jpg'));
  console.log(`\n3. Threads Chăn ga xinh hạt dẻ: Tìm thấy ${filesXinkk.length} ảnh`);

  const urlsXinkk = [];
  const varsXinkk = [];
  for (let i = 0; i < filesXinkk.length; i++) {
    const p = path.join(dirXinkk, filesXinkk[i]);
    const storagePath = `set-xinkk-220k/xinkk_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(p, storagePath);
    if (url) {
      urlsXinkk.push(url);
      varsXinkk.push({
        label: `Mẫu ${String(i + 1).padStart(2, '0')} - Xinh hạt dẻ`,
        image: url,
        colorId: 'be'
      });
    }
  }

  const prodXinkk = {
    id: 'SET_XINKK_220K',
    slug: 'set-3-mon-ga-goi-cotton-dui-xinkk-pastel-han-quoc-220k',
    name: 'Set 3 món ga gối cotton đũi Xinkk Pastel Hàn Quốc',
    category_id: 'set-3-mon',
    price: 220000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'hong-dat', 'vang-nhat', 'xanh-duong', 'xam'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm', quantity: 1, note: 'Vừa nệm dày tới 15cm' },
      { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 3 món chăn ga gối đũi cotton mẫu xinh xắn hạt dẻ phong cách pastel Hàn Quốc. Nhiều họa tiết hoạt hình, gấu nhỏ và hoa cúc nhẹ nhàng, giá cực kỳ học sinh sinh viên.\n<!--cats:["set-3-mon","chat-lieu-dui","hoa-tiet-de-thuong","hoa-tiet-hoa-nhi"]-->\n<!--vars:${JSON.stringify(varsXinkk)}-->`,
    images: urlsXinkk,
    cover_image: urlsXinkk[0] || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodXinkk, { onConflict: 'id' });
  console.log(`  ✓ Đã thêm: ${prodXinkk.id} (${urlsXinkk.length} ảnh)`);

  // ==========================================
  // 4. Threads___D__do_l__h_ng_em_t__nh_p_v___1786502524 (49 ảnh -> 3 sản phẩm)
  // ==========================================
  const dirNhap = path.resolve(rootDir, 'image', 'Threads___D__do_l__h_ng_em_t__nh_p_v___1786502524');
  const filesNhap = fs.readdirSync(dirNhap).filter(f => f.toLowerCase().endsWith('.jpg'));
  console.log(`\n4. Threads Hàng tự nhập: Tìm thấy ${filesNhap.length} ảnh`);

  const urlsNhap = [];
  for (let i = 0; i < filesNhap.length; i++) {
    const p = path.join(dirNhap, filesNhap[i]);
    const storagePath = `set-nhap-ve/nhap_${String(i + 1).padStart(2, '0')}.jpg`;
    const url = await uploadImage(p, storagePath);
    if (url) urlsNhap.push(url);
  }

  // Tách 49 ảnh thành 3 link sản phẩm (16, 17, 16 ảnh)
  const g1_nhap = urlsNhap.slice(0, 16);
  const g2_nhap = urlsNhap.slice(16, 33);
  const g3_nhap = urlsNhap.slice(33);

  // Link 1: Nỉ nhung ấm áp mùa đông
  const varsNhap1 = g1_nhap.map((url, i) => ({
    label: `Mẫu ${String(i + 1).padStart(2, '0')} - Nỉ nhung ấm áp`,
    image: url,
    colorId: 'nau'
  }));
  const prodNhap1 = {
    id: 'SET_NHAP_NI_280K',
    slug: 'set-chan-ga-ni-nhung-cao-cap-giu-nhiet-mua-dong-280k',
    name: 'Set 3 món chăn ga nỉ nhung cao cấp giữ nhiệt mùa đông',
    category_id: 'set-3-mon',
    price: 280000,
    currency: 'VND',
    type: 'combo',
    colors: ['nau', 'xam', 'be', 'hong-dat'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun nỉ nhung bọc đệm', quantity: 1, note: 'Vừa nệm dày tới 20cm' },
      { name: 'Vỏ gối nằm nỉ nhung', quantity: 2, note: '45x65cm mềm mịn' }
    ],
    description: `Set 3 món chăn ga chất liệu nỉ nhung tuyết cao cấp tự nhập trực tiếp. Sợi lông dệt siêu mịn màng, giữ ấm siêu nhanh ngay khi nằm xuống, ấm cúng trọn vẹn suốt mùa đông.\n<!--cats:["set-3-mon","chat-lieu-ni","mua-dong"]-->\n<!--vars:${JSON.stringify(varsNhap1)}-->`,
    images: g1_nhap,
    cover_image: g1_nhap[0] || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodNhap1, { onConflict: 'id' });
  console.log(`  ✓ Đã thêm: ${prodNhap1.id} (${g1_nhap.length} ảnh)`);

  // Link 2: Đũi hoa nhí vintage
  const varsNhap2 = g2_nhap.map((url, i) => ({
    label: `Mẫu ${String(i + 17).padStart(2, '0')} - Hoa nhí Vintage`,
    image: url,
    colorId: 'hong-dat'
  }));
  const prodNhap2 = {
    id: 'SET_NHAP_HOANHI_260K',
    slug: 'set-chan-ga-dui-hoa-nhi-vintage-hoa-co-dong-noi-260k',
    name: 'Set 3 món chăn ga đũi hoa nhí vintage hoa cỏ đồng nội',
    category_id: 'set-3-mon',
    price: 260000,
    currency: 'VND',
    type: 'combo',
    colors: ['hong-dat', 'be', 'vang-nhat', 'xanh-mint'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm', quantity: 1, note: 'Vừa nệm dày tới 15cm' },
      { name: 'Vỏ gối nằm đũi hoa nhí', quantity: 2, note: '45x65cm' }
    ],
    description: `Bộ sưu tập chăn ga đũi hoa nhí và hoa cỏ mùa hạ mang phong cách đồng quê Pháp mộc mạc và bình yên. Vải đũi mềm thoáng khí, thấm hút mồ hôi cực tốt.\n<!--cats:["set-3-mon","chat-lieu-dui","hoa-tiet-hoa-nhi"]-->\n<!--vars:${JSON.stringify(varsNhap2)}-->`,
    images: g2_nhap,
    cover_image: g2_nhap[0] || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodNhap2, { onConflict: 'id' });
  console.log(`  ✓ Đã thêm: ${prodNhap2.id} (${g2_nhap.length} ảnh)`);

  // Link 3: Kẻ caro & tối giản
  const varsNhap3 = g3_nhap.map((url, i) => ({
    label: `Mẫu ${String(i + 34).padStart(2, '0')} - Kẻ Caro tối giản`,
    image: url,
    colorId: 'xam'
  }));
  const prodNhap3 = {
    id: 'SET_NHAP_CARO_260K',
    slug: 'set-chan-ga-dui-ke-soc-caro-toi-gian-tre-trung-260k',
    name: 'Set 3 món chăn ga đũi kẻ sọc caro & tối giản trẻ trung',
    category_id: 'set-3-mon',
    price: 260000,
    currency: 'VND',
    type: 'combo',
    colors: ['xam', 'xanh-duong', 'nau', 'be'],
    sizes: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm', quantity: 1, note: 'Vừa nệm dày tới 15cm' },
      { name: 'Vỏ gối nằm kẻ caro', quantity: 2, note: '45x65cm' }
    ],
    description: `Set 3 món ga gối đũi cotton họa tiết kẻ caro và kẻ sọc hình học tối giản. Thiết kế thanh lịch hiện đại, phù hợp cho mọi không gian phòng ngủ tối giản kiểu Nhật và Bắc Âu.\n<!--cats:["set-3-mon","chat-lieu-dui","hoa-tiet-ke","mau-tron"]-->\n<!--vars:${JSON.stringify(varsNhap3)}-->`,
    images: g3_nhap,
    cover_image: g3_nhap[0] || null,
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodNhap3, { onConflict: 'id' });
  console.log(`  ✓ Đã thêm: ${prodNhap3.id} (${g3_nhap.length} ảnh)`);

  // ==========================================
  // 5. Tổng kết độ phủ danh mục
  // ==========================================
  console.log('\n=============================================');
  console.log('📊 KIỂM TRA ĐỘ PHỦ DANH MỤC TRÊN TOÀN BỘ SẢN PHẨM:');
  const { data: allProds } = await supabase.from('products').select('id, name, category_id, description');
  const { data: allCats } = await supabase.from('categories').select('*').order('display_order');

  console.log(`Tổng số sản phẩm hiện có: ${allProds?.length}`);
  console.log(`Tổng số danh mục: ${allCats?.length}`);

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
    console.log(`- [${cat.id}] ${cat.name}: ${count} sản phẩm`);
  }
}

main().catch(console.error);
