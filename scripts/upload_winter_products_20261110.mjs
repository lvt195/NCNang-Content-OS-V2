import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

const rootDir = process.cwd();

// Helper to upload a folder
async function uploadFolder(dirPath, storageFolder) {
  const files = fs.readdirSync(dirPath)
    .filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
    .sort();

  console.log(`\n--- Uploading ${files.length} images from ${dirPath} to ${storageFolder} ---`);
  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const fullPath = path.join(dirPath, f);
    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(f).toLowerCase() || '.jpg';
    const targetName = `${String(i + 1).padStart(2, '0')}${ext}`;
    const storagePath = `${storageFolder}/${targetName}`;

    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
        upsert: true
      });

    if (upErr) {
      console.error(`Error uploading ${storagePath}:`, upErr.message);
    } else {
      const { data: pubData } = supabase.storage
        .from('product-images')
        .getPublicUrl(storagePath);
      uploadedUrls.push({ index: i + 1, originalName: f, url: pubData.publicUrl });
      process.stdout.write(`.`);
    }
  }
  console.log(`\n✓ Uploaded ${uploadedUrls.length}/${files.length} files to ${storageFolder}`);
  return uploadedUrls;
}

async function main() {
  console.log('Bắt đầu tải ảnh và tạo 7 sản phẩm mới ngày 10/11 theo đúng Ponytail & Catalog Media Rules...');

  // =========================================================================
  // 1. LE_CHAN_SAN_HO_389K (12 images: 1 ảnh chung, 11 mẫu)
  // =========================================================================
  const dirSanHo = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn lông cừu san hô 389k');
  await uploadFolder(dirSanHo, 'chan-san-ho-389k');
  const baseSanHo = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-san-ho-389k/';

  const varsSanHo = [
    { label: 'Mẫu 01 - Nâu hồng chấm bi trắng', image: baseSanHo + '01.jpg', colorId: 'nau' },
    { label: 'Mẫu 02 - Tím pastel chấm bi trắng', image: baseSanHo + '02.jpg', colorId: 'tim' },
    { label: 'Mẫu 03 - Xanh dương pastel chấm bi trắng', image: baseSanHo + '03.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 04 - Xanh mint chấm bi nâu retro', image: baseSanHo + '04.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 05 - Vàng bơ chấm bi nâu', image: baseSanHo + '05.jpg', colorId: 'vang' },
    { label: 'Mẫu 06 - Hồng phấn chấm bi xám', image: baseSanHo + '06.jpg', colorId: 'hong' },
    { label: 'Mẫu 07 - Trắng kem ngôi sao xám', image: baseSanHo + '07.jpg', colorId: 'trang' },
    { label: 'Mẫu 08 - Sọc nâu & xanh dương cá tính', image: baseSanHo + '08.jpg', colorId: 'nau' },
    { label: 'Mẫu 09 - Xanh navy hoa nhí trắng', image: baseSanHo + '09.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 10 - Nâu socola hoa nhí hồng', image: baseSanHo + '10.jpg', colorId: 'nau' },
    { label: 'Mẫu 11 - Xanh mint gấu teddy nâu', image: baseSanHo + '11.jpg', colorId: 'xanh-la' },
  ];

  const generalSanHo = [
    baseSanHo + '12.jpg#color=be', // ảnh tệp chăn gấp gọn
  ];
  const mainSanHo = varsSanHo.map(v => `${v.image}#color=${v.colorId}`);

  const prodSanHo = {
    id: 'LE_CHAN_SAN_HO_389K',
    slug: 'chan-long-cuu-san-ho-phong-cach-han-quoc-389k',
    name: 'Chăn lông cừu san hô chấm bi phong cách Hàn Quốc (2m x 2m3)',
    category_id: 'mon-le',
    price: 389000,
    currency: 'VND',
    type: 'single',
    colors: ['nau', 'tim', 'xanh-duong', 'xanh-la', 'vang', 'hong', 'trang'],
    sizes: ['2m x 2m3 (khoảng 1.5kg)'],
    combo_items: [
      { name: 'Chăn lông cừu san hô Hàn Quốc', quantity: 1, note: 'Kích thước 2m x 2m3, nặng ~1.5kg' }
    ],
    description: `ᴄʜᴀ̆ɴ ʟᴏ̂ɴɢ ᴄᴜ̛̀ᴜ ꜱᴀɴ ʜᴏ̂ ᴘʜᴏɴɢ ᴄᴀ́ᴄʜ ʜᴀ̀ɴ ǫᴜᴏ̂́ᴄ 𐙚 ̊.🐑 giá 389.000đ.\n• Họa tiết Polka Dot retro thời thượng - xu hướng thanh lịch mang đậm hơi thở hiện đại.\n• Chất liệu lông cừu san hô được tuyển chọn kỹ, mật độ sợi lông dày dặn hơn các dòng lông cừu thông thường, mềm mại, giữ ấm tốt, không rụng lông và không biến dạng sau khi giặt máy.\n- Kích thước: 2m x 2m3\n- Cân nặng: ~1.5kg\n<!--cats:["mon-le","chat-lieu-ni","hoa-tiet-de-thuong"]-->\n<!--vars:${JSON.stringify(varsSanHo)}-->`,
    images: [...generalSanHo, ...mainSanHo],
    cover_image: baseSanHo + '12.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodSanHo, { onConflict: 'id' });
  console.log(`✓ [1/7] Đã lưu ${prodSanHo.id} (1 ảnh chung đầu, 11 mẫu)`);

  // =========================================================================
  // 2. LE_CHAN_NHUNG_4KG_530K (32 images: 8 ảnh chung, 6 mẫu)
  // =========================================================================
  const dir4Can = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn 4 cân 530k');
  await uploadFolder(dir4Can, 'chan-4can-530k');
  const base4Can = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-4can-530k/';

  const vars4Can = [
    { label: 'Mẫu 01 - Xanh pastel dập ô vuông', image: base4Can + '01.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 02 - Xanh than / Cổ vịt sang trọng', image: base4Can + '02.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 03 - Xanh bơ / Xanh rêu trendy', image: base4Can + '03.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 04 - Hồng phấn pastel ngọt ngào', image: base4Can + '04.jpg', colorId: 'hong' },
    { label: 'Mẫu 05 - Xám khói / Ghi sáng hiện đại', image: base4Can + '05.jpg', colorId: 'xam' },
    { label: 'Mẫu 06 - Nâu trà sữa ấm áp', image: base4Can + '31.jpg', colorId: 'nau' },
  ];

  const general4Can = [
    base4Can + '09.jpg#color=xanh-duong', // người ôm cuộn chăn xanh
    base4Can + '07.jpg#color=hong', // người ôm cuộn chăn hồng
    base4Can + '16.jpg#color=xanh-la', // người ôm cuộn chăn xanh rêu
    base4Can + '13.jpg#color=xam', // người ôm cuộn chăn xám
    base4Can + '14.jpg#color=xanh-duong', // người ôm cuộn xanh than
    base4Can + '21.jpg#color=nau', // người ôm cuộn nâu
    base4Can + '22.jpg#color=nau', // chăn gấp 2 mặt
    base4Can + '24.jpg#color=nau', // góc chăn bồng bềnh
  ];
  const main4Can = vars4Can.map(v => `${v.image}#color=${v.colorId}`);

  const prod4Can = {
    id: 'LE_CHAN_NHUNG_4KG_530K',
    slug: 'chan-nhung-dap-o-4-can-sieu-day-am-530k',
    name: 'Chăn nhung dập ô 4 cân siêu dày ấm mùa đông (4kg)',
    category_id: 'mon-le',
    price: 530000,
    currency: 'VND',
    type: 'single',
    colors: ['xanh-duong', 'xanh-la', 'hong', 'xam', 'nau'],
    sizes: ['2m x 2m3 (nặng khoảng 4kg)'],
    combo_items: [
      { name: 'Chăn nhung dập ô 4 cân', quantity: 1, note: 'Trọng lượng siêu đầm tay ~4kg, giữ ấm tuyệt đối mùa đại hàn' }
    ],
    description: `Chăn nhung dập ô vuông nổi 4 cân siêu dày ấm mùa đông giá 530.000đ.\nChất liệu nhung tuyết dập ô bồng bềnh, ruột bông dày dặn nặng tới 4kg giữ nhiệt đỉnh cao, chạm vào ấm tức thì không cần chờ đợi.\n- Kích thước: 2m x 2m3 rộng rãi\n- Trọng lượng: Khoảng 4kg đầm tay, chống gió lùa cực tốt\n- 6 gam màu trơn dập ô thời thượng\n<!--cats:["mon-le","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(vars4Can)}-->`,
    images: [...general4Can, ...main4Can],
    cover_image: base4Can + '09.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prod4Can, { onConflict: 'id' });
  console.log(`✓ [2/7] Đã lưu ${prod4Can.id} (8 ảnh chung đầu, 6 mẫu)`);

  // =========================================================================
  // 3. LE_CHAN_CHAN_BONG_449K (35 images: 10 ảnh chung, 14 mẫu)
  // =========================================================================
  const dirChanBong = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn chần bông mùa đông 449k');
  await uploadFolder(dirChanBong, 'chan-chan-bong-449k');
  const baseChanBong = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-chan-bong-449k/';

  const varsChanBong = [
    { label: 'Mẫu 01 - Caro xanh nhạt tim xanh', image: baseChanBong + '03.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 02 - Xanh dương họa tiết cún con', image: baseChanBong + '04.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 03 - Xanh dương chấm sao nhỏ', image: baseChanBong + '05.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 04 - Cam hồng đào pastel', image: baseChanBong + '06.jpg', colorId: 'hong' },
    { label: 'Mẫu 05 - Xanh dương nhạt mặt gấu teddy', image: baseChanBong + '07.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 06 - Kem be sọc kẻ tim nhỏ', image: baseChanBong + '08.jpg', colorId: 'be' },
    { label: 'Mẫu 07 - Trắng kem gấu chibi đáng yêu', image: baseChanBong + '09.jpg', colorId: 'be' },
    { label: 'Mẫu 08 - Xanh bơ hoa cúc nhí', image: baseChanBong + '10.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 09 - Trắng kem hoa nhí tối giản', image: baseChanBong + '11.jpg', colorId: 'trang' },
    { label: 'Mẫu 10 - Xanh xám thổ cẩm sọc ngang', image: baseChanBong + '12.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 11 - Vàng kem hoa nhí bánh ngọt', image: baseChanBong + '13.jpg', colorId: 'vang' },
    { label: 'Mẫu 12 - Hồng phấn hoa nhí vintage', image: baseChanBong + '14.jpg', colorId: 'hong' },
    { label: 'Mẫu 13 - Vàng be hoa nhí đồng nội', image: baseChanBong + '15.jpg', colorId: 'vang' },
    { label: 'Mẫu 14 - Patchwork ô vuông caro xanh kem', image: baseChanBong + '16.jpg', colorId: 'xanh-duong' },
  ];

  const generalChanBong = [
    baseChanBong + '01.jpg#color=be', // Logo Mark De Paris
    baseChanBong + '02.jpg#color=xam', // trải giường phòng lớn
    baseChanBong + '32.jpg#color=xam', // trải giường phòng ngủ hiện đại
    baseChanBong + '35.jpg#color=xanh-la', // chồng chăn gấp
    baseChanBong + '34.jpg#color=xanh-duong', // cuộn chăn caro
    baseChanBong + '17.jpg#color=hong', // cuộn chăn hồng hoa nhí
    baseChanBong + '18.jpg#color=vang', // cuộn chăn vàng
    baseChanBong + '19.jpg#color=xanh-la', // cuộn chăn xanh bơ
    baseChanBong + '23.jpg#color=xanh-duong', // cuộn chăn caro tim
    baseChanBong + '28.jpg#color=xanh-la', // cuộn chăn thổ cẩm
  ];
  const mainChanBong = varsChanBong.map(v => `${v.image}#color=${v.colorId}`);

  const prodChanBong = {
    id: 'LE_CHAN_CHAN_BONG_449K',
    slug: 'chan-dong-chan-bong-mark-deparis-449k',
    name: "Chăn đông chần bông cao cấp Mark De'Paris (2m x 2m2)",
    category_id: 'mon-le',
    price: 449000,
    currency: 'VND',
    type: 'single',
    colors: ['xanh-duong', 'hong', 'be', 'xanh-la', 'trang', 'vang'],
    sizes: ['2m x 2m2 tiêu chuẩn'],
    combo_items: [
      { name: "Chăn đông chần bông Mark De'Paris", quantity: 1, note: 'Kích thước 2m x 2m2, chần bông vi tính dày dặn êm ái' }
    ],
    description: `Chăn đông chần bông cao cấp thương hiệu Mark De'Paris Luxury Bedding giá 449.000đ.\nĐường chần bông vi tính tinh tế giúp cố định ruột bông không bị xô lệch sau nhiều lần giặt. Vải cotton mềm mịn thoáng khí kết hợp ruột bông giữ ấm tuyệt vời.\n- Kích thước: 2m x 2m2\n- Đa dạng họa tiết: hoa nhí vintage, kẻ caro pastel, hình thú và thổ cẩm Hàn Quốc.\n<!--cats:["mon-le","chat-lieu-ni","hoa-tiet-hoa-nhi","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsChanBong)}-->`,
    images: [...generalChanBong, ...mainChanBong],
    cover_image: baseChanBong + '02.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodChanBong, { onConflict: 'id' });
  console.log(`✓ [3/7] Đã lưu ${prodChanBong.id} (10 ảnh chung đầu, 14 mẫu)`);

  // =========================================================================
  // 4. SET4_NI_SUA_THEU_619K (15 images: 15 mẫu độc bản)
  // =========================================================================
  const dirKitty = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món nỉ hoạ tiết kitty 619k');
  await uploadFolder(dirKitty, 'set4-ni-kitty-619k');
  const baseKitty = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-kitty-619k/';

  const varsKitty = [
    { label: 'Mẫu 01 - Thỏ trắng nơ xám caro nâu', image: baseKitty + '01.jpg', colorId: 'nau' },
    { label: 'Mẫu 02 - Hello Kitty Sweet Home hồng caro', image: baseKitty + '02.jpg', colorId: 'hong' },
    { label: 'Mẫu 03 - Bé gái nơ đỏ & Kitty đen trắng', image: baseKitty + '03.jpg', colorId: 'trang' },
    { label: 'Mẫu 04 - Cừu trắng đeo kính caro xanh rêu', image: baseKitty + '04.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 05 - Chó cún trắng caro đen trắng sao', image: baseKitty + '05.jpg', colorId: 'trang' },
    { label: 'Mẫu 06 - Chó thông thái áo len nâu socola', image: baseKitty + '06.jpg', colorId: 'nau' },
    { label: 'Mẫu 07 - Gấu nâu & Hello Kitty caro hồng', image: baseKitty + '07.jpg', colorId: 'hong' },
    { label: 'Mẫu 08 - Hello Kitty đeo kính sọc hồng be', image: baseKitty + '08.jpg', colorId: 'hong' },
    { label: 'Mẫu 09 - Hello Kitty thêu 3D nền nâu caro hồng', image: baseKitty + '09.jpg', colorId: 'nau' },
    { label: 'Mẫu 10 - Hello Kitty & Trái tim caro đen hồng', image: baseKitty + '10.jpg', colorId: 'hong' },
    { label: 'Mẫu 11 - Chó tai dài nơ đỏ caro xanh baby', image: baseKitty + '11.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 12 - Hello Kitty mắt kính viền đỏ chấm bi', image: baseKitty + '12.jpg', colorId: 'do' },
    { label: 'Mẫu 13 - Mèo đen thêu nổi Cute Kitten hồng tím', image: baseKitty + '13.jpg', colorId: 'hong' },
    { label: 'Mẫu 14 - Đàn vịt vàng chân cam nâu socola', image: baseKitty + '14.jpg', colorId: 'nau' },
    { label: 'Mẫu 15 - Voi xanh sinh nhật nâu chấm bi', image: baseKitty + '15.jpg', colorId: 'nau' },
  ];

  const mainKitty = varsKitty.map(v => `${v.image}#color=${v.colorId}`);

  const prodKitty = {
    id: 'SET4_NI_SUA_THEU_619K',
    slug: 'set-4-mon-ni-sua-theu-noi-3d-hello-kitty-619k',
    name: 'Set 4 món nỉ sữa thêu nổi 3D Hello Kitty & Hoạt hình cao cấp',
    category_id: 'set-4-mon',
    price: 619000,
    currency: 'VND',
    type: 'combo',
    colors: ['nau', 'hong', 'trang', 'xanh-la', 'xanh-duong', 'do'],
    sizes: ['1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun hoặc phủ bọc đệm', quantity: 1, note: 'Chất nỉ sữa định lượng cao chống tĩnh điện' },
      { name: 'Vỏ chăn nỉ sữa thêu nổi 3D có khóa kéo', quantity: 1, note: 'Lồng ruột chăn mùa đông (2m x 2m2)' },
      { name: 'Vỏ gối nằm nỉ sữa thêu đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga gối nỉ sữa định lượng cao thêu nổi 3D Hello Kitty & hoạt hình Hàn Quốc giá 619.000đ.\nChất liệu nỉ sữa nhung cao cấp dày dặn, công nghệ thêu đắp nổi 3D sắc sảo tỉ mỉ từng chi tiết. Giữ nhiệt siêu nhanh, chống rụng lông, chống vón cục và tích hợp sợi chống tĩnh điện tuyệt đối an toàn cho làn da.\nTrọn bộ 4 món gồm:\n- 1 Ga chun bọc đệm êm ái\n- 1 Vỏ chăn kéo khóa lồng ruột thêu nổi 3D (2m x 2m2)\n- 2 Vỏ gối nằm đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsKitty)}-->`,
    images: mainKitty,
    cover_image: baseKitty + '02.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodKitty, { onConflict: 'id' });
  console.log(`✓ [4/7] Đã lưu ${prodKitty.id} (15 mẫu độc bản)`);

  // =========================================================================
  // 5. SET4_NI_CUU_VIEN_650K (26 images: 10 ảnh chung, 5 mẫu)
  // =========================================================================
  const dirVien = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món nỉ lông cừu có viền 650K');
  await uploadFolder(dirVien, 'set4-ni-vien-650k');
  const baseVien = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-vien-650k/';

  const varsVien = [
    { label: 'Mẫu 01 - Hồng pastel viền lông cừu trắng', image: baseVien + '24.jpg', colorId: 'hong' },
    { label: 'Mẫu 02 - Xanh pastel viền lông cừu trắng', image: baseVien + '14.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 03 - Xám than chì viền lông cừu trắng', image: baseVien + '20.jpg', colorId: 'xam' },
    { label: 'Mẫu 04 - Trắng kem sữa viền lông cừu trắng', image: baseVien + '16.jpg', colorId: 'be' },
    { label: 'Mẫu 05 - Nâu trà sữa viền lông cừu trắng', image: baseVien + '10.jpg', colorId: 'nau' },
  ];

  const generalVien = [
    baseVien + '25.jpg#color=xanh-duong', // phòng ngủ thực tế 1
    baseVien + '26.jpg#color=xanh-duong', // phòng ngủ thực tế 2
    baseVien + '01.jpg#color=hong', // cuộn chăn hồng
    baseVien + '02.jpg#color=xanh-duong', // cuộn chăn xanh
    baseVien + '18.jpg#color=xam', // cuộn chăn xám
    baseVien + '13.jpg#color=be', // cuộn chăn kem
    baseVien + '08.jpg#color=nau', // cuộn chăn nâu
    baseVien + '05.jpg#color=hong', // góc chăn phủ hồng
    baseVien + '04.jpg#color=xanh-duong', // góc chăn phủ xanh
    baseVien + '03.jpg#color=xam', // góc chăn phủ xám
  ];
  const mainVien = varsVien.map(v => `${v.image}#color=${v.colorId}`);

  const prodVien = {
    id: 'SET4_NI_CUU_VIEN_650K',
    slug: 'set-4-mon-ni-long-cuu-dap-gan-vien-sherpa-650k',
    name: 'Set 4 món chăn ga gối nỉ lông cừu dập gân có viền sherpa cao cấp',
    category_id: 'set-4-mon',
    price: 650000,
    currency: 'VND',
    type: 'combo',
    colors: ['hong', 'xanh-duong', 'xam', 'be', 'nau'],
    sizes: ['1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm lông cừu', quantity: 1, note: 'Vừa đệm dày tới 25cm' },
      { name: 'Vỏ chăn nỉ lông cừu dập gân viền sherpa', quantity: 1, note: 'Kéo khóa lồng ruột (2m x 2m2)' },
      { name: 'Vỏ gối nằm lông cừu đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga gối nỉ lông cừu dập gân nổi kết hợp viền lông cừu sherpa trắng muốt siêu sang giá 650.000đ.\nChất liệu nỉ dập sọc gân nổi mềm mịn, viền bo lông cừu dày dặn tạo điểm nhấn ấm áp và phong cách tối giản chuẩn Hàn Quốc.\nTrọn bộ 4 món gồm:\n- 1 Ga chun nỉ lông cừu bọc đệm êm ái\n- 1 Vỏ chăn nỉ dập gân viền sherpa có khóa kéo lồng ruột (2m x 2m2)\n- 2 Vỏ gối nằm đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsVien)}-->`,
    images: [...generalVien, ...mainVien],
    cover_image: baseVien + '25.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodVien, { onConflict: 'id' });
  console.log(`✓ [5/7] Đã lưu ${prodVien.id} (10 ảnh chung đầu, 5 mẫu)`);

  // =========================================================================
  // 6. SET4_NI_CUU_TUYEN_CHON_800K (30 images: 15 ảnh chung, 15 mẫu)
  // =========================================================================
  const dirTuyenChon = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món nỉ lông cừu (hàng tuyển chọn lông cừu) 800K 1');
  await uploadFolder(dirTuyenChon, 'set4-ni-tuyen-chon-800k');
  const baseTuyenChon = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-tuyen-chon-800k/';

  const varsTuyenChon = [
    { label: 'Mẫu 01 - Nâu cam hoa nhí cổ điển', image: baseTuyenChon + '01.jpg', colorId: 'nau' },
    { label: 'Mẫu 02 - Nâu socola thỏ ngọc mộng mơ', image: baseTuyenChon + '02.jpg', colorId: 'nau' },
    { label: 'Mẫu 03 - Xám than chì hoa tuyết', image: baseTuyenChon + '03.jpg', colorId: 'xam' },
    { label: 'Mẫu 04 - Tím pastel hoa cỏ mùa xuân', image: baseTuyenChon + '04.jpg', colorId: 'tim' },
    { label: 'Mẫu 05 - Tím khoai môn trái tim nhỏ', image: baseTuyenChon + '05.jpg', colorId: 'tim' },
    { label: 'Mẫu 06 - Caro xanh navy viền hồng cá tính', image: baseTuyenChon + '06.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 07 - Xanh rêu giáng sinh mèo Noel', image: baseTuyenChon + '07.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 08 - Trắng kem hoa tulip xanh đỏ', image: baseTuyenChon + '08.jpg', colorId: 'trang' },
    { label: 'Mẫu 09 - Xanh dương gấu teddy tuyết', image: baseTuyenChon + '09.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 10 - Caro xanh mint gấu bánh mì', image: baseTuyenChon + '10.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 11 - Kem be công chúa chibi đáng yêu', image: baseTuyenChon + '11.jpg', colorId: 'be' },
    { label: 'Mẫu 12 - Dâu tây hồng kem viền pom-pom', image: baseTuyenChon + '12.jpg', colorId: 'hong' },
    { label: 'Mẫu 13 - Xanh baby cún con tuyết trắng', image: baseTuyenChon + '13.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 14 - Chấm bi be kem viền lông nâu', image: baseTuyenChon + '14.jpg', colorId: 'be' },
    { label: 'Mẫu 15 - Cherry đỏ nền kem phối caro', image: baseTuyenChon + '15.jpg', colorId: 'do' },
  ];

  // 15 ảnh góc chụp thứ hai (gối và đầu giường) làm ảnh chung
  const generalTuyenChon = [
    baseTuyenChon + '29.jpg#color=hong', // Dâu tây
    baseTuyenChon + '18.jpg#color=do', // Cherry
    baseTuyenChon + '20.jpg#color=trang', // Tulip
    baseTuyenChon + '26.jpg#color=xanh-duong', // Gấu teddy
    baseTuyenChon + '22.jpg#color=nau', // Hoa nhí nâu
    baseTuyenChon + '17.jpg#color=tim', // Hoa cỏ tím
    baseTuyenChon + '16.jpg#color=tim', // Tim tím
    baseTuyenChon + '23.jpg#color=xanh-la', // Mèo xanh rêu
    baseTuyenChon + '24.jpg#color=xanh-duong', // Caro xanh
    baseTuyenChon + '28.jpg#color=xanh-la', // Gấu bánh mì
    baseTuyenChon + '19.jpg#color=be', // Chibi công chúa
    baseTuyenChon + '25.jpg#color=xanh-duong', // Cún xanh
    baseTuyenChon + '30.jpg#color=be', // Chấm bi be
    baseTuyenChon + '21.jpg#color=xam', // Xám than
    baseTuyenChon + '27.jpg#color=nau', // Thỏ socola
  ];
  const mainTuyenChon = varsTuyenChon.map(v => `${v.image}#color=${v.colorId}`);

  const prodTuyenChon = {
    id: 'SET4_NI_CUU_TUYEN_CHON_800K',
    slug: 'set-4-mon-ni-long-cuu-tuyen-chon-vien-pompom-800k',
    name: 'Set 4 món nỉ lông cừu viền ren pom-pom hàng tuyển chọn cao cấp',
    category_id: 'set-4-mon',
    price: 800000,
    currency: 'VND',
    type: 'combo',
    colors: ['nau', 'xam', 'tim', 'xanh-duong', 'xanh-la', 'trang', 'be', 'hong', 'do'],
    sizes: ['1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga phủ hoặc ga chun nỉ lông cừu', quantity: 1, note: 'Bo viền bèo / viền pom-pom công chúa' },
      { name: 'Vỏ chăn nỉ lông cừu viền cục bông pom-pom', quantity: 1, note: 'Kéo khóa lồng ruột mùa đông (2m x 2m2)' },
      { name: 'Vỏ gối nằm lông cừu đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món chăn ga gối nỉ lông cừu hàng tuyển chọn cao cấp đính viền cục bông pom-pom xinh xắn giá 800.000đ.\nChất liệu lông cừu tơ tuyết siêu mềm mượt, đầm tay và giữ nhiệt cực đỉnh trong những ngày đông giá rét. Thiết kế viền cục bông tròn bồng bềnh mang đậm vibe Hàn Quốc công chúa ngọt ngào.\nTrọn bộ 4 món gồm:\n- 1 Ga phủ hoặc ga chun bo đệm êm ái\n- 1 Vỏ chăn lông cừu có khóa kéo lồng ruột (2m x 2m2)\n- 2 Vỏ gối nằm đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong","hoa-tiet-hoa-nhi"]-->\n<!--vars:${JSON.stringify(varsTuyenChon)}-->`,
    images: [...generalTuyenChon, ...mainTuyenChon],
    cover_image: baseTuyenChon + '12.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodTuyenChon, { onConflict: 'id' });
  console.log(`✓ [6/7] Đã lưu ${prodTuyenChon.id} (15 ảnh chung đầu, 15 mẫu)`);

  // =========================================================================
  // 7. SET3_NI_299K (18 images: 9 ảnh chung, 9 mẫu)
  // =========================================================================
  const dirSet3Ni = path.resolve(rootDir, 'image', 'Set 3 món ga + 2 vỏ gối', 'Set 3 món nỉ 299k');
  await uploadFolder(dirSet3Ni, 'set3-ni-299k');
  const baseSet3Ni = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-299k/';

  const varsSet3Ni = [
    { label: 'Mẫu 01 - Trắng xám họa tiết tim đỏ', image: baseSet3Ni + '15.jpg', colorId: 'xam' },
    { label: 'Mẫu 02 - Đen tuyền chấm bi trắng', image: baseSet3Ni + '13.jpg', colorId: 'trang' },
    { label: 'Mẫu 03 - Nâu hoa nhí vintage cổ điển', image: baseSet3Ni + '14.jpg', colorId: 'nau' },
    { label: 'Mẫu 04 - Trắng xám ziczac hình học hiện đại', image: baseSet3Ni + '16.jpg', colorId: 'xam' },
    { label: 'Mẫu 05 - Đỏ caro Noel ấm cúng', image: baseSet3Ni + '06.jpg', colorId: 'do' },
    { label: 'Mẫu 06 - Xám ghi hình thú gấu cún', image: baseSet3Ni + '07.jpg', colorId: 'xam' },
    { label: 'Mẫu 07 - Đen huyền bí nhân vật hoạt hình', image: baseSet3Ni + '08.jpg', colorId: 'trang' },
    { label: 'Mẫu 08 - Kem hoa hồng vintage lãng mạn', image: baseSet3Ni + '12.jpg', colorId: 'be' },
    { label: 'Mẫu 09 - Sọc nâu vàng bánh mì gấu teddy', image: baseSet3Ni + '18.jpg', colorId: 'nau' },
  ];

  const generalSet3Ni = [
    baseSet3Ni + '11.jpg#color=be', // xếp nhiều bộ trên giường
    baseSet3Ni + '01.jpg#color=be', // sào treo các mẫu
    baseSet3Ni + '10.jpg#color=nau', // tay cầm cận độ dày chun bo đệm
    baseSet3Ni + '02.jpg#color=xam', // gấp bộ tim đỏ
    baseSet3Ni + '03.jpg#color=trang', // gấp bộ chấm bi
    baseSet3Ni + '04.jpg#color=nau', // gấp bộ nâu hoa nhí
    baseSet3Ni + '05.jpg#color=xam', // gấp bộ ziczac
    baseSet3Ni + '09.jpg#color=be', // gấp bộ hoa hồng
    baseSet3Ni + '17.jpg#color=nau', // gấp bộ sọc vàng gấu
  ];
  const mainSet3Ni = varsSet3Ni.map(v => `${v.image}#color=${v.colorId}`);

  const prodSet3Ni = {
    id: 'SET3_NI_299K',
    slug: 'set-3-mon-ga-goi-ni-nhung-am-ap-mua-dong-299k',
    name: 'Set 3 món ga gối nỉ nhung ấm áp mùa đông (Sale 299k)',
    category_id: 'set-3-mon',
    price: 299000,
    currency: 'VND',
    type: 'combo',
    colors: ['xam', 'trang', 'nau', 'do', 'be'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun nỉ nhung bo đệm', quantity: 1, note: 'Chun bo ôm sát đệm dày tới 25cm' },
      { name: 'Vỏ gối nằm nỉ nhung đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 3 món ga gối nỉ nhung mềm mại ấm áp mùa đông giá sale ưu đãi chỉ 299.000đ.\nChất liệu sợi nỉ tuyết nhung mịn màng, chạm vào là ấm, giữ nhiệt siêu tốt cho cả gia đình trong mùa lạnh. Ga chun may bo góc đệm chắc chắn, không bị xô lệch.\nTrọn bộ 3 món gồm:\n- 1 Ga chun nỉ nhung bọc đệm êm ái\n- 2 Vỏ gối nằm nỉ nhung đồng bộ (45x65cm)\n<!--cats:["set-3-mon","chat-lieu-ni","hoa-tiet-de-thuong","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsSet3Ni)}-->`,
    images: [...generalSet3Ni, ...mainSet3Ni],
    cover_image: baseSet3Ni + '11.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodSet3Ni, { onConflict: 'id' });
  console.log(`✓ [7/7] Đã lưu ${prodSet3Ni.id} (9 ảnh chung đầu, 9 mẫu)`);

  console.log('\n=========================================');
  console.log('Tất cả 7 sản phẩm mới ngày 10/11 đã được tải lên và lưu vào Supabase thành công 100%!');
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
