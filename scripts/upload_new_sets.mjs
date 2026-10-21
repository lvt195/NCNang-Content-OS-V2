import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const STANDARD_SIZES = ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', 'May theo yêu cầu'];

async function uploadFolder(folderName, targetSubdir, filePrefix) {
  const folderPath = path.resolve(rootDir, 'image', folderName);
  const files = fs.readdirSync(folderPath)
    .filter(f => !f.startsWith('.') && /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  console.log(`\nUploading ${files.length} images from "${folderName}" to "product-images/${targetSubdir}"...`);
  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const origFilename = files[i];
    const srcFile = path.join(folderPath, origFilename);
    const ext = path.extname(origFilename).toLowerCase() || '.jpg';
    const cleanStorageName = `${filePrefix}_${String(i + 1).padStart(2, '0')}${ext}`;
    const storagePath = `${targetSubdir}/${cleanStorageName}`;

    const fileBuffer = fs.readFileSync(srcFile);

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
        upsert: true
      });

    if (uploadErr) {
      console.error(`  [FAIL] ${cleanStorageName}: ${uploadErr.message}`);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    uploadedUrls.push(publicUrlData.publicUrl);
    process.stdout.write(`  [${i + 1}/${files.length}] Uploaded ${cleanStorageName}\r`);
  }
  console.log(`\n  Done: ${uploadedUrls.length}/${files.length} images uploaded.`);
  return uploadedUrls;
}

async function main() {
  console.log('=== STARTING UPLOAD & SYNC FOR NEW BEDDING SETS ===\n');

  // 1. Ensure categories in database
  console.log('1. Ensuring categories exist in Supabase...');
  const categoriesToEnsure = [
    {
      id: 'combo280',
      name: 'Set 3: Nỉ lông chuột',
      description: 'Set ga chun + 2 vỏ gối nỉ nhung lông chuột ấm áp mùa đông',
      display_order: 10
    },
    {
      id: 'thunlanh',
      name: 'Set ga thun lạnh',
      description: 'Set ga chun + 2 vỏ gối thun lạnh Tencel mát lịm mùa hè',
      display_order: 11
    }
  ];

  for (const cat of categoriesToEnsure) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'id' });
    if (error) console.error(`Failed upsert category ${cat.id}:`, error.message);
    else console.log(`  ✓ Category "${cat.name}" (${cat.id}) ready`);
  }

  // 2. Upload images for each set
  const set280Urls = await uploadFolder('Set 3 nỉ lông chuột 280k', 'set3-ni-280k', 'set3_ni');
  const set380Urls = await uploadFolder('Set 4 món 380k', 'set4-chan-380k', 'set4_chan');
  const set350Urls = await uploadFolder('Set ga 2 gối thun lạnh 350k', 'set-thunlanh-350k', 'thunlanh');

  // 3. Upsert Products
  console.log('\n2. Upserting 3 new products to "products" table...');

  const products = [
    {
      id: 'SET280',
      name: 'Set 3 món ga gối nỉ lông chuột Pureloom',
      slug: 'set-3-mon-ga-goi-ni-long-chuot-pureloom-280k',
      category_id: 'combo280',
      price: 280000,
      currency: 'VND',
      type: 'combo',
      colors: ['be', 'nau', 'xam', 'xanh-duong', 'xanh-mint', 'hong-dat', 'tim-khoi', 'caro', 'hoa-nhi'],
      sizes: STANDARD_SIZES,
      description: 'Set ga gối nỉ lông chuột 3 món cao cấp (Pureloom Collection) giá 280.000đ. Chất vải nỉ nhung lông chuột dày dặn, mềm mịn như nhung, giữ nhiệt cực tốt và không rụng lông, không vón cục khi giặt máy. Phù hợp cho thời tiết se lạnh mùa thu và mùa đông giá rét. Bộ sản phẩm gồm 1 ga chun bọc đệm và 2 vỏ gối nằm đồng bộ.\n<!--cats:["combo280","vaini","muadong"]-->',
      combo_items: [
        { name: 'Ga chun nỉ lông chuột bọc đệm', quantity: 1, note: 'Chun bo viền ôm sát, vừa đệm dày tới 20cm' },
        { name: 'Vỏ gối nằm nỉ lông chuột đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
      ],
      cover_image: set280Urls[3] || set280Urls[0], // #04 hero bed photo
      images: set280Urls,
      featured: true,
      published: true
    },
    {
      id: 'SET380',
      name: 'Set 4 món chăn ga gối cotton đũi Hàn Quốc',
      slug: 'set-4-mon-chan-ga-goi-cotton-dui-han-quoc-380k',
      category_id: 'chan',
      price: 380000,
      currency: 'VND',
      type: 'combo',
      colors: ['be', 'trang', 'nau', 'xam', 'xanh-duong', 'xanh-mint', 'vang-nhat', 'hong-dat', 'caro', 'hoa-nhi'],
      sizes: STANDARD_SIZES,
      description: 'Set 4 món chăn ga gối cotton đũi cao cấp phong cách Hàn Quốc giá 380.000đ. Chất liệu đũi cotton sợi dệt tự nhiên mềm mại, thoáng mát, thấm hút mồ hôi tốt và dịu nhẹ với làn da. Họa tiết đa dạng từ hoa nhí vintage, kẻ caro pastel đến họa tiết thú cưng ngộ nghĩnh. Trọn bộ 4 món gồm: 1 vỏ chăn 2m x 2m2 có khóa kéo lồng được ruột bông, 1 ga giường (chun hoặc phủ) và 2 vỏ gối nằm đồng bộ.\n<!--cats:["chan","vaidui","hoanhi","hoatietke","mautron"]-->',
      combo_items: [
        { name: 'Ga bọc chun hoặc ga phủ theo yêu cầu', quantity: 1, note: 'May đo chuẩn theo kích thước đệm' },
        { name: 'Vỏ chăn hè thu đông', quantity: 1, note: 'Kích thước 2m x 2m2, có khóa kéo lồng được ruột bông' },
        { name: 'Vỏ gối nằm đồng bộ', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
      ],
      cover_image: set380Urls[14] || set380Urls[0], // #15 beautiful bed photo
      images: set380Urls,
      featured: true,
      published: true
    },
    {
      id: 'SET350',
      name: 'Set ga chun và 2 vỏ gối thun lạnh Tencel Ice Silk',
      slug: 'set-ga-chun-2-vo-goi-thun-lanh-tencel-ice-silk-350k',
      category_id: 'thunlanh',
      price: 350000,
      currency: 'VND',
      type: 'combo',
      colors: ['xam', 'xanh-reu', 'xanh-navy', 'xanh-duong', 'tim-khoi', 'nau', 'vang-nhat', 'trang'],
      sizes: STANDARD_SIZES,
      description: 'Set ga chun và 2 vỏ gối chất liệu thun lạnh Tencel Ice Silk cao cấp giá 350.000đ. Bề mặt vải mát lạnh tức thì ngay khi chạm vào, sợi vải siêu mịn mượt kháng khuẩn, mang lại giấc ngủ êm ái mát mẻ suốt đêm hè. Tông màu trơn sang trọng, hiện đại chuẩn phong cách Mark Cross. Bộ gồm 1 ga chun bọc đệm và 2 vỏ gối nằm đồng bộ.\n<!--cats:["thunlanh","mautron"]-->',
      combo_items: [
        { name: 'Ga chun thun lạnh Tencel Ice Silk', quantity: 1, note: 'Bề mặt siêu mềm mát lịm, vừa đệm dày tới 20cm' },
        { name: 'Vỏ gối nằm thun lạnh', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
      ],
      cover_image: set350Urls[3] || set350Urls[0], // #04 palette on bed
      images: set350Urls,
      featured: true,
      published: true
    }
  ];

  for (const prod of products) {
    const { error: prodErr } = await supabase.from('products').upsert(prod, { onConflict: 'id' });
    if (prodErr) {
      console.error(`  [FAIL] Product ${prod.id}: ${prodErr.message}`);
    } else {
      console.log(`  ✓ Product created/updated: ${prod.id} - ${prod.name}`);
    }
  }

  // 4. Update sizes for all existing SET165 products to ensure uniform synchronization
  console.log('\n3. Synchronizing sizes across all SET165 products in Supabase...');
  const { data: updatedProds, error: updateErr } = await supabase
    .from('products')
    .update({ sizes: STANDARD_SIZES })
    .ilike('id', 'SET165_%')
    .select('id');

  if (updateErr) {
    console.error('Failed to sync sizes for SET165:', updateErr.message);
  } else {
    console.log(`  ✓ Successfully synchronized sizes for ${updatedProds ? updatedProds.length : 0} SET165 products.`);
  }

  console.log('\n🎉 ALL DONE! Supabase storage and database are fully synchronized.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
