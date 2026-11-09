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
  console.log('Starting upload and product creation for 5 Winter Products...');

  // =========================================================================
  // 1. SET5_NI_NHUNG_1599K (10 images)
  // =========================================================================
  const dirSet5 = path.resolve(rootDir, 'image', 'Set 5 món cao cấp nỉ Nhung Hàn Quốc 1599k');
  const urlsSet5 = await uploadFolder(dirSet5, 'set5-ni-nhung-1599k');
  const baseSet5 = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set5-ni-nhung-1599k/';

  const varsSet5 = [
    { label: 'Mẫu 01 - Trắng kem sữa Hàn Quốc', image: baseSet5 + '08.jpg', colorId: 'be' },
    { label: 'Mẫu 02 - Hồng phấn pastel ngọt ngào', image: baseSet5 + '05.jpg', colorId: 'hong' },
    { label: 'Mẫu 03 - Tím khoai môn pastel mộng mơ', image: baseSet5 + '06.jpg', colorId: 'tim' },
    { label: 'Mẫu 04 - Xanh bơ / Xanh rêu trendy', image: baseSet5 + '07.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 05 - Xám khói / Ghi sáng thanh lịch', image: baseSet5 + '04.jpg', colorId: 'xam' },
    { label: 'Mẫu 06 - Than chì / Xám đậm sang trọng', image: baseSet5 + '03.jpg', colorId: 'xam' },
    { label: 'Mẫu 07 - Đỏ rượu vang quý phái', image: baseSet5 + '09.jpg', colorId: 'do' },
    { label: 'Mẫu 08 - Nâu tây thời thượng', image: baseSet5 + '10.jpg', colorId: 'nau' },
  ];

  const mainImgsSet5 = varsSet5.map(v => `${v.image}#color=${v.colorId}`);
  const extraImgsSet5 = [
    baseSet5 + '01.jpg#color=be', // ảnh chung chồng chăn
    baseSet5 + '02.jpg#color=be', // ảnh chung giường chăn cuộn
  ];

  const prodSet5 = {
    id: 'SET5_NI_NHUNG_1599K',
    slug: 'set-5-mon-cao-cap-ni-nhung-kim-sa-han-quoc-1599k',
    name: 'Set 5 món cao cấp nỉ nhung kim sa Hàn Quốc (Kèm túi da sang trọng)',
    category_id: 'set-4-mon',
    price: 1599000,
    currency: 'VND',
    type: 'combo',
    colors: ['be', 'hong', 'tim', 'xanh-la', 'xam', 'do', 'nau'],
    sizes: ['1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Chăn trần mỏng lồng ruột', quantity: 1, note: 'Dùng riêng mùa thu mát, lồng ruột kéo khóa mùa đông' },
      { name: 'Ga trần bông êm ái viền bèo', quantity: 1, note: 'Trần bông cả mặt ga, viền bèo rủ công chúa' },
      { name: 'Vỏ gối trần đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm viền bèo' },
      { name: 'Vỏ gối ôm trần xinh xắn', quantity: 1, note: 'Gối ôm tròn đồng bộ' },
      { name: 'Túi da đựng cao cấp', quantity: 1, note: 'Túi xách da đựng quà tặng sang trọng' }
    ],
    description: `KOREAN MOOD ♡ | NỈ NHUNG KIM SA QUILT\nMột chút Hàn Quốc, một chút ngọt ngào, đủ để căn phòng trở nên thật xinh! 🎀\n8 gam màu trendy – màu nào cũng đẹp, mỗi màu một nét riêng, trẻ trung mà vẫn rất sang.\nChất nỉ nhung kim sa mềm mịn, óng nhẹ, kết hợp những đường trần tinh tế cùng viền bèo xinh xắn, mang đến cảm giác ấm áp và nữ tính.\nTrọn bộ 5 chi tiết:\n♡ 1 chăn trần mỏng – dùng riêng khi trời mát, có thể lồng thêm ruột khi trời lạnh (2m x 2m2)\n♡ 1 ga trần bông êm ái bo viền bèo\n♡ 2 vỏ gối trần đồng bộ (45x65cm)\n♡ 1 vỏ gối ôm trần xinh xắn\n👜 Đặc biệt, bộ sản phẩm đi kèm túi da đựng cao cấp, chỉn chu từ bên ngoài đến từng chi tiết bên trong.\n<!--cats:["set-4-mon","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsSet5)}-->`,
    images: [...mainImgsSet5, ...extraImgsSet5],
    cover_image: baseSet5 + '08.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodSet5, { onConflict: 'id' });
  console.log(`✓ [1/5] Đã lưu ${prodSet5.id} (8 mẫu, 2 ảnh chung)`);

  // =========================================================================
  // 2. SET4_NI_SUA_CUU_600K (16 images)
  // =========================================================================
  const dirSet4Sua = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món nỉ sữa cừu 600k');
  const urlsSet4Sua = await uploadFolder(dirSet4Sua, 'set4-ni-sua-cuu-600k');
  const baseSet4Sua = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-ni-sua-cuu-600k/';

  const varsSet4Sua = [
    { label: 'Mẫu 01 - Cún con sọc nâu be', image: baseSet4Sua + '02.jpg', colorId: 'nau' },
    { label: 'Mẫu 02 - Gấu mũ đỏ xanh rêu vintage', image: baseSet4Sua + '03.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 03 - Hello Kitty kẻ sọc nâu xanh', image: baseSet4Sua + '04.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 04 - Gấu bánh ngọt caro nâu xám', image: baseSet4Sua + '05.jpg', colorId: 'nau' },
    { label: 'Mẫu 05 - Gấu Hello Bear sọc xanh trắng', image: baseSet4Sua + '06.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 06 - Chibi búp bê nhí kem be', image: baseSet4Sua + '07.jpg', colorId: 'be' },
    { label: 'Mẫu 07 - Gấu Teddy sọc đỏ kem', image: baseSet4Sua + '08.jpg', colorId: 'do' },
    { label: 'Mẫu 08 - Mèo thần tài Lucky Cat sọc màu', image: baseSet4Sua + '09.jpg', colorId: 'trang' },
    { label: 'Mẫu 09 - Thổ cẩm Bắc Âu cún trắng xanh xám', image: baseSet4Sua + '10.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 10 - Patchwork đa sắc tím hồng xanh', image: baseSet4Sua + '11.jpg', colorId: 'tim' },
    { label: 'Mẫu 11 - Hoa nhí tím vintage mộng mơ', image: baseSet4Sua + '12.jpg', colorId: 'tim' },
    { label: 'Mẫu 12 - Cún trắng caro xám ghi', image: baseSet4Sua + '13.jpg', colorId: 'xam' },
    { label: 'Mẫu 13 - Gấu Teddy & Táo đỏ kem be', image: baseSet4Sua + '14.jpg', colorId: 'be' },
    { label: 'Mẫu 14 - Chim cánh cụt caro hồng mận', image: baseSet4Sua + '15.jpg', colorId: 'hong' },
    { label: 'Mẫu 15 - Cún con puppy sọc xanh kem', image: baseSet4Sua + '16.jpg', colorId: 'xanh-duong' },
  ];

  const mainImgsSet4Sua = varsSet4Sua.map(v => `${v.image}#color=${v.colorId}`);
  const extraImgsSet4Sua = [
    baseSet4Sua + '01.jpg#color=be', // ảnh cận cảnh chất vải lông cừu 2 mặt
  ];

  const prodSet4Sua = {
    id: 'SET4_NI_SUA_CUU_600K',
    slug: 'set-4-mon-chan-ga-goi-ni-sua-cuu-hai-mat-600k',
    name: 'Set 4 món chăn ga gối nỉ sữa cừu hai mặt cao cấp',
    category_id: 'set-4-mon',
    price: 600000,
    currency: 'VND',
    type: 'combo',
    colors: ['nau', 'xanh-la', 'xanh-duong', 'be', 'do', 'trang', 'tim', 'xam', 'hong'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga trải giường freesize bọc đệm', quantity: 1, note: 'Chất lông cừu sữa êm ái bo đệm dày tới 25cm' },
      { name: 'Vỏ chăn có khóa kéo lồng ruột', quantity: 1, note: 'Lông cừu 2 mặt siêu ấm 2m x 2m2' },
      { name: 'Vỏ gối nằm nỉ cừu đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Bộ 4 món nỉ sữa cừu cao cấp phong cách Hàn Quốc hoà quyện cùng thế giới cổ tích tạo nên sự mix match vừa đáng yêu, vừa gần gũi lại hết sức hiện đại và thời trang.\nChất lông cừu sữa hai mặt tiêu chuẩn giúp cảm nhận cái ấm tức thì ngay khi chạm, giữ nhiệt vỗ về giấc ngủ suốt đêm.\nSử dụng công nghệ mới tích hợp các sợi dẫn điện để làm giảm hiện tượng tĩnh điện trong mùa hanh khô, giúp bạn thoải mái tận hưởng sự ấm áp một cách trọn vẹn nhất.\nTrọn bộ 4 món gồm:\n• 1 Ga trải giường freesize bọc đệm theo kích thước\n• 1 Vỏ chăn có khoá kéo lồng ruột (2m x 2m2)\n• 2 Vỏ gối nằm đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsSet4Sua)}-->`,
    images: [...mainImgsSet4Sua, ...extraImgsSet4Sua],
    cover_image: baseSet4Sua + '08.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodSet4Sua, { onConflict: 'id' });
  console.log(`✓ [2/5] Đã lưu ${prodSet4Sua.id} (15 mẫu, 1 ảnh chung)`);

  // =========================================================================
  // 3. SET4_LONG_CUU_500K (15 images)
  // =========================================================================
  const dirSet4LongCuu = path.resolve(rootDir, 'image', 'Set 4 món có chăn', 'Set 4 món vơ chăn lông cừu 2 mặt 500k');
  const urlsSet4LongCuu = await uploadFolder(dirSet4LongCuu, 'set4-long-cuu-500k');
  const baseSet4LongCuu = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set4-long-cuu-500k/';

  const varsSet4LongCuu = [
    { label: 'Mẫu 01 - Gấu nâu be Teddy Bear', image: baseSet4LongCuu + '01.jpg', colorId: 'nau' },
    { label: 'Mẫu 02 - Hoa nhí thỏ hồng vintage', image: baseSet4LongCuu + '02.jpg', colorId: 'hong' },
    { label: 'Mẫu 03 - Sọc kẻ tím trắng thỏ ngọc', image: baseSet4LongCuu + '03.jpg', colorId: 'tim' },
    { label: 'Mẫu 04 - Hoa cỏ xanh pastel cún con', image: baseSet4LongCuu + '04.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 05 - Chấm bi sao nhỏ xanh dương pastel', image: baseSet4LongCuu + '05.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 06 - Thổ cẩm mèo con xanh dương', image: baseSet4LongCuu + '06.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 07 - Caro vàng cún con đáng yêu', image: baseSet4LongCuu + '07.jpg', colorId: 'vang' },
    { label: 'Mẫu 08 - Sọc vàng kem gấu nhỏ', image: baseSet4LongCuu + '08.jpg', colorId: 'vang' },
    { label: 'Mẫu 09 - Sọc kẻ xanh dương nơ & gấu', image: baseSet4LongCuu + '09.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 10 - Sọc kẻ nâu be cún con', image: baseSet4LongCuu + '10.jpg', colorId: 'nau' },
    { label: 'Mẫu 11 - Đốm tim be gấu teddy', image: baseSet4LongCuu + '11.jpg', colorId: 'be' },
    { label: 'Mẫu 12 - Ngôi sao xanh dương gấu nhỏ', image: baseSet4LongCuu + '12.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 13 - Cừu bông mây trắng xanh dương', image: baseSet4LongCuu + '13.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 14 - Gấu nâu nền be phối chăn xanh', image: baseSet4LongCuu + '14.jpg', colorId: 'be' },
    { label: 'Mẫu 15 - Xanh mint hoa nhí gấu bông', image: baseSet4LongCuu + '15.jpg', colorId: 'xanh-la' },
  ];

  const mainImgsSet4LongCuu = varsSet4LongCuu.map(v => `${v.image}#color=${v.colorId}`);

  const prodSet4LongCuu = {
    id: 'SET4_LONG_CUU_500K',
    slug: 'set-4-mon-chan-ga-goi-long-cuu-2-mat-500k',
    name: 'Set 4 món chăn ga gối lông cừu 2 mặt họa tiết dễ thương',
    category_id: 'set-4-mon',
    price: 500000,
    currency: 'VND',
    type: 'combo',
    colors: ['nau', 'hong', 'tim', 'xanh-la', 'xanh-duong', 'vang', 'be'],
    sizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'],
    combo_items: [
      { name: 'Ga chun bọc đệm lông cừu', quantity: 1, note: 'Vừa đệm dày tới 20cm hoặc may theo yêu cầu' },
      { name: 'Vỏ chăn lông cừu 2 mặt có khóa kéo', quantity: 1, note: 'Lồng ruột chăn mùa đông (2m x 2m2)' },
      { name: 'Vỏ gối nằm lông cừu đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
    ],
    description: `Set 4 món vỏ chăn ga gối lông cừu 2 mặt siêu mềm mịn và giữ nhiệt cực ấm giá 500.000đ. Chất liệu lông cừu 2 mặt cao cấp mềm mượt, sờ vào ấm ngay, không rụng lông, không tích điện trong mùa lạnh. Đa dạng họa tiết phong cách Hàn Quốc cực đáng yêu: gấu teddy, thỏ ngọc, cún con snoopy, hoa nhí và kẻ caro pastel.\nTrọn bộ 4 món gồm:\n- 1 Ga chun bọc đệm êm ái (vừa đệm dày tới 20cm)\n- 1 Vỏ chăn lông cừu 2 mặt có khóa kéo lồng ruột (2m x 2m2)\n- 2 Vỏ gối nằm lông cừu đồng bộ (45x65cm)\n<!--cats:["set-4-mon","chat-lieu-ni","hoa-tiet-de-thuong","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsSet4LongCuu)}-->`,
    images: mainImgsSet4LongCuu,
    cover_image: baseSet4LongCuu + '01.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodSet4LongCuu, { onConflict: 'id' });
  console.log(`✓ [3/5] Đã lưu ${prodSet4LongCuu.id} (15 mẫu)`);

  // =========================================================================
  // 4. LE_CHAN_KING_SIZE_600K (33 images)
  // =========================================================================
  const dirKing = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn nỉ lông cừu King size siêu rộng');
  const urlsKing = await uploadFolder(dirKing, 'chan-king-size-600k');
  const baseKing = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-king-size-600k/';

  const varsKing = [
    { label: 'Mẫu 01 - Nâu cam đào ấm áp (Orange Tan)', image: baseKing + '04.jpg', colorId: 'nau' },
    { label: 'Mẫu 02 - Xám than chì / Ghi chuột đậm', image: baseKing + '13.jpg', colorId: 'xam' },
    { label: 'Mẫu 03 - Ghi sáng / Xám khói sang trọng', image: baseKing + '17.jpg', colorId: 'xam' },
    { label: 'Mẫu 04 - Xanh navy / Xanh than quý phái', image: baseKing + '20.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 05 - Xanh rêu / Xanh ô liu thời thượng', image: baseKing + '27.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 06 - Xanh xám khói / Dusty Blue', image: baseKing + '25.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 07 - Đỏ rượu vang / Đỏ đô Ruby', image: baseKing + '31.jpg', colorId: 'do' },
  ];

  const mainImgsKing = varsKing.map(v => `${v.image}#color=${v.colorId}`);
  const extraImgsKing = [
    baseKing + '02.jpg#color=nau', // trải giường
    baseKing + '33.jpg#color=xanh-la', // kệ đèn LED đủ 7 màu
    baseKing + '01.jpg#color=be', // túi da
    baseKing + '07.jpg#color=be', // tag da tem mác
    baseKing + '03.jpg#color=nau', // cuộn cam đào
    baseKing + '12.jpg#color=xam', // chồng xám đậm
    baseKing + '14.jpg#color=xam', // cuộn xám đậm
    baseKing + '15.jpg#color=xam', // chồng ghi sáng
    baseKing + '32.jpg#color=xam', // cuộn ghi sáng
    baseKing + '18.jpg#color=xanh-duong', // chồng xanh navy
    baseKing + '24.jpg#color=xanh-duong', // cuộn xanh navy
    baseKing + '21.jpg#color=xanh-la', // cuộn xanh rêu
    baseKing + '22.jpg#color=xanh-la', // chồng xanh rêu
    baseKing + '23.jpg#color=xanh-duong', // chồng xanh khói
    baseKing + '29.jpg#color=do', // chồng đỏ rượu
    baseKing + '30.jpg#color=do', // cuộn đỏ rượu
    baseKing + '05.jpg#color=be', // kệ giá trắng
    baseKing + '06.jpg#color=be',
    baseKing + '08.jpg#color=be', // kho hàng
    baseKing + '09.jpg#color=be',
    baseKing + '10.jpg#color=be',
    baseKing + '11.jpg#color=be',
    baseKing + '16.jpg#color=be',
    baseKing + '19.jpg#color=be',
    baseKing + '26.jpg#color=be',
    baseKing + '28.jpg#color=be',
  ];

  const prodKing = {
    id: 'LE_CHAN_KING_SIZE_600K',
    slug: 'chan-tuyet-long-cuu-freemond-king-size-248x233-600k',
    name: 'Chăn tuyết lông cừu Freemond King Size siêu rộng (2m48 x 2m33 - 3.5kg)',
    category_id: 'mon-le',
    price: 600000,
    currency: 'VND',
    type: 'single',
    colors: ['nau', 'xam', 'xanh-duong', 'xanh-la', 'do'],
    sizes: ['2m48 x 2m33 (King Size)'],
    combo_items: [
      { name: 'Chăn tuyết lông cừu King Size', quantity: 1, note: 'Kích thước siêu rộng 248 x 233cm, nặng 3.5kg' },
      { name: 'Túi xách da Freemond', quantity: 1, note: 'Túi bảo quản sang trọng chính hãng' }
    ],
    description: `Chăn tuyết lông cừu cao cấp Freemond Home Collection phiên bản KING SIZE SIÊU RỘNG giá 600.000đ.\n🐰 KING SIZE SIÊU RỘNG, mềm và mượt không hề rụng tẹo lông nào, chăn siêu rộng đắp cả gia đình cực kỳ ấm áp và thoải mái trong mùa đông.\n📏 Kích thước: 248cm × 233cm (King Size siêu rộng)\n⚖️ Trọng lượng: Khoảng 3,5kg dày dặn, đầm ấm, giữ nhiệt tuyệt đối\n👜 Đi kèm túi xách da Freemond sang trọng làm quà tặng hoặc bảo quản tiện lợi.\n7 gam màu trơn trendy chuẩn phong cách châu Âu.\n<!--cats:["mon-le","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsKing)}-->`,
    images: [...mainImgsKing, ...extraImgsKing],
    cover_image: baseKing + '02.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodKing, { onConflict: 'id' });
  console.log(`✓ [4/5] Đã lưu ${prodKing.id} (7 mẫu, 26 ảnh chung)`);

  // =========================================================================
  // 5. LE_CHAN_DONG_XUAT_HAN (9 images)
  // =========================================================================
  const dirXuatHan = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn đông xuất hàn');
  const urlsXuatHan = await uploadFolder(dirXuatHan, 'chan-dong-xuat-han');
  const baseXuatHan = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-dong-xuat-han/';

  const varsXuatHan = [
    { label: 'Mẫu 01 - Nâu be ấm áp (Korean Beige)', image: baseXuatHan + '07.jpg', colorId: 'be' },
    { label: 'Mẫu 02 - Xanh than hiện đại (Navy Blue)', image: baseXuatHan + '08.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 03 - Ghi xám thanh lịch (Classic Grey)', image: baseXuatHan + '09.jpg', colorId: 'xam' },
  ];

  const mainImgsXuatHan = varsXuatHan.map(v => `${v.image}#color=${v.colorId}`);
  const extraImgsXuatHan = [
    baseXuatHan + '01.jpg#color=be', // kệ trưng bày
    baseXuatHan + '02.jpg#color=be', // kệ trưng bày và túi đựng
    baseXuatHan + '03.jpg#color=be',
    baseXuatHan + '04.jpg#color=be', // cuộn chăn nâu be
    baseXuatHan + '05.jpg#color=xanh-duong', // cuộn chăn xanh than
    baseXuatHan + '06.jpg#color=xam', // cuộn chăn ghi xám
  ];

  const prodXuatHan = {
    id: 'LE_CHAN_DONG_XUAT_HAN',
    slug: 'chan-tuyet-dong-xuat-han-dap-gan-korea-home',
    name: 'Chăn tuyết đông xuất Hàn dập gân cao cấp Korea Home',
    category_id: 'mon-le',
    price: 350000,
    currency: 'VND',
    type: 'single',
    colors: ['be', 'xanh-duong', 'xam'],
    sizes: ['2m x 2m3 tiêu chuẩn'],
    combo_items: [
      { name: 'Chăn tuyết đông xuất Hàn dập gân', quantity: 1, note: 'Kích thước 2m x 2m3, lót lông cừu giữ nhiệt' },
      { name: 'Túi đựng tròn quai xách xuất Hàn', quantity: 1, note: 'Túi đựng chính hãng tiện lợi' }
    ],
    description: `Chăn tuyết đông xuất Hàn cao cấp Korea Home thiết kế dập gân sọc nổi sang trọng giá 350.000đ.\nChất liệu nhung tuyết mềm mại tuyệt đối, lót lông giữ nhiệt siêu tốt, bền bỉ không lo xù lông hay phai màu.\n- Kích thước: 2m x 2m3 tiêu chuẩn\n- Ấm áp như cái ôm từ Hàn Quốc, thích hợp cho thời tiết lạnh thu đông\n- Đi kèm túi đựng tròn quai xách phong cách Hàn Quốc\n- 3 gam màu dập gân thời thượng: Nâu be, Xanh than, Ghi xám\n<!--cats:["mon-le","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsXuatHan)}-->`,
    images: [...mainImgsXuatHan, ...extraImgsXuatHan],
    cover_image: baseXuatHan + '07.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodXuatHan, { onConflict: 'id' });
  console.log(`✓ [5/5] Đã lưu ${prodXuatHan.id} (3 mẫu, 6 ảnh chung)`);

  console.log('\n=========================================');
  console.log('Tất cả 5 sản phẩm nỉ mùa đông đã được tải lên và lưu vào Supabase thành công 100%!');
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
