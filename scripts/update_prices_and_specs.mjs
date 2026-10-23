/**
 * scripts/update_prices_and_specs.mjs
 * 
 * 1. Update 199k products -> 195k:
 *    - price: 195000
 *    - slug: replace -199k with -195k
 *    - description: replace 199.000đ/199k with 195.000đ/195k, replace 15cm with 30cm
 *    - combo_items: update note from 15cm to 30cm
 * 
 * 2. Update 370k products -> 385k:
 *    - price: 385000
 *    - slug: replace -370k with -385k
 *    - description: replace 370.000đ/370k with 385.000đ/385k
 * 
 * 3. Update 380k products -> 399k:
 *    - price: 399000
 *    - slug: replace -380k with -399k
 *    - description: replace 380.000đ/380k with 399.000đ/399k
 * 
 * 4. For SET_XINKK_220K:
 *    - set published: false to hide while awaiting user instruction on correct price/photos/info
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('🔄 Bắt đầu cập nhật giá, độ dày ga 30cm và đồng bộ dữ liệu...\n');

  // 1. Cập nhật các sản phẩm 199k -> 195k và ga dày 30cm
  const { data: prods199, error: err199 } = await supabase
    .from('products')
    .select('*')
    .like('id', 'SET165%');

  if (err199) throw err199;

  console.log(`1. Tìm thấy ${prods199.length} sản phẩm 199k để chuyển về 195k & ga dày 30cm:`);
  for (const prod of prods199) {
    const newSlug = prod.slug.replace('-199k', '-195k');
    const newDesc = prod.description
      .replaceAll('199.000đ', '195.000đ')
      .replaceAll('199k', '195k')
      .replaceAll('15cm', '30cm');

    const newComboItems = (prod.combo_items || []).map(item => {
      if (item.name?.toLowerCase().includes('ga chun') || item.note?.includes('15cm')) {
        return { ...item, note: 'Vừa đệm dày tới 30cm' };
      }
      return item;
    });

    const { error } = await supabase
      .from('products')
      .update({
        price: 195000,
        slug: newSlug,
        description: newDesc,
        combo_items: newComboItems,
      })
      .eq('id', prod.id);

    if (error) {
      console.error(`  ❌ Lỗi cập nhật ${prod.id}:`, error.message);
    } else {
      console.log(`  ✓ ${prod.id} -> 195.000đ | slug: ${newSlug} | ga đệm: 30cm`);
    }
  }

  // 2. Cập nhật các sản phẩm 370k -> 385k
  const { data: prods370, error: err370 } = await supabase
    .from('products')
    .select('*')
    .in('id', ['SET370_HANQUOC_1', 'SET370_HANQUOC_2']);

  if (err370) throw err370;

  console.log(`\n2. Tìm thấy ${prods370.length} sản phẩm 370k để nâng lên 385k:`);
  for (const prod of prods370) {
    const newSlug = prod.slug.replace('-370k', '-385k');
    const newDesc = prod.description
      .replaceAll('370.000đ', '385.000đ')
      .replaceAll('370k', '385k');

    const { error } = await supabase
      .from('products')
      .update({
        price: 385000,
        slug: newSlug,
        description: newDesc,
      })
      .eq('id', prod.id);

    if (error) {
      console.error(`  ❌ Lỗi cập nhật ${prod.id}:`, error.message);
    } else {
      console.log(`  ✓ ${prod.id} -> 385.000đ | slug: ${newSlug}`);
    }
  }

  // 3. Cập nhật các sản phẩm 380k -> 399k
  const { data: prods380, error: err380 } = await supabase
    .from('products')
    .select('*')
    .like('id', 'SET4_380K%');

  if (err380) throw err380;

  console.log(`\n3. Tìm thấy ${prods380.length} sản phẩm 380k để nâng lên 399k:`);
  for (const prod of prods380) {
    const newSlug = prod.slug.replace('-380k', '-399k');
    const newDesc = prod.description
      .replaceAll('380.000đ', '399.000đ')
      .replaceAll('380k', '399k');

    const { error } = await supabase
      .from('products')
      .update({
        price: 399000,
        slug: newSlug,
        description: newDesc,
      })
      .eq('id', prod.id);

    if (error) {
      console.error(`  ❌ Lỗi cập nhật ${prod.id}:`, error.message);
    } else {
      console.log(`  ✓ ${prod.id} -> 399.000đ | slug: ${newSlug}`);
    }
  }

  // 4. Ẩn sản phẩm SET_XINKK_220K đang sai thông tin, ảnh và giá
  const { error: errXinkk } = await supabase
    .from('products')
    .update({ published: false })
    .eq('id', 'SET_XINKK_220K');

  if (errXinkk) {
    console.error(`  ❌ Lỗi ẩn SET_XINKK_220K:`, errXinkk.message);
  } else {
    console.log(`\n4. ✓ Đã ẩn sản phẩm SET_XINKK_220K (published: false) tránh khách hàng thấy thông tin sai.`);
  }

  console.log('\n🎉 Hoàn tất toàn bộ cập nhật!');
}

main().catch(console.error);
