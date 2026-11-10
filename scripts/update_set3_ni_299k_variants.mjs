import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

async function main() {
  const baseSet3Ni = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/set3-ni-299k/';

  const varsSet3Ni = [
    { label: 'Mẫu 01 - Trắng xám họa tiết tim đỏ', image: baseSet3Ni + '02.jpg', colorId: 'xam' },
    { label: 'Mẫu 02 - Trắng xám họa tiết tim đen', image: baseSet3Ni + '15.jpg', colorId: 'xam' },
    { label: 'Mẫu 03 - Đen tuyền chấm bi trắng', image: baseSet3Ni + '13.jpg', colorId: 'den' },
    { label: 'Mẫu 04 - Nâu hoa nhí vintage cổ điển', image: baseSet3Ni + '14.jpg', colorId: 'nau' },
    { label: 'Mẫu 05 - Trắng xám ziczac hình học hiện đại', image: baseSet3Ni + '16.jpg', colorId: 'xam' },
    { label: 'Mẫu 06 - Đỏ caro Noel ấm cúng', image: baseSet3Ni + '06.jpg', colorId: 'do' },
    { label: 'Mẫu 07 - Xám ghi hình thú gấu cún', image: baseSet3Ni + '07.jpg', colorId: 'xam' },
    { label: 'Mẫu 08 - Đen huyền bí nhân vật hoạt hình', image: baseSet3Ni + '08.jpg', colorId: 'den' },
    { label: 'Mẫu 09 - Kem hoa hồng vintage lãng mạn', image: baseSet3Ni + '12.jpg', colorId: 'be' },
    { label: 'Mẫu 10 - Sọc nâu vàng bánh mì gấu teddy', image: baseSet3Ni + '18.jpg', colorId: 'nau' },
  ];

  // 8 ảnh chung tổng quan phòng, xếp đệm, sào treo, chi tiết gấp
  const generalSet3Ni = [
    baseSet3Ni + '11.jpg#color=be', // xếp nhiều bộ trên giường bối cảnh
    baseSet3Ni + '01.jpg#color=be', // sào treo các mẫu
    baseSet3Ni + '10.jpg#color=nau', // tay cầm cận độ dày chun bo đệm
    baseSet3Ni + '03.jpg#color=den', // gấp bộ chấm bi
    baseSet3Ni + '04.jpg#color=nau', // gấp bộ nâu hoa nhí
    baseSet3Ni + '05.jpg#color=xam', // gấp bộ ziczac
    baseSet3Ni + '09.jpg#color=be', // gấp bộ hoa hồng
    baseSet3Ni + '17.jpg#color=nau', // gấp bộ sọc vàng gấu
  ];

  const mainSet3Ni = varsSet3Ni.map(v => `${v.image}#color=${v.colorId}`);

  const updateData = {
    colors: ['xam', 'den', 'trang', 'nau', 'do', 'be'],
    description: `Set 3 món ga gối nỉ nhung mềm mại ấm áp mùa đông giá sale ưu đãi chỉ 299.000đ.\nChất liệu sợi nỉ tuyết nhung mịn màng, chạm vào là ấm, giữ nhiệt siêu tốt cho cả gia đình trong mùa lạnh. Ga chun may bo góc đệm chắc chắn, không bị xô lệch.\nTrọn bộ 3 món gồm:\n- 1 Ga chun nỉ nhung bọc đệm êm ái\n- 2 Vỏ gối nằm nỉ nhung đồng bộ (45x65cm)\n- Đầy đủ 10 mẫu họa tiết mùa đông thịnh hành: Trắng xám tim đỏ, Trắng xám tim đen, Đen chấm bi, Nâu hoa nhí, Trắng xám ziczac, Đỏ caro Noel, Xám thú cún, Đen hoạt hình, Kem hoa hồng, Sọc nâu vàng gấu teddy.\n<!--cats:["set-3-mon","chat-lieu-ni","hoa-tiet-de-thuong","hoa-tiet-ke"]-->\n<!--vars:${JSON.stringify(varsSet3Ni)}-->`,
    images: [...generalSet3Ni, ...mainSet3Ni],
    cover_image: baseSet3Ni + '11.jpg',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', 'SET3_NI_299K')
    .select();

  if (error) {
    console.error('Error updating SET3_NI_299K:', error);
    process.exit(1);
  }

  console.log('Successfully updated SET3_NI_299K:');
  console.log('Variants count:', varsSet3Ni.length);
  console.log('Images total:', updateData.images.length);
  console.log('First 2 variants:', varsSet3Ni.slice(0, 2));
}

main();
