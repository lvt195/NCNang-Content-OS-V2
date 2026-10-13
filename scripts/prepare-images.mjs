import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcImageDir = path.resolve(rootDir, 'image');
const publicImagesDir = path.resolve(rootDir, 'public', 'images');

// Ensure destination root exists
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Find cwebp binary
let cwebpPath = '/opt/homebrew/bin/cwebp';
if (!fs.existsSync(cwebpPath)) {
  try {
    cwebpPath = execSync('which cwebp').toString().trim();
  } catch {
    cwebpPath = 'cwebp';
  }
}

console.log(`Using cwebp: ${cwebpPath}`);

// Helper to convert an image to webp
function convertToWebp(sourcePath, destPath, quality = 82) {
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  // cwebp -q 82 -resize 1200 0 for portrait/landscape preservation
  const cmd = `"${cwebpPath}" -q ${quality} -resize 1200 0 "${sourcePath}" -o "${destPath}"`;
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error(`Failed to convert ${sourcePath} -> ${destPath}:`, err.message);
    return false;
  }
}

// Define products to map from source images
// Threads 1: Threads_Ch_n_ga_g__m__xinkk_iu_h_t_ph__1786502149
const t1Dir = path.join(srcImageDir, 'Threads_Ch_n_ga_g__m__xinkk_iu_h_t_ph__1786502149');
// Threads 2: Threads___D__do_l__h_ng_em_t__nh_p_v___1786502524
const t2Dir = path.join(srcImageDir, 'Threads___D__do_l__h_ng_em_t__nh_p_v___1786502524');

// We organize 10 curated products matching the linen & bedding inventory
const productMappings = [
  {
    id: 'BCG001',
    images: [
      path.join(t1Dir, 'image.jpg'),
      path.join(t1Dir, 'image_1.jpg'),
      path.join(t1Dir, 'image_2.jpg'),
      path.join(t1Dir, 'image_3.jpg'),
    ]
  },
  {
    id: 'BCG002',
    images: [
      path.join(t2Dir, 'image_1.jpg'),
      path.join(t2Dir, 'image_2.jpg'),
      path.join(t2Dir, 'image_3.jpg'),
    ]
  },
  {
    id: 'GA001',
    images: [
      path.join(t1Dir, 'image_4.jpg'),
      path.join(t1Dir, 'image_5.jpg'),
      path.join(t1Dir, 'image_6.jpg'),
    ]
  },
  {
    id: 'GA002',
    images: [
      path.join(t2Dir, 'image_10.jpg'),
      path.join(t2Dir, 'image_11.jpg'),
      path.join(t2Dir, 'image_12.jpg'),
    ]
  },
  {
    id: 'GA003',
    images: [
      path.join(t2Dir, 'image_20.jpg'),
      path.join(t2Dir, 'image_21.jpg'),
      path.join(t2Dir, 'image_22.jpg'),
    ]
  },
  {
    id: 'VG001',
    images: [
      path.join(t1Dir, 'image_7.jpg'),
      path.join(t1Dir, 'image_8.jpg'),
    ]
  },
  {
    id: 'VG002',
    images: [
      path.join(t2Dir, 'image_15.jpg'),
      path.join(t2Dir, 'image_16.jpg'),
      path.join(t2Dir, 'image_17.jpg'),
    ]
  },
  {
    id: 'CH001',
    images: [
      path.join(t1Dir, 'image_9.jpg'),
      path.join(t1Dir, 'image_10.jpg'),
    ]
  },
  {
    id: 'CH002',
    images: [
      path.join(t2Dir, 'image_25.jpg'),
      path.join(t2Dir, 'image_26.jpg'),
    ]
  },
  {
    id: 'CB001',
    images: [
      path.join(t1Dir, 'image_13.jpg'),
      path.join(t1Dir, 'image_14.jpg'),
      path.join(t1Dir, 'image_15.jpg'),
      path.join(t1Dir, 'image_16.jpg'),
    ]
  },
  {
    id: 'CB002',
    images: [
      path.join(t2Dir, 'image_30.jpg'),
      path.join(t2Dir, 'image_31.jpg'),
      path.join(t2Dir, 'image_32.jpg'),
    ]
  },
  {
    id: 'BCG003',
    images: [
      path.join(t2Dir, 'image_35.jpg'),
      path.join(t2Dir, 'image_36.jpg'),
      path.join(t2Dir, 'image_37.jpg'),
    ]
  }
];

console.log(`Processing ${productMappings.length} products...`);

let totalConverted = 0;

for (const p of productMappings) {
  const destProductDir = path.join(publicImagesDir, p.id);
  if (!fs.existsSync(destProductDir)) {
    fs.mkdirSync(destProductDir, { recursive: true });
  }

  p.images.forEach((imgSrc, index) => {
    if (!fs.existsSync(imgSrc)) {
      console.warn(`Source not found: ${imgSrc}`);
      return;
    }
    const filename = index === 0 ? 'cover.webp' : `${String(index + 1).padStart(2, '0')}.webp`;
    const destPath = path.join(destProductDir, filename);
    const ok = convertToWebp(imgSrc, destPath);
    if (ok) totalConverted++;
  });
}

// Also create an og-cover.webp
const ogSrc = path.join(t1Dir, 'image.jpg');
if (fs.existsSync(ogSrc)) {
  convertToWebp(ogSrc, path.join(publicImagesDir, 'og-cover.webp'), 85);
  console.log('Generated og-cover.webp');
}

console.log(`Successfully converted ${totalConverted} images to public/images/<productId>/*.webp!`);
