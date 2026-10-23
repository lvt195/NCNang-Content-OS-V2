import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Định nghĩa ảnh bìa đặc trưng riêng biệt và đẹp nhất cho từng bộ
const DISTINCT_COVERS = {
  SET165_CARO: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/001_caro_xanh_gau_cute.jpg',
    leadName: 'Caro xanh gấu cute Hàn Quốc'
  },
  SET165_SOC: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/004_ke_soc_ghi_xam_dui_xuoc.jpg',
    leadName: 'Kẻ sọc ghi xám đũi xước hiện đại'
  },
  SET165_HOANHI: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/006_hoa_cuc_nhi_vang_kem.jpg',
    leadName: 'Hoa cúc nhí vàng kem vintage'
  },
  SET165_HOACO: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/025_ngoi_sao_hoa_nhi_xam_trang.jpg',
    leadName: 'Ngôi sao hoa nhí xám trắng mùa hạ'
  },
  SET165_GAU: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/005_be_am_mat_gau_nau.jpg',
    leadName: 'Be ấm mặt gấu nâu ấm áp'
  },
  SET165_THU: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/028_ke_soc_nau_cun_con_cute.jpg',
    leadName: 'Kẻ sọc nâu cún con đáng yêu'
  },
  SET165_TRAITIM: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/011_trai_tim_nho_hong_phan.jpg',
    leadName: 'Trái tim nhỏ hồng phấn ngọt ngào'
  },
  SET165_HOATHINH: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/022_tau_xe_giao_thong_do_trang.jpg',
    leadName: 'Tàu xe giao thông hoạt hình trẻ em'
  },
  SET165_TRON: {
    cover: 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/019_tim_khoai_mon_tron_dui.jpg',
    leadName: 'Tím khoai môn đũi mộc trơn tối giản'
  },
};

async function update165To199() {
  console.log('=== CẬP NHẬT GIÁ LÊN 199K VÀ THAY ẢNH BÌA RIÊNG BIỆT CHO TỪNG BỘ 165K ===\n');

  const { data: prods, error } = await supabase.from('products').select('*').order('id');
  if (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    process.exit(1);
  }

  const prods165 = prods.filter(p => p.id.startsWith('SET165'));
  console.log(`Tìm thấy ${prods165.length} sản phẩm thuộc dòng 165k.\n`);

  const fabricStackUrl = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/combo165/109_chong_cuon_vai_dui_pastel.jpg';

  for (const p of prods165) {
    const config = DISTINCT_COVERS[p.id];
    if (!config) {
      console.warn(`Không tìm thấy cấu hình bìa cho ${p.id}`);
      continue;
    }

    // 1. Cập nhật giá lên 199.000đ
    const newPrice = 199000;

    // 2. Cập nhật Slug: thay -165k thành -199k
    const newSlug = p.slug ? p.slug.replace(/-165k$/i, '-199k') : p.slug;

    // 3. Cập nhật Description: thay 165.000đ và 165k thành 199.000đ và 199k
    let newDesc = p.description || '';
    newDesc = newDesc.replace(/165\.000đ/g, '199.000đ');
    newDesc = newDesc.replace(/165\.000/g, '199.000');
    newDesc = newDesc.replace(/165k/gi, '199k');

    // 4. Lọc bỏ ảnh cuộn vải trùng lặp ở đầu (109_chong_cuon_vai_dui_pastel.jpg) nếu có
    let cleanImages = (p.images || []).filter(img => !img.includes('109_chong_cuon_vai_dui_pastel.jpg'));

    // Đảm bảo ảnh bìa đặc trưng nằm ở vị trí đầu tiên của images
    cleanImages = cleanImages.filter(img => !img.includes(config.cover.split('/').pop()));
    cleanImages = [config.cover, ...cleanImages];

    // Cập nhật sản phẩm lên Supabase
    const { error: updateErr } = await supabase.from('products').update({
      price: newPrice,
      slug: newSlug,
      cover_image: config.cover,
      images: cleanImages,
      description: newDesc,
    }).eq('id', p.id);

    if (updateErr) {
      console.error(`❌ Lỗi cập nhật ${p.id}:`, updateErr.message);
    } else {
      console.log(`✓ ${p.id}:`);
      console.log(`   - Giá mới: 199.000đ`);
      console.log(`   - Slug mới: ${newSlug}`);
      console.log(`   - Ảnh bìa riêng biệt: ${config.cover.split('/').pop()} (${config.leadName})`);
      console.log(`   - Tổng ảnh: ${cleanImages.length} ảnh (đã bỏ ảnh cuộn vải trùng lặp)`);
    }
  }

  console.log('\n=== HOÀN TẤT CẬP NHẬT TOÀN BỘ SẢN PHẨM 199K & ẢNH BÌA ĐẶC TRƯNG ===');
}

update165To199().catch(err => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
