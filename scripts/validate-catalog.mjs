import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');

// Read initial products
const initialProductsFilePath = path.resolve(rootDir, 'src', 'data', 'initialProducts.ts');
const fileContent = fs.readFileSync(initialProductsFilePath, 'utf-8');

// Parse products array using regex / JSON evaluation
const jsonMatch = fileContent.match(/export const INITIAL_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);\n/);
if (!jsonMatch) {
  console.error('❌ Could not parse INITIAL_PRODUCTS from initialProducts.ts');
  process.exit(1);
}

let products = [];
try {
  // Convert TypeScript object syntax to valid JSON for parsing
  const cleanJson = jsonMatch[1]
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
    .replace(/'/g, '"')
    .replace(/,\s*([}\]])/g, '$1');
  products = JSON.parse(cleanJson);
} catch {
  // Alternatively evaluate directly in VM
  const evalStr = jsonMatch[1].replace(/Product/g, '');
  products = eval(`(${evalStr})`);
}

console.log(`\n🔍 AUDITING PRODUCT CATALOG (${products.length} products)...\n`);

let errors = 0;
let warnings = 0;

const seenIds = new Set();
const seenSlugs = new Set();

for (const p of products) {
  // 1. Validate ID
  if (!p.id) {
    console.error(`❌ Product without ID found: ${JSON.stringify(p.name)}`);
    errors++;
  } else if (seenIds.has(p.id)) {
    console.error(`❌ Duplicate Product ID detected: "${p.id}"`);
    errors++;
  } else {
    seenIds.add(p.id);
  }

  // 2. Validate Slug
  if (!p.slug) {
    console.error(`❌ Product "${p.id}" has no slug`);
    errors++;
  } else if (seenSlugs.has(p.slug)) {
    console.error(`❌ Duplicate slug detected: "${p.slug}"`);
    errors++;
  } else {
    seenSlugs.add(p.slug);
  }

  // 3. Validate Name & Price
  if (!p.name) {
    console.error(`❌ Product "${p.id}" is missing a name`);
    errors++;
  }
  if (typeof p.price !== 'number' || p.price < 0 || isNaN(p.price)) {
    console.error(`❌ Product "${p.id}" has invalid price: ${p.price}`);
    errors++;
  }

  // 4. Validate Images
  if (!p.images || !Array.isArray(p.images) || p.images.length === 0) {
    console.warn(`⚠️ Warning: Product "${p.id}" has no images recorded`);
    warnings++;
  } else {
    for (const imgPath of p.images) {
      if (imgPath.startsWith('/images/')) {
        const localPath = path.join(publicDir, imgPath);
        if (!fs.existsSync(localPath)) {
          console.error(`❌ Missing image file on disk: ${imgPath} (Product: ${p.id})`);
          errors++;
        }
      }
    }
  }

  // 5. Validate Cover image
  if (p.coverImage && p.coverImage.startsWith('/images/')) {
    const localCover = path.join(publicDir, p.coverImage);
    if (!fs.existsSync(localCover)) {
      console.error(`❌ Cover image not found on disk: ${p.coverImage} (Product: ${p.id})`);
      errors++;
    }
  }
}

console.log(`----------------------------------------`);
console.log(`Audit Summary:`);
console.log(`• Total Products Tested: ${products.length}`);
console.log(`• Unique IDs: ${seenIds.size}`);
console.log(`• Errors: ${errors}`);
console.log(`• Warnings: ${warnings}`);
console.log(`----------------------------------------\n`);

if (errors > 0) {
  console.error(`❌ Catalog validation failed with ${errors} errors.`);
  process.exit(1);
} else {
  console.log(`✅ All catalog integrity and image path checks passed successfully!\n`);
  process.exit(0);
}
