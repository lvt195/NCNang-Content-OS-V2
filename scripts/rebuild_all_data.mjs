/**
 * rebuild_all_data.mjs
 * Tái cấu trúc toàn bộ dữ liệu:
 * - Mỗi link sản phẩm tối đa 15-20 mẫu (chia theo nhóm danh mục chung hợp lý)
 * - Kích thước chuẩn: ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu']
 * - Đầy đủ dấu tiếng Việt, không thừa ký tự, màu sắc chuẩn xác
 * Chạy: node --env-file=.env scripts/rebuild_all_data.mjs
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

// Chuẩn hóa tên file ASCII cho Supabase Storage
function sanitizeFilename(filename) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Upload file lên storage
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

// Bảng ánh xạ màu sắc chuẩn
const COLOR_MAP = {
  Xanh_Duong_Pastel: 'xanh-duong',
  Xanh_La_Mint: 'xanh-mint',
  Xanh_Mint: 'xanh-mint',
  Xanh_La_Bo: 'xanh-reu',
  Xam_Ghi_Den: 'xam',
  Den: 'xam',
  Hong_Do_Dao: 'hong-dat',
  Vang_Cam: 'vang-nhat',
  Trang_Kem_Be: 'be',
  Nau_Dat_Cafe: 'nau',
  Tim_Lavender: 'tim-khoi',
};

// Từ điển dịch từ khóa sang tiếng Việt có dấu đầy đủ
const VIETNAMESE_WORDS = {
  caro: 'kẻ caro', ke: 'kẻ', soc: 'sọc', hinh: 'hình', hoc: 'học', ziczac: 'zigzag',
  xanh: 'xanh', duong: 'dương', pastel: 'pastel', da: 'da', troi: 'trời',
  ghi: 'ghi', xam: 'xám', nhat: 'nhạt',
  hong: 'hồng', cam: 'cam', dao: 'đào',
  vang: 'vàng', bo: 'bơ',
  trang: 'trắng', kem: 'kem', be: 'be',
  nau: 'nâu', dat: 'đất', cafe: 'cà phê',
  tim: 'tím', lavender: 'lavender', khoai: 'khoai', mon: 'môn',
  xanh_la: 'xanh lá', mint: 'mint', reu: 'rêu',
  den: 'đen', tron: 'trơn', toi: 'tối', gian: 'giản',
  gau: 'gấu', dong: 'động', vat: 'vật', cute: 'dễ thương',
  bong: 'bông', tuyet: 'tuyết', cookie: 'cookie',
  tho: 'thỏ', meo: 'mèo', cun: 'cún', dom: 'đốm', chuoi: 'chuối',
  khi: 'khỉ', con: 'con', ngua: 'ngựa', go: 'gỗ',
  hoa: 'hoa', nhi: 'nhí', li: 'li', ti: 'ti', co: 'cỏ',
  la: 'lá', cuc: 'cúc', dai: 'dại', tulip: 'tulip',
  vintage: 'vintage', trai: 'trái', tim_trai: 'tim', nho: 'nhỏ',
  banh: 'bánh', mi: 'mì', biscuit: 'biscuit',
  dau: 'dâu', tay: 'tây', qua: 'quả',
  pooh: 'Pooh', non: 'nón', sinh: 'sinh', nhat_3: 'nhật',
  cau: 'cầu', vong: 'vồng', cham: 'chấm', bi: 'bi', man: 'mận', do: 'đỏ',
  dui: 'đũi', xuoc: 'xước', am: 'ấm', mat: 'mát', no: 'nơ',
  hoat: 'hoạt', hinh_3: 'hình', tre: 'trẻ', em: 'em',
};

function formatVietnamesePatternName(name) {
  const parts = name.split('_');
  const translated = parts.map(p => VIETNAMESE_WORDS[p.toLowerCase()] || p).join(' ');
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

// Kích thước yêu cầu từ khách: 1m6 x 2m và 1m8 x 2m2 + may theo yêu cầu
const SIZES = ['1m6 x 2m', '1m8 x 2m2', 'May theo yêu cầu'];

// 10 danh mục chuẩn hoá
const CATEGORIES = [
  {
    id: 'set-3-mon',
    name: 'Set 3 món (Ga + 2 gối)',
    description: 'Bộ gồm 1 ga chun bọc đệm và 2 vỏ gối nằm đồng bộ',
    display_order: 1,
  },
  {
    id: 'set-4-mon',
    name: 'Set 4 món (Có vỏ chăn)',
    description: 'Trọn bộ gồm 1 ga giường, 1 vỏ chăn 2m x 2m2 và 2 vỏ gối nằm',
    display_order: 2,
  },
  {
    id: 'chat-lieu-dui',
    name: 'Vải đũi cotton',
    description: 'Chất liệu đũi cotton sợi dệt tự nhiên thoáng mát, mộc mạc',
    display_order: 3,
  },
  {
    id: 'chat-lieu-ni',
    name: 'Vải nỉ lông chuột',
    description: 'Chất liệu nỉ nhung lông chuột mềm mịn, giữ nhiệt ấm áp mùa đông',
    display_order: 4,
  },
  {
    id: 'chat-lieu-lanh',
    name: 'Thun lạnh Tencel',
    description: 'Chất liệu thun lạnh Tencel Ice Silk trơn mượt, mát lạnh mùa hè',
    display_order: 5,
  },
  {
    id: 'hoa-tiet-ke',
    name: 'Kẻ caro & sọc',
    description: 'Họa tiết kẻ caro, kẻ sọc phong cách Hàn Quốc hiện đại',
    display_order: 6,
  },
  {
    id: 'hoa-tiet-hoa-nhi',
    name: 'Hoa nhí Vintage',
    description: 'Họa tiết hoa nhí li ti nhẹ nhàng, thơ mộng, cổ điển',
    display_order: 7,
  },
  {
    id: 'hoa-tiet-de-thuong',
    name: 'Hình thú & hoạt hình',
    description: 'Gấu teddy, thỏ, cún con và các nhân vật hoạt hình đáng yêu',
    display_order: 8,
  },
  {
    id: 'mau-tron',
    name: 'Màu trơn tối giản',
    description: 'Tông màu trơn thanh lịch, tinh tế chuẩn phong cách Bắc Âu',
    display_order: 9,
  },
  {
    id: 'mua-dong',
    name: 'Ấm áp mùa đông',
    description: 'Các dòng sản phẩm nỉ nhung giữ nhiệt tốt cho mùa thu đông',
    display_order: 10,
  },
];

async function main() {
  console.log('=== BẮT ĐẦU TÁI THIẾT LẬP DỮ LIỆU TỐI ƯU (TỐI ĐA 15-20 MẪU / LINK) ===\n');

  // 1. DỌN SẠCH DỮ LIỆU CŨ
  console.log('1. Xóa toàn bộ sản phẩm và danh mục cũ trên Supabase...');
  await supabase.from('products').delete().neq('id', '___never___');
  await supabase.from('categories').delete().neq('id', '___never___');
  console.log('  ✓ Đã dọn sạch database');

  // 2. TẠO 10 DANH MỤC
  console.log('2. Tạo hệ thống 10 danh mục...');
  await supabase.from('categories').insert(CATEGORIES);
  console.log(`  ✓ Đã tạo ${CATEGORIES.length} danh mục.`);

  // 3. ĐỌC DỮ LIỆU SET 165K
  console.log('\n3. Đọc dữ liệu 157 mẫu Set 165k...');
  const manifestPath = path.resolve(rootDir, 'image', 'Set 165k (Phan loai chi tiet)', 'gallery_chi_tiet.html');
  const manifestHtml = fs.readFileSync(manifestPath, 'utf-8');
  const match165 = manifestHtml.match(/const data = (\[.*?\]);/s);
  const items165 = JSON.parse(match165[1]);
  const poolDir165 = path.resolve(rootDir, 'image', 'Set 165k (Phan loai chi tiet)', '_Tat_Ca_Anh_Goc_Da_Doi_Ten');

  // Cache URL đã upload để không upload lại nếu đã có
  const uploadedUrls = {};
  for (let i = 0; i < items165.length; i++) {
    const it = items165[i];
    const localFile = path.join(poolDir165, it.filename);
    const sanitized = sanitizeFilename(it.filename);
    const storagePath = `combo165/${sanitized}`;
    const url = await uploadImage(localFile, storagePath);
    uploadedUrls[it.id] = url;
  }
  console.log(`  ✓ Đã đảm bảo toàn bộ ${items165.length} ảnh Set 165k trên storage.`);

  // Phân chia 157 mẫu thành 9 nhóm sản phẩm (mỗi link 15-19 mẫu)
  const set165Groups = [
    {
      id: 'SET165_CARO',
      name: 'Set 3 món ga gối đũi Kẻ Caro Hàn Quốc',
      slug: 'set-3-mon-ga-goi-dui-ke-caro-han-quoc-165k',
      cat: 'hoa-tiet-ke',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-ke'],
      descIntro: 'Bộ sưu tập ga gối đũi cotton kẻ caro mang đậm phong cách Hàn Quốc trẻ trung, năng động.',
      matchFn: (it) => it.patterns.includes('Ke_Caro'),
      items: [],
    },
    {
      id: 'SET165_SOC',
      name: 'Set 3 món ga gối đũi Kẻ Sọc & Hình học hiện đại',
      slug: 'set-3-mon-ga-goi-dui-ke-soc-hinh-hoc-165k',
      cat: 'hoa-tiet-ke',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-ke'],
      descIntro: 'Bộ sưu tập họa tiết kẻ sọc thanh lịch và các khối hình học zigzag hiện đại, tối giản.',
      matchFn: (it) => it.patterns.includes('Ke_Soc') || it.patterns.includes('Hinh_Hoc_Truu_Tuong'),
      items: [],
    },
    {
      id: 'SET165_HOANHI',
      name: 'Set 3 món ga gối đũi Hoa nhí Vintage cổ điển',
      slug: 'set-3-mon-ga-goi-dui-hoa-nhi-vintage-165k',
      cat: 'hoa-tiet-hoa-nhi',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-hoa-nhi'],
      descIntro: 'Bộ sưu tập hoa nhí li ti mang vẻ đẹp vintage nhẹ nhàng, lãng mạn và tinh tế cho phòng ngủ.',
      matchFn: (it) => it.patterns.includes('Hoa_Nhi_Hoa_Co') && !it.name.includes('cuc') && !it.name.includes('tulip'),
      items: [],
    },
    {
      id: 'SET165_HOACO',
      name: 'Set 3 món ga gối đũi Hoa cúc & Hoa cỏ mùa hạ',
      slug: 'set-3-mon-ga-goi-dui-hoa-cuc-hoa-co-165k',
      cat: 'hoa-tiet-hoa-nhi',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-hoa-nhi'],
      descIntro: 'Bộ sưu tập hoa cúc dại, hoa tulip và cỏ cây hoa lá mùa hạ tươi tắn, ngập tràn sức sống.',
      matchFn: (it) => it.name.includes('cuc') || it.name.includes('tulip') || it.name.includes('la') || it.name.includes('co'),
      items: [],
    },
    {
      id: 'SET165_GAU',
      name: 'Set 3 món ga gối đũi Gấu Teddy & Bánh quy ấm áp',
      slug: 'set-3-mon-ga-goi-dui-gau-teddy-banh-quy-165k',
      cat: 'hoa-tiet-de-thuong',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-de-thuong'],
      descIntro: 'Bộ sưu tập gấu teddy, bánh mì, biscuit và tông màu be nâu ấm áp, ngọt ngào.',
      matchFn: (it) => it.name.includes('gau') || it.name.includes('banh') || it.name.includes('cookie') || it.name.includes('biscuit'),
      items: [],
    },
    {
      id: 'SET165_THU',
      name: 'Set 3 món ga gối đũi Thỏ ngọc & Thú cưng đáng yêu',
      slug: 'set-3-mon-ga-goi-dui-tho-ngoc-thu-cung-165k',
      cat: 'hoa-tiet-de-thuong',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-de-thuong'],
      descIntro: 'Bộ sưu tập thỏ trắng, cún con đốm và mèo lười dễ thương chuẩn phong cách Hàn Quốc.',
      matchFn: (it) => it.name.includes('tho') || it.name.includes('cun') || it.name.includes('meo') || it.name.includes('khi') || it.name.includes('ngua'),
      items: [],
    },
    {
      id: 'SET165_HOATHINH',
      name: 'Set 3 món ga gối đũi Hoạt hình trẻ em & Sanrio',
      slug: 'set-3-mon-ga-goi-dui-hoat-hinh-sanrio-165k',
      cat: 'hoa-tiet-de-thuong',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-de-thuong'],
      descIntro: 'Bộ sưu tập nhân vật hoạt hình ngộ nghĩnh, Sanrio, gấu Pooh và xe cộ sinh động cho bé và giới trẻ.',
      matchFn: (it) => it.patterns.includes('Hoat_Hinh_Tre_Em') || it.name.includes('sanrio') || it.name.includes('pooh') || it.name.includes('tau') || it.name.includes('xe'),
      items: [],
    },
    {
      id: 'SET165_TRAITIM',
      name: 'Set 3 món ga gối đũi Trái tim & Dâu tây ngọt ngào',
      slug: 'set-3-mon-ga-goi-dui-trai-tim-dau-tay-165k',
      cat: 'hoa-tiet-de-thuong',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'hoa-tiet-de-thuong'],
      descIntro: 'Bộ sưu tập trái tim, nơ xinh và dâu tây ngọt ngào tông hồng pastel dịu dàng nữ tính.',
      matchFn: (it) => it.patterns.includes('Trai_Tim_No') || it.name.includes('dau') || it.name.includes('tim'),
      items: [],
    },
    {
      id: 'SET165_TRON',
      name: 'Set 3 món ga gối đũi Màu trơn & Tối giản thanh lịch',
      slug: 'set-3-mon-ga-goi-dui-mau-tron-toi-gian-165k',
      cat: 'mau-tron',
      extraCats: ['set-3-mon', 'chat-lieu-dui', 'mau-tron'],
      descIntro: 'Bộ sưu tập màu trơn mộc mạc và sọc xước tinh tế mang lại cảm giác bình yên, thư thái.',
      matchFn: (it) => it.patterns.includes('Tron_Toi_Gian'),
      items: [],
    },
  ];

  const assigned = new Set();

  // Giai đoạn 1: Ưu tiên phân loại vào nhóm khớp nhất (giới hạn tối đa 19 mẫu / link)
  for (const group of set165Groups) {
    for (const it of items165) {
      if (assigned.has(it.id)) continue;
      if (group.matchFn(it) && group.items.length < 19) {
        group.items.push(it);
        assigned.add(it.id);
      }
    }
  }

  // Giai đoạn 2: Phân bổ các mẫu còn lại vào nhóm chưa đầy (< 19)
  for (const it of items165) {
    if (assigned.has(it.id)) continue;
    // Tìm nhóm có ít mẫu nhất
    const eligibleGroups = set165Groups.filter(g => g.items.length < 19);
    eligibleGroups.sort((a, b) => a.items.length - b.items.length);
    if (eligibleGroups.length > 0) {
      eligibleGroups[0].items.push(it);
      assigned.add(it.id);
    }
  }

  // Đẩy 9 sản phẩm Set 165k lên Supabase
  console.log('\n4. Đẩy 9 link sản phẩm Set 165k lên database (mỗi link 15-19 mẫu)...');
  for (const group of set165Groups) {
    const variants = group.items.map((it, idx) => {
      const formattedName = formatVietnamesePatternName(it.name);
      return {
        label: `Mẫu ${String(idx + 1).padStart(2, '0')} - ${formattedName}`,
        image: uploadedUrls[it.id],
        color: COLOR_MAP[it.colors?.[0]] || 'be',
      };
    });

    const images = variants.map(v => v.image);
    const colors = Array.from(new Set(variants.map(v => v.color)));

    const prodPayload = {
      id: group.id,
      name: group.name,
      slug: group.slug,
      category_id: 'set-3-mon',
      price: 165000,
      currency: 'VND',
      type: 'combo',
      colors: colors,
      sizes: SIZES,
      description: `${group.descIntro} Trọn bộ 3 món gồm 1 ga chun bọc đệm và 2 vỏ gối nằm đồng bộ. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.\n<!--cats:${JSON.stringify(group.extraCats)}-->\n<!--vars:${JSON.stringify(variants)}-->`,
      combo_items: [
        { name: 'Ga chun đũi bọc đệm', quantity: 1, note: 'Vừa đệm dày tới 15cm' },
        { name: 'Vỏ gối nằm đũi đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' },
      ],
      cover_image: images[0],
      images: images,
      featured: group.id === 'SET165_CARO' || group.id === 'SET165_HOANHI',
      published: true,
    };

    const { error: errIns } = await supabase.from('products').insert(prodPayload);
    if (errIns) throw errIns;
    console.log(`  ✓ ${group.id}: ${group.name} (${variants.length} mẫu)`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. SET 380K (38 mẫu) -> Tách thành 2 link sản phẩm (19 mẫu mỗi link)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n5. Xử lý Set 4 món 380k (tách thành 2 link sản phẩm, 19 mẫu / link)...');
  const dir380 = path.resolve(rootDir, 'image', 'Set 4 món 380k');
  const files380 = fs.readdirSync(dir380).filter(f => !f.startsWith('.') && /\.(jpg|jpeg|png)$/i.test(f)).sort();

  const set380Images = [];
  for (let i = 0; i < files380.length; i++) {
    const f = files380[i];
    const ext = path.extname(f).toLowerCase();
    const storagePath = `set4-chan-380k/set4_chan_${String(i + 1).padStart(2, '0')}${ext}`;
    const url = await uploadImage(path.join(dir380, f), storagePath);
    if (url) set380Images.push(url);
  }

  const set380AllLabels = [
    { label: 'Mẫu 01 - Vàng bơ hoa cúc nhí', color: 'vang-nhat', imgIdx: 5 },
    { label: 'Mẫu 02 - Chấm bi hoa quả vàng kem', color: 'vang-nhat', imgIdx: 6 },
    { label: 'Mẫu 03 - Xanh mint chấm bi nhẹ nhàng', color: 'xanh-mint', imgIdx: 7 },
    { label: 'Mẫu 04 - Chấm bi đen trắng cá tính', color: 'xam', imgIdx: 8 },
    { label: 'Mẫu 05 - Tím lavender hoa nhí', color: 'tim-khoi', imgIdx: 9 },
    { label: 'Mẫu 06 - Hoa nhí vintage tím nhạt', color: 'tim-khoi', imgIdx: 10 },
    { label: 'Mẫu 07 - Thỏ kem nâu vintage', color: 'be', imgIdx: 11 },
    { label: 'Mẫu 08 - Thỏ dâu tây hồng kem', color: 'hong-dat', imgIdx: 12 },
    { label: 'Mẫu 09 - Bánh ngọt kem xanh mint', color: 'xanh-mint', imgIdx: 13 },
    { label: 'Mẫu 10 - Dâu tây hồng kem ngọt ngào', color: 'hong-dat', imgIdx: 14 },
    { label: 'Mẫu 11 - Mây xanh gấu nhỏ Hàn Quốc', color: 'xanh-duong', imgIdx: 15 },
    { label: 'Mẫu 12 - Kẻ sọc be gấu nâu ấm áp', color: 'nau', imgIdx: 16 },
    { label: 'Mẫu 13 - Xanh mint dâu tây tươi mát', color: 'xanh-mint', imgIdx: 17 },
    { label: 'Mẫu 14 - Bánh ngọt donut hồng pastel', color: 'hong-dat', imgIdx: 18 },
    { label: 'Mẫu 15 - Cún con xanh da trời đáng yêu', color: 'xanh-duong', imgIdx: 19 },
    { label: 'Mẫu 16 - Trái tim đỏ nền kem lãng mạn', color: 'hong-dat', imgIdx: 20 },
    { label: 'Mẫu 17 - Mây xanh gấu con ngủ ngoan', color: 'xanh-duong', imgIdx: 21 },
    { label: 'Mẫu 18 - Hoa nhí tím nền tím mộng mơ', color: 'tim-khoi', imgIdx: 22 },
    { label: 'Mẫu 19 - Bánh ngọt donut xanh ngộ nghĩnh', color: 'xanh-duong', imgIdx: 23 },
    { label: 'Mẫu 20 - Bánh ngọt donut hồng kem', color: 'hong-dat', imgIdx: 24 },
    { label: 'Mẫu 21 - Tím nhạt hoa nhí dịu dàng', color: 'tim-khoi', imgIdx: 25 },
    { label: 'Mẫu 22 - Thỏ hồng hoa cúc tươi tắn', color: 'hong-dat', imgIdx: 26 },
    { label: 'Mẫu 23 - Thỏ kem mộng mơ êm dịu', color: 'be', imgIdx: 27 },
    { label: 'Mẫu 24 - Thỏ vàng bơ nhạt ấm cúng', color: 'vang-nhat', imgIdx: 28 },
    { label: 'Mẫu 25 - Mèo kem ước nguyện ngộ nghĩnh', color: 'be', imgIdx: 29 },
    { label: 'Mẫu 26 - Voi con mây trời xanh thanh bình', color: 'xanh-duong', imgIdx: 30 },
    { label: 'Mẫu 27 - Vịt vàng xanh trời tự do', color: 'xanh-duong', imgIdx: 31 },
    { label: 'Mẫu 28 - Chấm bi kem sữa tinh nghịch', color: 'be', imgIdx: 32 },
    { label: 'Mẫu 29 - Hoa cỏ tĩnh hương thuần khiết', color: 'be', imgIdx: 33 },
    { label: 'Mẫu 30 - Nắng ấm xanh nhạt thư thái', color: 'xanh-mint', imgIdx: 34 },
    { label: 'Mẫu 31 - Kẻ caro Tây Tây Lý xanh pastel', color: 'xanh-duong', imgIdx: 35 },
    { label: 'Mẫu 32 - Thỏ tiểu thư kem nâu cổ điển', color: 'be', imgIdx: 33 },
    { label: 'Mẫu 33 - Chấm bi sóng biển xanh mát', color: 'xanh-mint', imgIdx: 37 },
    { label: 'Mẫu 34 - Nhật ký Kitty kem nâu thơ mộng', color: 'be', imgIdx: 38 },
    { label: 'Mẫu 35 - Chấm bi đen tuyền phong cách', color: 'xam', imgIdx: 39 },
    { label: 'Mẫu 36 - Cún con vui vẻ kem nâu thân thiện', color: 'be', imgIdx: 40 },
    { label: 'Mẫu 37 - Mùa anh đào đỏ kem rạng rỡ', color: 'hong-dat', imgIdx: 41 },
    { label: 'Mẫu 38 - Bé gái Dora kem sắc màu', color: 'be', imgIdx: 42 },
  ];

  // Tách 38 mẫu thành 2 nhóm 19 mẫu
  const part1Items = set380AllLabels.slice(0, 19);
  const part2Items = set380AllLabels.slice(19, 38);

  const set380Groups = [
    {
      id: 'SET380_HOAKE',
      name: 'Set 4 món chăn ga gối cotton đũi Hoa nhí & Kẻ pastel',
      slug: 'set-4-mon-chan-ga-goi-cotton-dui-hoa-nhi-ke-pastel-380k',
      items: part1Items,
      extraCats: ['set-4-mon', 'chat-lieu-dui', 'hoa-tiet-hoa-nhi', 'hoa-tiet-ke'],
      descIntro: 'Trọn bộ 4 món chăn ga gối cotton đũi họa tiết hoa nhí vintage, kẻ sọc và chấm bi pastel ngọt ngào.',
      coverIdx: 14,
    },
    {
      id: 'SET380_HINHTHU',
      name: 'Set 4 món chăn ga gối cotton đũi Hình thú & Hoạt hình',
      slug: 'set-4-mon-chan-ga-goi-cotton-dui-hinh-thu-hoat-hinh-380k',
      items: part2Items,
      extraCats: ['set-4-mon', 'chat-lieu-dui', 'hoa-tiet-de-thuong'],
      descIntro: 'Trọn bộ 4 món chăn ga gối cotton đũi họa tiết thú cưng ngộ nghĩnh: thỏ ngọc, mèo con, voi nhỏ và cún con đáng yêu.',
      coverIdx: 26,
    },
  ];

  for (const g of set380Groups) {
    const variants = g.items.map(p => ({
      label: p.label,
      image: set380Images[p.imgIdx] || set380Images[0],
      color: p.color,
    }));
    const images = variants.map(v => v.image);
    const colors = Array.from(new Set(variants.map(v => v.color)));

    const payload = {
      id: g.id,
      name: g.name,
      slug: g.slug,
      category_id: 'set-4-mon',
      price: 380000,
      currency: 'VND',
      type: 'combo',
      colors: colors,
      sizes: SIZES,
      description: `${g.descIntro} Chất liệu đũi cotton tự nhiên mềm mại, thoáng mát, dịu nhẹ với da. Trọn bộ gồm 1 vỏ chăn 2m x 2m2 có khóa kéo lồng ruột bông, 1 ga giường (chun hoặc phủ) và 2 vỏ gối nằm đồng bộ.\n<!--cats:${JSON.stringify(g.extraCats)}-->\n<!--vars:${JSON.stringify(variants)}-->`,
      combo_items: [
        { name: 'Ga chun hoặc ga phủ theo yêu cầu', quantity: 1, note: 'May đo vừa vặn đệm của khách' },
        { name: 'Vỏ chăn hè thu đông lồng được ruột', quantity: 1, note: 'Kích thước 2m x 2m2 có khóa kéo' },
        { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' },
      ],
      cover_image: set380Images[g.coverIdx] || images[0],
      images: images,
      featured: true,
      published: true,
    };

    const { error: errIns } = await supabase.from('products').insert(payload);
    if (errIns) throw errIns;
    console.log(`  ✓ ${g.id}: ${g.name} (${variants.length} mẫu)`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. SET 280K (12 mẫu <= 20) -> 1 link sản phẩm
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n6. Xử lý Set 3 món nỉ lông chuột 280k (1 link, 12 mẫu)...');
  const dir280 = path.resolve(rootDir, 'image', 'Set 3 nỉ lông chuột 280k');
  const files280 = fs.readdirSync(dir280).filter(f => !f.startsWith('.') && /\.(jpg|jpeg|png)$/i.test(f)).sort();

  const set280Images = [];
  for (let i = 0; i < files280.length; i++) {
    const f = files280[i];
    const ext = path.extname(f).toLowerCase();
    const storagePath = `set3-ni-280k/set3_ni_${String(i + 1).padStart(2, '0')}${ext}`;
    const url = await uploadImage(path.join(dir280, f), storagePath);
    if (url) set280Images.push(url);
  }

  const set280PatternNames = [
    { label: 'Mẫu 01 - Hoa nhí xanh rêu', color: 'xanh-reu', imgIdx: 4 },
    { label: 'Mẫu 02 - Hoa bé gái kem pastel', color: 'be', imgIdx: 15 },
    { label: 'Mẫu 03 - Hoa xám ghi ấm áp', color: 'xam', imgIdx: 5 },
    { label: 'Mẫu 04 - Caro gấu xanh dương', color: 'xanh-duong', imgIdx: 9 },
    { label: 'Mẫu 05 - Sóng nước xanh pastel', color: 'xanh-duong', imgIdx: 6 },
    { label: 'Mẫu 06 - Hoa vintage nâu ấm', color: 'nau', imgIdx: 13 },
    { label: 'Mẫu 07 - Thỏ nâu cà phê', color: 'nau', imgIdx: 10 },
    { label: 'Mẫu 08 - Tím lavender nơ vintage', color: 'tim-khoi', imgIdx: 12 },
    { label: 'Mẫu 09 - Cún con nâu ngộ nghĩnh', color: 'nau', imgIdx: 8 },
    { label: 'Mẫu 10 - Thỏ xanh bạc hà Hello Rabbit', color: 'xanh-mint', imgIdx: 7 },
    { label: 'Mẫu 11 - Thỏ caro kem vintage', color: 'be', imgIdx: 11 },
    { label: 'Mẫu 12 - Thỏ hồng ngọt ngào Sweet', color: 'hong-dat', imgIdx: 14 },
  ];

  const set280Variants = set280PatternNames.map(p => ({
    label: p.label,
    image: set280Images[p.imgIdx] || set280Images[0],
    color: p.color,
  }));

  const set280Product = {
    id: 'SET280',
    name: 'Set 3 món ga gối nỉ lông chuột Pureloom ấm áp mùa đông',
    slug: 'set-3-mon-ga-goi-ni-long-chuot-pureloom-280k',
    category_id: 'set-3-mon',
    price: 280000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'nau', 'xam', 'xanh-duong', 'xanh-mint', 'hong-dat', 'tim-khoi'],
    sizes: SIZES,
    description: `Set ga gối nỉ lông chuột 3 món cao cấp Pureloom Collection giá 280.000đ. Chất vải nỉ nhung lông chuột dày dặn, mềm mịn như tơ lụa, giữ ấm nhiệt cực tốt và hoàn toàn không rụng lông, không vón cục khi giặt máy. Phù hợp cho những ngày se lạnh mùa thu và mùa đông giá rét. Bộ sản phẩm gồm 1 ga chun bọc đệm ôm sát và 2 vỏ gối nằm đồng bộ.\n<!--cats:["set-3-mon","chat-lieu-ni","mua-dong","hoa-tiet-de-thuong","hoa-tiet-hoa-nhi","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(set280Variants)}-->`,
    combo_items: [
      { name: 'Ga chun nỉ lông chuột bọc đệm', quantity: 1, note: 'Chun bo viền ôm sát đệm tới 20cm' },
      { name: 'Vỏ gối nằm nỉ lông chuột đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' },
    ],
    cover_image: set280Images[3] || set280Images[0],
    images: set280Images,
    featured: true,
    published: true,
  };

  await supabase.from('products').insert(set280Product);
  console.log(`  ✓ SET280: ${set280Product.name} (${set280Variants.length} mẫu)`);

  // ─────────────────────────────────────────────────────────────────────────
  // 7. SET 350K (9 màu <= 20) -> 1 link sản phẩm
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n7. Xử lý Set ga chun 2 gối thun lạnh 350k (1 link, 9 màu)...');
  const dir350 = path.resolve(rootDir, 'image', 'Set ga 2 gối thun lạnh 350k');
  const files350 = fs.readdirSync(dir350).filter(f => !f.startsWith('.') && /\.(jpg|jpeg|png)$/i.test(f)).sort();

  const set350Images = [];
  for (let i = 0; i < files350.length; i++) {
    const f = files350[i];
    const ext = path.extname(f).toLowerCase();
    const storagePath = `set-thunlanh-350k/thunlanh_${String(i + 1).padStart(2, '0')}${ext}`;
    const url = await uploadImage(path.join(dir350, f), storagePath);
    if (url) set350Images.push(url);
  }

  const set350ColorVariants = [
    { label: 'Màu Xám ghi thanh lịch', color: 'xam', imgIdx: 8 },
    { label: 'Màu Xanh bơ nhạt dịu mát', color: 'xanh-reu', imgIdx: 9 },
    { label: 'Màu Xanh lá mạ tươi mới', color: 'xanh-reu', imgIdx: 10 },
    { label: 'Màu Tím khoai môn Lavender', color: 'tim-khoi', imgIdx: 11 },
    { label: 'Màu Nâu cà phê sữa Camel', color: 'nau', imgIdx: 12 },
    { label: 'Màu Vàng bơ nhạt Butter', color: 'vang-nhat', imgIdx: 13 },
    { label: 'Màu Xanh navy đậm quý phái', color: 'xanh-navy', imgIdx: 14 },
    { label: 'Màu Xanh than hiện đại', color: 'xanh-navy', imgIdx: 15 },
    { label: 'Màu Xanh da trời mát lành', color: 'xanh-duong', imgIdx: 16 },
  ];

  const set350Variants = set350ColorVariants.map(p => ({
    label: p.label,
    image: set350Images[p.imgIdx] || set350Images[0],
    color: p.color,
  }));

  const set350Product = {
    id: 'SET350',
    name: 'Set ga chun và 2 vỏ gối thun lạnh Tencel Ice Silk',
    slug: 'set-ga-chun-2-vo-goi-thun-lanh-tencel-ice-silk-350k',
    category_id: 'set-3-mon',
    price: 350000,
    currency: 'VND',
    type: 'combo',
    colors: ['xam', 'xanh-reu', 'xanh-navy', 'xanh-duong', 'tim-khoi', 'nau', 'vang-nhat'],
    sizes: SIZES,
    description: `Set ga chun và 2 vỏ gối chất liệu thun lạnh Tencel Ice Silk cao cấp giá 350.000đ. Bề mặt vải mát lạnh tức thì ngay khi chạm vào, sợi vải siêu mịn mượt kháng khuẩn, mang lại giấc ngủ êm ái mát mẻ suốt đêm hè. Tông màu trơn sang trọng, hiện đại chuẩn phong cách Mark Cross. Bộ gồm 1 ga chun bọc đệm và 2 vỏ gối nằm đồng bộ.\n<!--cats:["set-3-mon","chat-lieu-lanh","mau-tron"]-->\n<!--vars:${JSON.stringify(set350Variants)}-->`,
    combo_items: [
      { name: 'Ga chun thun lạnh Tencel Ice Silk', quantity: 1, note: 'Bề mặt siêu mềm mát lịm, vừa đệm dày tới 20cm' },
      { name: 'Vỏ gối nằm thun lạnh', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' },
    ],
    cover_image: set350Images[3] || set350Images[0],
    images: set350Images,
    featured: true,
    published: true,
  };

  await supabase.from('products').insert(set350Product);
  console.log(`  ✓ SET350: ${set350Product.name} (${set350Variants.length} màu)`);

  // ─────────────────────────────────────────────────────────────────────────
  // KIỂM TRA TỔNG KẾT
  // ─────────────────────────────────────────────────────────────────────────
  const { data: finalProducts } = await supabase.from('products').select('id, name, price, sizes, images, description');
  console.log('\n🎉 THÀNH CÔNG RỰC RỠ!');
  console.log(`Tổng số sản phẩm tạo trên Supabase: ${finalProducts.length}`);
  finalProducts.forEach(p => {
    let varCount = 0;
    try {
      const match = p.description.match(/<!--vars:(.*?)-->/);
      if (match) varCount = JSON.parse(match[1]).length;
    } catch {}
    console.log(`  * [${p.id}] ${p.name}`);
    console.log(`    Giá: ${p.price.toLocaleString()}đ | Số mẫu (phân loại): ${varCount} mẫu | Kích thước: ${p.sizes.join(', ')}`);
  });
}

main().catch(err => {
  console.error('\n❌ Lỗi:', err);
  process.exit(1);
});
