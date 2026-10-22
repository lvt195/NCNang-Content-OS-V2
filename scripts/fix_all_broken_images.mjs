import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBrokenImages() {
  console.log('=== SỬA TOÀN BỘ CÁC LINK ẢNH BỊ LỖI TRONG DATABASE ===\n');

  // 1. Sửa sản phẩm Chăn hè thun lạnh 300k (LE_CHAN_THUN_LANH_300K)
  console.log('1. Sửa link ảnh cho LE_CHAN_THUN_LANH_300K...');
  const baseChanLanh = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-he-thun-lanh-300k';
  
  const chanLanhImages = [
    `${baseChanLanh}/thunlanh_chan_01.jpg`, // Bìa giới thiệu sofa
    `${baseChanLanh}/thunlanh_chan_04.jpg#color=xam`, // Xám nhạt
    `${baseChanLanh}/thunlanh_chan_02.jpg#color=hong-cam`, // Hồng cam đào
    `${baseChanLanh}/thunlanh_chan_03.jpg#color=hong`, // Hồng cherry
    `${baseChanLanh}/thunlanh_chan_05.jpg#color=xanh-bo`, // Xanh cốm
    `${baseChanLanh}/thunlanh_chan_06.jpg#color=xanh-duong`, // Xanh blue
    `${baseChanLanh}/thunlanh_chan_07.jpg#color=xam`, // Xám đậm
  ];

  const chanLanhDesc = `Chăn hè thun lạnh Tencel Ice Silk cao cấp chần viền vi tính tinh tế giá 300.000đ. Bề mặt vải mềm rũ mượt mà, chạm vào mát lạnh tức thì, kháng khuẩn và siêu thoáng khí cho những đêm hè oi bức hay phòng điều hòa mát mẻ.
Trọn bộ gồm:
- 1 Vỏ chăn hè thun lạnh chần viền cao cấp (kích thước 2m x 2m2)
<!--cats:["mon-le","chat-lieu-lanh","mau-tron"]-->`;

  const { error: err1 } = await supabase.from('products').update({
    cover_image: chanLanhImages[0],
    images: chanLanhImages,
    colors: ['xam', 'hong-cam', 'hong', 'xanh-bo', 'xanh-duong'],
    description: chanLanhDesc,
    published: true, // Bật lại hiển thị sản phẩm
  }).eq('id', 'LE_CHAN_THUN_LANH_300K');

  if (err1) console.error('Lỗi cập nhật LE_CHAN_THUN_LANH_300K:', err1);
  else console.log('✓ LE_CHAN_THUN_LANH_300K: Đã sửa 7 link ảnh chuẩn 200 OK và bật published: true.');

  // 2. Sửa lỗi tên file có dấu tiếng Việt (nhạt -> nhat) trong SET165_*
  console.log('\n2. Sửa link ảnh 036 và 038 trong các set 165k...');
  const affected165 = ['SET165_SOC', 'SET165_HOACO', 'SET165_THU', 'SET165_HOATHINH'];
  
  for (const pid of affected165) {
    const { data: p } = await supabase.from('products').select('*').eq('id', pid).single();
    if (!p) continue;

    let imagesStr = JSON.stringify(p.images);
    let descStr = p.description || '';

    let changed = false;
    if (imagesStr.includes('036_tho_cam_bac_au_tuan_loc_nhạt.jpg')) {
      imagesStr = imagesStr.replace(/036_tho_cam_bac_au_tuan_loc_nhạt\.jpg/g, '036_tho_cam_bac_au_tuan_loc_nhat.jpg');
      changed = true;
    }
    if (imagesStr.includes('038_hoa_nhi_hong_tho_tim_nhạt.jpg')) {
      imagesStr = imagesStr.replace(/038_hoa_nhi_hong_tho_tim_nhạt\.jpg/g, '038_hoa_nhi_hong_tho_tim_nhat.jpg');
      changed = true;
    }
    if (descStr.includes('036_tho_cam_bac_au_tuan_loc_nhạt.jpg')) {
      descStr = descStr.replace(/036_tho_cam_bac_au_tuan_loc_nhạt\.jpg/g, '036_tho_cam_bac_au_tuan_loc_nhat.jpg');
      changed = true;
    }
    if (descStr.includes('038_hoa_nhi_hong_tho_tim_nhạt.jpg')) {
      descStr = descStr.replace(/038_hoa_nhi_hong_tho_tim_nhạt\.jpg/g, '038_hoa_nhi_hong_tho_tim_nhat.jpg');
      changed = true;
    }

    if (changed) {
      await supabase.from('products').update({
        images: JSON.parse(imagesStr),
        description: descStr,
      }).eq('id', pid);
      console.log(`✓ ${pid}: Đã sửa tên file không dấu (nhat) thành công.`);
    }
  }

  console.log('\n=== HOÀN TẤT SỬA TOÀN BỘ LINK ẢNH BỊ LỖI ===');
}

fixBrokenImages().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
