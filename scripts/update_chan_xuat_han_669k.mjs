import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

async function updateProduct() {
  const baseXuatHan = 'https://sbtngmjupjsbvxckeshe.supabase.co/storage/v1/object/public/product-images/chan-dong-xuat-han/';

  const varsXuatHan = [
    { label: 'Mẫu 01 - Nâu be ấm áp (Korean Beige)', image: baseXuatHan + '07.jpg', colorId: 'be' },
    { label: 'Mẫu 02 - Xanh than hiện đại (Navy Blue)', image: baseXuatHan + '08.jpg', colorId: 'xanh-duong' },
    { label: 'Mẫu 03 - Ghi xám thanh lịch (Classic Grey)', image: baseXuatHan + '09.jpg', colorId: 'xam' },
  ];

  const updateData = {
    name: 'Chăn tuyết xuất Hàn dập gân cao cấp Korea Home cho trời mát (2m48 x 2m33 - 3.5kg)',
    price: 669000,
    sizes: ['2m48 x 2m33 (nặng khoảng 3.5kg)'],
    combo_items: [
      {
        name: 'Chăn tuyết xuất Hàn dập gân Korea Home',
        quantity: 1,
        note: 'Khổ rộng 2m48 x 2m33, nặng 3.5kg, mềm mịn mướt đỉnh cho mùa thu se lạnh / trời mát'
      },
      {
        name: 'Túi đựng tròn quai xách xuất Hàn',
        quantity: 1,
        note: 'Túi đựng chính hãng phong cách Hàn Quốc tiện lợi'
      }
    ],
    description: `Mát trời rồi, em mời các bác chốt đơn em chăn Hàn siêu mê.\n❤️Chất mịn mướt đỉnh, khổ rộng 2m48x2m33\nChăn nặng 3.5kg\n\nChăn xuất Hàn dập gân cao cấp Korea Home thiết kế sang trọng, thanh lịch giá 669.000đ.\nChất liệu nhung tuyết mịn mướt đỉnh cao, đầm tay ấm áp vừa vặn cho mùa thu se lạnh và những ngày trời mát mẻ, không lo bí bách hay xù lông phai màu.\n- Khổ siêu rộng: 2m48 x 2m33 thoải mái cho cả gia đình\n- Trọng lượng: 3.5kg dày dặn, đầm tay\n- Đi kèm túi đựng tròn quai xách phong cách Hàn Quốc\n- 3 gam màu dập gân thời thượng: Nâu be, Xanh than, Ghi xám\n<!--cats:["mon-le","chat-lieu-ni","mau-tron"]-->\n<!--vars:${JSON.stringify(varsXuatHan)}-->`,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', 'LE_CHAN_DONG_XUAT_HAN')
    .select();

  if (error) {
    console.error('Error updating product:', error);
    process.exit(1);
  }

  console.log('Successfully updated LE_CHAN_DONG_XUAT_HAN:', JSON.stringify(data, null, 2));
}

updateProduct();
