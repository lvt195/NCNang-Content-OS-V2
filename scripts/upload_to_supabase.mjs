import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const classifiedDir = path.resolve(rootDir, 'image', 'Set 165k (Phan loai chi tiet)');
const poolDir = path.resolve(classifiedDir, '_Tat_Ca_Anh_Goc_Da_Doi_Ten');

// Read manifest from gallery_chi_tiet.html or JSON
const galleryHtml = fs.readFileSync(path.join(classifiedDir, 'gallery_chi_tiet.html'), 'utf-8');
const match = galleryHtml.match(/const data = (\[.*?\]);/s);
if (!match) {
  console.error('Could not find manifest data in gallery_chi_tiet.html');
  process.exit(1);
}
const items = JSON.parse(match[1]);

console.log(`Loaded ${items.length} unique items from manifest.`);

// Check Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.ADMIN_EMAIL) {
  console.log('\n⚠️ CHƯA CÓ SERVICE ROLE KEY HOẶC TÀI KHOẢN ADMIN:');
  console.log('Để upload lên Supabase (bỏ qua RLS hoặc xác thực Admin), bạn cần:');
  console.log('1. Chạy với SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/upload_to_supabase.mjs');
  console.log('HOẶC');
  console.log('2. Cung cấp ADMIN_EMAIL và ADMIN_PASSWORD trong file .env\n');
}

export async function uploadAll(customClient) {
  const supabase = customClient || createClient(supabaseUrl, supabaseKey);

  console.log('Target Category: combo165 (Set3:Ga+vỏ gối - 165.000đ)');
  console.log('Ensuring 0 duplicate uploads: Each image uploaded ONCE to storage, then mapped to products table.\n');

  let successCount = 0;
  for (const item of items) {
    const srcFile = path.join(poolDir, item.filename);
    if (!fs.existsSync(srcFile)) {
      console.warn(`File not found: ${srcFile}`);
      continue;
    }

    const sanitizedFilename = item.filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    const storagePath = `combo165/${sanitizedFilename}`;
    const fileBuffer = fs.readFileSync(srcFile);

    // 1. Upload to Supabase Storage (product-images bucket)
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadErr) {
      console.error(`Failed to upload ${storagePath}:`, uploadErr.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);
    const imageUrl = publicUrlData.publicUrl;

    // 2. Prepare Product payload for Category combo165
    const prodId = `SET165_${String(item.id).padStart(3, '0')}`;
    const cleanTitle = item.name.replace(/_/g, ' ');
    const prodName = `Set 3 món ga gối đũi ${cleanTitle} (Mẫu #${item.id})`;
    const slug = `set-3-mon-ga-goi-dui-${item.name.replace(/_/g, '-')}-${item.id}`;

    // Multi-category assignment for Supabase
    const categoryIds = ['combo165', 'vaidui'];
    if (item.patterns.includes('Hoa_Nhi_Hoa_Co')) {
      categoryIds.push('hoanhi');
    }
    if (item.patterns.includes('Ke_Caro') || item.patterns.includes('Ke_Soc')) {
      categoryIds.push('hoatietke');
    }
    if (item.patterns.includes('Tron_Toi_Gian')) {
      categoryIds.push('mautron');
    }

    const productPayload = {
      id: prodId,
      name: prodName,
      slug: slug,
      category_id: 'combo165',
      price: 165000,
      currency: 'VND',
      type: 'combo',
      colors: item.colors,
      sizes: ['1m6 x 2m', '1m8 x 2m', '2m x 2m2'],
      description: `Set chăn ga gối đũi mộc 3 món giá 165.000đ. Họa tiết: ${item.patterns.join(', ').replace(/_/g, ' ')}. Phong cách: ${item.tones.join(', ').replace(/_/g, ' ')}. Tone màu: ${item.colors.join(', ').replace(/_/g, ' ')}. Chất vải đũi tự nhiên thoáng khí, thấm hút mồ hôi và mềm mát dịu nhẹ cho da.\n<!--cats:${JSON.stringify(categoryIds)}-->`,
      combo_items: [
        { name: 'Ga chun bọc đệm', quantity: 1, note: 'Vừa đệm dày tới 15cm' },
        { name: 'Vỏ gối nằm', quantity: 2, note: 'Kích thước tiêu chuẩn 45x65cm' }
      ],
      images: [imageUrl],
      cover_image: imageUrl,
      featured: false,
      published: true
    };

    // 3. Upsert into products table
    const { error: dbErr } = await supabase
      .from('products')
      .upsert(productPayload, { onConflict: 'id' });

    if (dbErr) {
      console.error(`Failed to insert product ${prodId}:`, dbErr.message);
    } else {
      successCount++;
      console.log(`[${successCount}/${items.length}] Uploaded & created: ${prodId} - ${prodName}`);
    }
  }

  console.log(`\n🎉 Hoàn tất! Đã upload thành công ${successCount}/${items.length} sản phẩm lên Supabase.`);
}

// If run directly
if (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD)) {
  uploadAll();
}
