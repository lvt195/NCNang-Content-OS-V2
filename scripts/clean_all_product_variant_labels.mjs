import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const url = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const supabase = createClient(url, key);

async function main() {
  const { data: prods, error: fetchErr } = await supabase.from('products').select('*');
  if (fetchErr) {
    console.error('Error fetching products:', fetchErr);
    process.exit(1);
  }

  console.log(`Fetched ${prods.length} products. Checking for "Mẫu XX" in variants...`);

  let updatedCount = 0;

  for (const prod of prods) {
    if (!prod.description) continue;
    const match = prod.description.match(/<!--vars:(.*?)-->/);
    if (!match) continue;

    let vars;
    try {
      vars = JSON.parse(match[1]);
    } catch (e) {
      console.warn(`Could not parse vars for ${prod.id}`);
      continue;
    }

    if (!Array.isArray(vars) || vars.length === 0) continue;

    const hasMau = vars.some(v => /^Mẫu\s*\d+/i.test(v.label));
    if (!hasMau) continue;

    console.log(`\nProcessing ${prod.id} (${prod.name}) - ${vars.length} variants:`);

    let newVars;
    if (prod.id === 'SET4_DUI_REN_450K') {
      newVars = vars.map((v, i) => ({
        ...v,
        label: `Đũi ren ${String(i + 1).padStart(2, '0')}`,
      }));
    } else if (prod.id === 'SET4_DUI_XOP_399K') {
      newVars = vars.map((v, i) => ({
        ...v,
        label: `Đũi Hàn ${String(i + 1).padStart(2, '0')}`,
      }));
    } else {
      newVars = vars.map((v) => {
        let clean = v.label.replace(/^Mẫu\s*\d+[\s\-:.]+/i, '').trim();
        return {
          ...v,
          label: clean || v.label,
        };
      });
    }

    console.log(`   Before: "${vars[0].label}"`);
    console.log(`   After:  "${newVars[0].label}"`);

    const newDescription = prod.description.replace(
      /<!--vars:.*?-->/,
      `<!--vars:${JSON.stringify(newVars)}-->`
    );

    const { error: updateErr } = await supabase
      .from('products')
      .update({
        description: newDescription,
        updated_at: new Date().toISOString(),
      })
      .eq('id', prod.id);

    if (updateErr) {
      console.error(`Error updating ${prod.id}:`, updateErr.message);
    } else {
      updatedCount++;
      console.log(`   ✓ Updated ${prod.id}`);
    }
  }

  console.log(`\n==============================================`);
  console.log(`Successfully updated ${updatedCount} products in Supabase!`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
