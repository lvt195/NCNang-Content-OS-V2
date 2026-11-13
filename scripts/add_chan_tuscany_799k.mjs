import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

async function main() {
  const baseTuscany = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-tuscany/';

  const varsTuscany = [
    { label: 'Mẫu 01 - Nâu be Camel sang trọng', image: baseTuscany + '03.jpg', colorId: 'be' },
    { label: 'Mẫu 02 - Xám ghi hiện đại', image: baseTuscany + '05.jpg', colorId: 'xam' },
    { label: 'Mẫu 03 - Nâu socola trầm ấm', image: baseTuscany + '07.jpg', colorId: 'nau' },
    { label: 'Mẫu 04 - Hồng phấn ngọt ngào', image: baseTuscany + '09.jpg', colorId: 'hong' },
    { label: 'Mẫu 05 - Trắng kem sữa tinh tế', image: baseTuscany + '12.jpg', colorId: 'trang' },
  ];

  // 10 ảnh bối cảnh và chi tiết tổng quan (<= 2 * 5 mẫu) đẩy lên đầu
  const generalTuscany = [
    baseTuscany + '14.jpg#color=be', // túi Seven-Star Blanket chính hãng cạnh chăn
    baseTuscany + '15.jpg#color=be', // xếp hàng các cuộn chăn
    baseTuscany + '13.jpg#color=xam', // xếp bối cảnh sofa/giường
    baseTuscany + '18.jpg#color=be', // tay xách túi ngoài trời
    baseTuscany + '01.jpg#color=be', // ôm chất lông mềm nâu be
    baseTuscany + '06.jpg#color=nau', // ôm chất lông nâu socola
    baseTuscany + '11.jpg#color=trang', // ôm chất lông trắng kem
    baseTuscany + '04.jpg#color=xam', // phủ ghế xám ghi
    baseTuscany + '08.jpg#color=nau', // phủ ghế nâu socola
    baseTuscany + '10.jpg#color=hong', // phủ ghế hồng phấn
  ];

  const mainTuscany = varsTuscany.map(v => `${v.image}#color=${v.colorId}`);

  const prodTuscany = {
    id: 'LE_CHAN_TUSCANY_799K',
    slug: 'chan-tuscany-cao-cap-luofuhouse-2-mat-long-tho-2m-2m3',
    name: 'Chăn Tuscany cao cấp LUOFUHOUSE 2 mặt lông thỏ siêu dày ấm (2m x 2m3 - 3.6kg)',
    category_id: 'mon-le',
    price: 799000,
    currency: 'VND',
    type: 'single',
    colors: ['be', 'xam', 'nau', 'hong', 'trang'],
    sizes: ['2m x 2m3 tiêu chuẩn (nặng 3.6kg ± 0.2kg)'],
    combo_items: [
      {
        name: 'Chăn Tuscany cao cấp LUOFUHOUSE',
        quantity: 1,
        note: 'Tuscany 480g kết hợp Lông thỏ 300g, kích thước 200x230cm, nặng 3.6kg ± 0.2kg'
      },
      {
        name: 'Túi xách Seven-Star Blanket chính hãng',
        quantity: 1,
        note: 'Túi đựng quai xách da tròn sang trọng, cao cấp'
      }
    ],
    description: `Tuscany — soft luxury in every touch. 🤍\nLUOFUHOUSE | Tuscany Collection giá ưu đãi 799.000đ.\n\nMềm mịn như mây, êm ái như một lớp lông tơ, phủ lên không gian ngủ một vẻ đẹp nhẹ nhàng và sang trọng.\n- Tên sản phẩm: Tuscany • 5 gam màu thời thượng\n- Chất liệu: Tuscany 480g kết hợp lông thỏ 300g siêu dày dặn, đầm ấm cho mùa đông đại hàn.\n- Kích thước: 200×230cm (2m x 2m3)\n- Trọng lượng: 3.6kg ± 0.2kg\n- Thương hiệu: LUOFUHOUSE\n- Đi kèm túi xách da hình trụ tròn Seven-Star Blanket cao cấp\n- Thiết kế tối giản – vẻ đẹp chuẩn aesthetic/Pinterest sang trọng.\n- 5 gam màu thanh lịch: Nâu be Camel, Xám ghi, Nâu socola, Hồng phấn, Trắng kem sữa.\n<!--cats:["mon-le","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsTuscany)}-->`,
    images: [...generalTuscany, ...mainTuscany],
    cover_image: baseTuscany + '14.jpg',
    featured: true,
    published: true,
  };

  const { data, error } = await supabase.from('products').upsert(prodTuscany, { onConflict: 'id' }).select();
  if (error) {
    console.error('Error saving Tuscany:', error);
    process.exit(1);
  }
  console.log(`✓ Đã lưu thành công ${prodTuscany.id} (${varsTuscany.length} mẫu, ${generalTuscany.length} ảnh chung)`);
}

main();
