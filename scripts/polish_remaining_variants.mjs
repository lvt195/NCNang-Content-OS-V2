import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbtngmjupjsbvxckeshe.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Polish SET370_HANQUOC_1 (Hoa nhí & Vintage)
const names370_1 = [
  { label: 'Hoa Nhí Cúc Vàng Đồng Nội', colorId: 'vang-nhat' },
  { label: 'Hoa Nhí Hồng Đào Vintage', colorId: 'hong-dat' },
  { label: 'Hoa Nhí Xanh Mint Dịu Nhẹ', colorId: 'xanh-mint' },
  { label: 'Hoa Cúc Trắng Nền Be Mộc', colorId: 'be' },
  { label: 'Hoa Lá Thu Nâu Đất Cổ Điển', colorId: 'nau' },
  { label: 'Hoa Nhí Tím Lavender Mộng Mơ', colorId: 'tim-khoi' },
  { label: 'Hoa Nhí Xanh Dương Pastel', colorId: 'xanh-duong' },
  { label: 'Hoa Nhí Trắng Nền Ghi Xám', colorId: 'xam' },
  { label: 'Hoa Hồng Nhí Kem Bơ Hàn Quốc', colorId: 'be' },
  { label: 'Hoa Nhí Dâu Tây Ngọt Ngào', colorId: 'hong-dat' },
  { label: 'Hoa Cúc Đại Nền Vàng Nhạt', colorId: 'vang-nhat' },
  { label: 'Hoa Nhí Xanh Rêu Mộc Mạc', colorId: 'xanh-reu' },
  { label: 'Hoa Nhí Be Nâu Ấm Cúng', colorId: 'nau' },
];

// Polish SET370_HANQUOC_2 (Kẻ Caro & Dễ thương)
const names370_2 = [
  { label: 'Kẻ Caro Xanh Dương Hàn Quốc', colorId: 'xanh-duong' },
  { label: 'Kẻ Sọc Pastel Vàng Kem', colorId: 'vang-nhat' },
  { label: 'Kẻ Caro Hồng Pastel Thỏ Con', colorId: 'hong-dat' },
  { label: 'Kẻ Caro Ghi Xám Tối Giản', colorId: 'xam' },
  { label: 'Kẻ Sọc Xanh Bơ Cún Con', colorId: 'xanh-reu' },
  { label: 'Kẻ Caro Be Nâu Cà Phê', colorId: 'nau' },
  { label: 'Kẻ Sọc Cầu Vồng Trẻ Em', colorId: 'vang-nhat' },
  { label: 'Kẻ Caro Tím Khói Dễ Thương', colorId: 'tim-khoi' },
  { label: 'Kẻ Sọc Xanh Mint Bánh Mì Gấu', colorId: 'xanh-mint' },
  { label: 'Kẻ Caro Đen Trắng Bắc Âu', colorId: 'xam' },
  { label: 'Kẻ Sọc Hồng Đất Dâu Tây', colorId: 'hong-dat' },
  { label: 'Kẻ Caro Vàng Cam Gấu Teddy', colorId: 'vang-nhat' },
  { label: 'Kẻ Sọc Xanh Dương Mèo Con', colorId: 'xanh-duong' },
];

// Polish SET_XINKK_220K
const namesXinkk = [
  { label: 'Gấu Nâu Xinkk Be Kem', colorId: 'be' },
  { label: 'Hoa Nhí Cúc Vàng Nhạt', colorId: 'vang-nhat' },
  { label: 'Caro Xanh Dương Pastel', colorId: 'xanh-duong' },
  { label: 'Thỏ Con Hồng Phấn', colorId: 'hong-dat' },
  { label: 'Kẻ Sọc Ghi Xám Hiện Đại', colorId: 'xam' },
  { label: 'Dâu Tây Đỏ Kem Bơ', colorId: 'hong-dat' },
  { label: 'Gấu Teddy Bánh Mì Nâu', colorId: 'nau' },
  { label: 'Trái Tim Nhỏ Xanh Mint', colorId: 'xanh-mint' },
  { label: 'Hoa Cúc Xanh Da Trời', colorId: 'xanh-duong' },
  { label: 'Caro Hồng Cam Pastel', colorId: 'hong-dat' },
  { label: 'Thỏ Ngọc Tím Lavender', colorId: 'tim-khoi' },
  { label: 'Kẻ Sọc Vàng Gấu Pooh', colorId: 'vang-nhat' },
  { label: 'Hoa Tulip Nhí Kem Vàng', colorId: 'vang-nhat' },
  { label: 'Mèo Cún Trắng Đen', colorId: 'xam' },
  { label: 'Caro Be Ấm Vintage', colorId: 'be' },
  { label: 'Hoa Cúc Trắng Nền Nâu', colorId: 'nau' },
  { label: 'Sanrio Hoạt Hình Sắc Màu', colorId: 'hong-dat' },
  { label: 'Kẻ Sọc Thổ Cẩm Ghi', colorId: 'xam' },
  { label: 'Chấm Sao Đen Nền Kem', colorId: 'be' },
  { label: 'Gấu Pooh Quả Bơ Xanh', colorId: 'xanh-reu' },
];

// Polish SET_NHAP_CARO_260K
const namesNhapCaro = [
  { label: 'Caro Xanh Dương Hiện Đại', colorId: 'xanh-duong' },
  { label: 'Kẻ Sọc Ghi Xám Tối Giản', colorId: 'xam' },
  { label: 'Caro Be Nâu Ấm Áp', colorId: 'nau' },
  { label: 'Kẻ Sọc Pastel Vàng Kem', colorId: 'vang-nhat' },
  { label: 'Caro Đen Trắng Phong Cách', colorId: 'xam' },
  { label: 'Kẻ Sọc Xanh Bơ Tươi Mát', colorId: 'xanh-reu' },
  { label: 'Caro Hồng Đất Dịu Dàng', colorId: 'hong-dat' },
  { label: 'Kẻ Sọc Tím Khói Mộng Mơ', colorId: 'tim-khoi' },
  { label: 'Caro Kem Be Tối Giản', colorId: 'be' },
  { label: 'Kẻ Ziczac Bắc Âu', colorId: 'xam' },
  { label: 'Caro Vàng Cam Năng Động', colorId: 'vang-nhat' },
  { label: 'Kẻ Sọc Xanh Mint Nhẹ Nhàng', colorId: 'xanh-mint' },
  { label: 'Caro Nâu Cà Phê Mộc', colorId: 'nau' },
  { label: 'Kẻ Sọc Trắng Đen Classic', colorId: 'xam' },
  { label: 'Caro Hồng Phấn Nữ Tính', colorId: 'hong-dat' },
  { label: 'Kẻ Sọc Xanh Dương Thủy Thủ', colorId: 'xanh-duong' },
];

// Polish SET_NHAP_HOANHI_260K
const namesNhapHoaNhi = [
  { label: 'Hoa Nhí Cúc Vàng Nền Trắng', colorId: 'vang-nhat' },
  { label: 'Hoa Nhí Hồng Đào Vintage', colorId: 'hong-dat' },
  { label: 'Hoa Cỏ Xanh Mint Dịu Mắt', colorId: 'xanh-mint' },
  { label: 'Hoa Nhí Be Nâu Hoài Cổ', colorId: 'nau' },
  { label: 'Hoa Tulip Tím Lavender', colorId: 'tim-khoi' },
  { label: 'Hoa Nhí Ghi Xám Thanh Lịch', colorId: 'xam' },
  { label: 'Hoa Cúc Hè Xanh Dương', colorId: 'xanh-duong' },
  { label: 'Hoa Hồng Nhí Kem Be', colorId: 'be' },
  { label: 'Hoa Nhí Dâu Rừng Đỏ Mận', colorId: 'hong-dat' },
  { label: 'Hoa Đồng Nội Vàng Cam', colorId: 'vang-nhat' },
  { label: 'Hoa Nhí Rêu Cốm Mộc Mạc', colorId: 'xanh-reu' },
  { label: 'Hoa Cúc Bướm Nâu Trầm', colorId: 'nau' },
  { label: 'Hoa Nhí Tím Khói Lãng Mạn', colorId: 'tim-khoi' },
  { label: 'Hoa Nhí Trắng Nền Xanh', colorId: 'xanh-duong' },
  { label: 'Hoa Cúc Trắng Nền Kem', colorId: 'be' },
  { label: 'Hoa Nhí Pastel Đa Sắc', colorId: 'hong-dat' },
  { label: 'Hoa Cỏ Mùa Thu Ghi Be', colorId: 'be' },
];

// Polish SET_NHAP_NI_280K
const namesNhapNi = [
  { label: 'Nỉ Nhung Be Sữa Trơn', colorId: 'be' },
  { label: 'Nỉ Nhung Nâu Hạt Dẻ Ấm', colorId: 'nau' },
  { label: 'Nỉ Nhung Ghi Xám Sang Trọng', colorId: 'xam' },
  { label: 'Nỉ Nhung Xanh Rêu Trầm', colorId: 'xanh-reu' },
  { label: 'Nỉ Nhung Hồng Đất Nữ Tính', colorId: 'hong-dat' },
  { label: 'Nỉ Nhung Xanh Dương Đậm', colorId: 'xanh-duong' },
  { label: 'Nỉ Nhung Vàng Mù Tạt', colorId: 'vang-nhat' },
  { label: 'Nỉ Nhung Tím Khói Quý Phái', colorId: 'tim-khoi' },
  { label: 'Nỉ Nhung Họa Tiết Hươu Bắc Âu', colorId: 'nau' },
  { label: 'Nỉ Nhung Kẻ Caro Xám Nâu', colorId: 'xam' },
  { label: 'Nỉ Nhung Gấu Mùa Đông Be', colorId: 'be' },
  { label: 'Nỉ Nhung Hoa Tuyết Xanh', colorId: 'xanh-duong' },
  { label: 'Nỉ Nhung Cây Thông Mùa Đông', colorId: 'xanh-reu' },
  { label: 'Nỉ Nhung Quả Thông Nâu Đất', colorId: 'nau' },
  { label: 'Nỉ Nhung Trái Tim Hồng Nhung', colorId: 'hong-dat' },
  { label: 'Nỉ Nhung Ghi Đậm Khói', colorId: 'xam' },
];

async function updateProductVariants(id, nameList) {
  const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
  if (!prod) return;

  const match = prod.description.match(/<!--vars:(.*?)-->/);
  if (!match) return;

  const oldVars = JSON.parse(match[1]);
  const newVars = oldVars.map((v, i) => {
    const meta = nameList[i] || { label: `Mẫu ${i + 1}`, colorId: 'be' };
    return {
      label: meta.label,
      image: v.image,
      colorId: meta.colorId,
    };
  });

  const distinctColors = Array.from(new Set(newVars.map(v => v.colorId)));
  const newDesc = prod.description.replace(/<!--vars:.*?-->/, `<!--vars:${JSON.stringify(newVars)}-->`);

  await supabase.from('products').update({
    colors: distinctColors,
    description: newDesc,
  }).eq('id', id);

  console.log(`  ✓ Updated ${id} (${newVars.length} variants, distinct colors: ${distinctColors.join(', ')})`);
}

async function main() {
  console.log('=== POLISHING REMAINING VARIANTS ===');
  await updateProductVariants('SET370_HANQUOC_1', names370_1);
  await updateProductVariants('SET370_HANQUOC_2', names370_2);
  await updateProductVariants('SET_XINKK_220K', namesXinkk);
  await updateProductVariants('SET_NHAP_CARO_260K', namesNhapCaro);
  await updateProductVariants('SET_NHAP_HOANHI_260K', namesNhapHoaNhi);
  await updateProductVariants('SET_NHAP_NI_280K', namesNhapNi);
  console.log('=== ALL REMAINING VARIANTS POLISHED! ===');
}

main().catch(console.error);
