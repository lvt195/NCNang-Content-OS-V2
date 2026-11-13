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
  // 1. PRODUCT 1: Ruột chăn lông vũ nhân tạo Microfiber 9D Swan 699k
  const dirSwan = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn lông vũ nhân tạo Microfilber 9D 699k');
  await uploadFolder(dirSwan, 'chan-long-vu-swan-699k');
  const baseSwan = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-long-vu-swan-699k/';

  const varsSwan = [
    { label: 'Mẫu 01 - Tím pastel Lavender', image: baseSwan + '01.jpg', colorId: 'tim' },
    { label: 'Mẫu 02 - Xanh băng Ice Blue', image: baseSwan + '05.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 03 - Hồng pastel ngọt ngào', image: baseSwan + '08.jpg', colorId: 'hong' },
    { label: 'Mẫu 04 - Ghi xám pastel hiện đại', image: baseSwan + '13.jpg', colorId: 'xam' },
    { label: 'Mẫu 05 - Trắng kem / Vàng sữa tinh tế', image: baseSwan + '18.jpg', colorId: 'trang' },
  ];

  // 10 ảnh chi tiết bối cảnh tổng quan (<= 2 * 5 mẫu) đẩy lên đầu
  const generalSwan = [
    baseSwan + '11.jpg#color=hong', // cận tay cầm viền bo & tem góc
    baseSwan + '06.jpg#color=xanh-duong', // cận thêu nổi thiên nga Swan xanh
    baseSwan + '09.jpg#color=hong', // cận thêu nổi Swan hồng
    baseSwan + '17.jpg#color=trang', // cận thêu nổi Swan trắng kem
    baseSwan + '02.jpg#color=tim', // cận ô phao phồng tím
    baseSwan + '12.jpg#color=hong', // cuộn gấp trên giường hồng
    baseSwan + '16.jpg#color=xam', // cuộn gấp trên giường xám
    baseSwan + '21.jpg#color=trang', // cuộn gấp trên giường trắng kem
    baseSwan + '04.jpg#color=tim', // chính diện giường tím
    baseSwan + '15.jpg#color=xam', // chính diện giường xám
  ];
  const mainSwan = varsSwan.map(v => `${v.image}#color=${v.colorId}`);

  const prodSwan = {
    id: 'LE_CHAN_LONG_VU_SWAN_699K',
    slug: 'ruot-chan-long-vu-nhan-tao-swan-microfiber-9d-cao-cap',
    name: 'Ruột chăn lông vũ nhân tạo Microfiber 9D Swan cao cấp (2m x 2m3 - 3kg)',
    category_id: 'mon-le',
    price: 699000,
    currency: 'VND',
    type: 'single',
    colors: ['tim', 'xanh-duong', 'hong', 'xam', 'trang'],
    sizes: ['2m x 2m3 tiêu chuẩn (nặng 3kg)'],
    combo_items: [
      {
        name: 'Ruột chăn lông vũ nhân tạo Microfiber 9D Swan',
        quantity: 1,
        note: 'Kích thước 200x230cm, nặng 3kg, có đai dây cố định 4 góc'
      }
    ],
    description: `Ruột chăn lông vũ nhân tạo cao cấp Swan 🦢🦢🦢 giá sale 699.000đ.\n- Đỉnh cao của sự mềm mại, độ bồng bềnh và độ đàn hồi siêu êm ái.\n- Ruột chăn làm từ sợi bông Microfiber 9D mô phỏng lông vũ tự nhiên cao cấp, giữ ấm tuyệt đối mà không có mùi hôi của lông vũ thật, không gây kích ứng da.\n- Chăn kích thước rộng 200*230cm, trọng lượng 3kg đầm tay ấm áp, có đai dây cố định 4 góc (có thể đắp trực tiếp hoặc dùng làm ruột lồng vỏ chăn).\n- Hướng dẫn sử dụng: Bảo quản nơi khô ráo, giặt khô là hơi hoặc giặt máy chế độ nhẹ để giữ độ bền đẹp tối đa.\n- 5 gam màu pastel nhẹ nhàng sang trọng: Tím Lavender, Xanh băng Ice Blue, Hồng pastel, Ghi xám, Trắng kem sữa.\n<!--cats:["mon-le","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsSwan)}-->`,
    images: [...generalSwan, ...mainSwan],
    cover_image: baseSwan + '18.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodSwan, { onConflict: 'id' });
  console.log(`✓ [1/2] Đã lưu sản phẩm ${prodSwan.id} (${varsSwan.length} mẫu, ${generalSwan.length} ảnh chung)`);

  // 2. PRODUCT 2: Chăn tuyết sữa dập nổi Honeycomb 369k
  const dirTuyetSua = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn tuyết sữa lục giác');
  await uploadFolder(dirTuyetSua, 'chan-tuyet-sua-luc-giac');
  const baseTuyetSua = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-tuyet-sua-luc-giac/';

  const varsTuyetSua = [
    // 6 mẫu dập lục giác tổ ong Honeycomb
    { label: 'Mẫu 01 - Xanh dương thép tổ ong', image: baseTuyetSua + '01.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 02 - Xanh bơ cốm tổ ong', image: baseTuyetSua + '02.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 03 - Nâu camel tổ ong', image: baseTuyetSua + '03.jpg', colorId: 'nau' },
    { label: 'Mẫu 04 - Hồng đỗ vintage tổ ong', image: baseTuyetSua + '04.jpg', colorId: 'hong' },
    { label: 'Mẫu 05 - Xám than đậm tổ ong', image: baseTuyetSua + '05.jpg', colorId: 'xam' },
    { label: 'Mẫu 06 - Trắng kem sữa tổ ong', image: baseTuyetSua + '06.jpg', colorId: 'trang' },
    // 6 mẫu dập hình thoi đồng tâm Geometric
    { label: 'Mẫu 07 - Ghi xám sáng hình thoi', image: baseTuyetSua + '07.jpg', colorId: 'xam' },
    { label: 'Mẫu 08 - Nâu be cát hình thoi', image: baseTuyetSua + '08.jpg', colorId: 'be' },
    { label: 'Mẫu 09 - Xanh mint bạc hà hình thoi', image: baseTuyetSua + '09.jpg', colorId: 'xanh-la' },
    { label: 'Mẫu 10 - Nâu socola hình thoi', image: baseTuyetSua + '10.jpg', colorId: 'nau' },
    { label: 'Mẫu 11 - Xanh xám biển hình thoi', image: baseTuyetSua + '11.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 12 - Ghi chì đậm hình thoi', image: baseTuyetSua + '12.jpg', colorId: 'xam' },
  ];

  const mainTuyetSua = varsTuyetSua.map(v => `${v.image}#color=${v.colorId}`);

  const prodTuyetSua = {
    id: 'LE_CHAN_TUYET_SUA_LUC_GIAC',
    slug: 'chan-tuyet-sua-hoa-tiet-dap-noi-honeycomb-2m-2m3',
    name: 'Chăn tuyết sữa dập nổi cao cấp Honeycomb Blanket (2m x 2m3 - 1.7kg)',
    category_id: 'mon-le',
    price: 369000,
    currency: 'VND',
    type: 'single',
    colors: ['xanh-duong', 'xanh-la', 'nau', 'hong', 'xam', 'trang', 'be'],
    sizes: ['2m x 2m3 tiêu chuẩn (nặng ~1.7kg)'],
    combo_items: [
      {
        name: 'Chăn tuyết sữa dập nổi Honeycomb Blanket',
        quantity: 1,
        note: 'Kích thước 2m x 2m3, nặng ~1.7kg, sợi tuyết sữa mềm mịn giữ ấm nhanh'
      }
    ],
    description: `Honeycomb Blanket 🐝 Chăn tuyết sữa họa tiết dập nổi cao cấp giá ưu đãi 369.000đ.\n- Ra mắt phiên bản chăn tuyết sữa họa tiết dập nổi lục giác tổ ong & hình thoi hiện đại thiết kế đặc biệt cho mùa thu đông năm nay.\n- Sợi tuyết sữa mềm mịn như nhung, chạm vào là ấm, giữ nhiệt nhanh và nhẹ nhàng êm ái.\n- Kích thước: 2m x 2m3 rộng rãi\n- Cân nặng: ~1.7kg vừa vặn ấm áp cho mùa thu đông mát mẻ, se lạnh hoặc dùng phòng điều hòa.\n- 12 mẫu mã phong phú: 6 màu họa tiết lục giác tổ ong Honeycomb và 6 màu họa tiết hình thoi Geometric thanh lịch.\n<!--cats:["mon-le","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsTuyetSua)}-->`,
    images: mainTuyetSua,
    cover_image: baseTuyetSua + '06.jpg',
    featured: true,
    published: true,
  };
  await supabase.from('products').upsert(prodTuyetSua, { onConflict: 'id' });
  console.log(`✓ [2/2] Đã lưu sản phẩm ${prodTuyetSua.id} (${varsTuyetSua.length} mẫu)`);

  // 3. Upload images for Tuscany Blanket to Storage (ready for price confirmation)
  const dirTuscany = path.resolve(rootDir, 'image', 'Lẻ', 'Chăn Tuscany...');
  await uploadFolder(dirTuscany, 'chan-tuscany');
  console.log('✓ Đã upload 18 ảnh Chăn Tuscany lên Storage chan-tuscany');
}

main().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
