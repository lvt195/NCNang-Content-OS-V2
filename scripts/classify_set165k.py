import os
import shutil
import hashlib
import json
import colorsys
from PIL import Image

src_root = '/Users/v003006/Desktop/NCNang/image/Set 165k'
dest_root = '/Users/v003006/Desktop/NCNang/image/Set 165k (Da phan loai)'

# Folder categories
fld_catalog = os.path.join(dest_root, '01_Anh_mau_Catalog')
fld_real = os.path.join(dest_root, '02_Anh_that_cuon_chan')
fld_screen = os.path.join(dest_root, '03_Screenshot_camera')
fld_dups = os.path.join(dest_root, '04_Anh_trung_lap')

# Ensure clean destination directory
if os.path.exists(dest_root):
    shutil.rmtree(dest_root)

os.makedirs(fld_real, exist_ok=True)
os.makedirs(fld_screen, exist_ok=True)
os.makedirs(fld_dups, exist_ok=True)

# Collect all files
all_files = []
for dirpath, _, filenames in os.walk(src_root):
    for f in filenames:
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')) and not f.startswith('.'):
            all_files.append(os.path.join(dirpath, f))

# Sort deterministically
all_files.sort()

# Check duplicates by md5
seen_hashes = {}
duplicates = []
unique_files = []

for p in all_files:
    with open(p, 'rb') as fp:
        h = hashlib.md5(fp.read()).hexdigest()
    if h in seen_hashes:
        duplicates.append((p, seen_hashes[h]))
    else:
        seen_hashes[h] = p
        unique_files.append(p)

def classify_color(img):
    w, h = img.size
    box = (int(w * 0.2), int(h * 0.3), int(w * 0.8), int(h * 0.7))
    crop = img.crop(box).convert('RGB')
    small = crop.resize((30, 30), Image.Resampling.BOX)
    pixels = list(small.getdata())
    r = sum(p[0] for p in pixels) / len(pixels)
    g = sum(p[1] for p in pixels) / len(pixels)
    b = sum(p[2] for p in pixels) / len(pixels)
    h_val, s_val, v_val = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
    h_deg = h_val * 360

    if s_val < 0.12:
        return 'Trang_Be_Kem' if v_val > 0.75 else ('Xam_Den' if v_val < 0.35 else 'Xam_Ghi')
    elif s_val < 0.22 and v_val > 0.6:
        return 'Trang_Be_Kem'
    elif h_deg < 25 or h_deg >= 340:
        return 'Hong_Do_Cam'
    elif 25 <= h_deg < 55:
        return 'Nau_Dat' if v_val < 0.55 else 'Vang_Kem'
    elif 55 <= h_deg < 165:
        return 'Xanh_La_Mint'
    elif 165 <= h_deg < 260:
        return 'Xanh_Duong_Navy'
    elif 260 <= h_deg < 340:
        return 'Tim_Lavender'
    return 'Trang_Be_Kem'

items_manifest = []

# Process unique files
catalog_counts = {}
real_idx = 1
screen_idx = 1

for p in unique_files:
    filename = os.path.basename(p)
    with Image.open(p) as img:
        w, h = img.size
        aspect = h / w

        if aspect > 1.8:
            # Vertical camera screenshot
            new_name = f'screen_{screen_idx:03d}.jpg'
            dest_dir = fld_screen
            category = 'Screenshot camera'
            group_tag = 'Screenshot'
            color_group = 'Khác'
            screen_idx += 1
        elif aspect > 1.2:
            # Phone camera photo of rolled/folded blanket
            new_name = f'anh_that_{real_idx:03d}.jpg'
            dest_dir = fld_real
            category = 'Ảnh thật cuộn chăn'
            group_tag = 'Ảnh thật'
            color_group = 'Đa sắc'
            real_idx += 1
        else:
            # Catalog square image
            color_group = classify_color(img)
            sub_dir = os.path.join(fld_catalog, color_group)
            os.makedirs(sub_dir, exist_ok=True)
            cnt = catalog_counts.get(color_group, 0) + 1
            catalog_counts[color_group] = cnt
            new_name = f'catalog_{color_group}_{cnt:03d}.jpg'
            dest_dir = sub_dir
            category = 'Ảnh mẫu Catalog'
            group_tag = f'Catalog: {color_group.replace("_", " / ")}'

        dest_path = os.path.join(dest_dir, new_name)
        shutil.copy2(p, dest_path)

        rel_path = os.path.relpath(dest_path, dest_root)
        items_manifest.append({
            'name': new_name,
            'rel_path': rel_path,
            'category': category,
            'group_tag': group_tag,
            'color': color_group,
            'w': w,
            'h': h,
            'orig_name': filename,
            'orig_folder': os.path.basename(os.path.dirname(p))
        })

# Process duplicates
dup_idx = 1
for dup_path, orig_path in duplicates:
    orig_name = os.path.basename(dup_path)
    new_name = f'trung_lap_{dup_idx:03d}.jpg'
    dest_path = os.path.join(fld_dups, new_name)
    shutil.copy2(dup_path, dest_path)
    rel_path = os.path.relpath(dest_path, dest_root)
    with Image.open(dup_path) as img:
        w, h = img.size
    items_manifest.append({
        'name': new_name,
        'rel_path': rel_path,
        'category': 'Ảnh trùng lặp',
        'group_tag': 'Trùng lặp (có thể xóa)',
        'color': 'Trùng',
        'w': w,
        'h': h,
        'orig_name': orig_name,
        'orig_folder': os.path.basename(os.path.dirname(dup_path)),
        'identical_to': os.path.basename(orig_path)
    })
    dup_idx += 1

# Generate interactive HTML Gallery
manifest_json = json.dumps(items_manifest, ensure_ascii=False)
html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bộ Sưu Tập Set 165k — Đã Phân Loại</title>
  <style>
    :root {{
      --bg: #faf7f2;
      --card-bg: #ffffff;
      --text: #2c2523;
      --text-muted: #8c827a;
      --primary: #946846;
      --primary-hover: #7d5435;
      --border: #e8e2d9;
      --tag-bg: #f3efe8;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 24px 20px 80px;
    }}
    header {{
      max-width: 1400px;
      margin: 0 auto 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }}
    h1 {{
      font-size: 26px;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 8px;
    }}
    p.subtitle {{
      color: var(--text-muted);
      font-size: 14px;
    }}
    .stats-bar {{
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 16px;
    }}
    .stat-chip {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }}
    .stat-chip:hover, .stat-chip.active {{
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }}
    .grid {{
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }}
    .card:hover {{
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }}
    .thumb-wrap {{
      width: 100%;
      aspect-ratio: 1;
      background: #f0ebe4;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .thumb-wrap.portrait {{
      aspect-ratio: 9/16;
      max-height: 280px;
    }}
    .thumb-wrap img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .info {{
      padding: 10px 12px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }}
    .name {{
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text);
    }}
    .badge {{
      display: inline-block;
      align-self: flex-start;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--tag-bg);
      color: var(--primary);
      font-size: 11px;
      font-weight: 500;
    }}
    .meta {{
      color: var(--text-muted);
      font-size: 11px;
    }}

    /* Lightbox Modal */
    .lightbox {{
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(20, 16, 14, 0.88);
      z-index: 9999;
      justify-content: center;
      align-items: center;
      padding: 24px;
    }}
    .lightbox.active {{
      display: flex;
    }}
    .lightbox-content {{
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      object-fit: contain;
    }}
    .close-btn {{
      position: absolute;
      top: 20px;
      right: 28px;
      color: #fff;
      font-size: 32px;
      font-weight: 300;
      cursor: pointer;
    }}
  </style>
</head>
<body>
  <header>
    <h1>Nhà Có Mùi Nắng — Phân Loại Ảnh [Set 165k]</h1>
    <p class="subtitle">Tổng cộng 161 ảnh: 112 ảnh mẫu catalog bọc đệm, 23 ảnh chụp thật cuộn vải, 22 screenshot camera, 4 ảnh tải trùng.</p>
    <div class="stats-bar" id="filters"></div>
  </header>

  <div class="grid" id="grid"></div>

  <div class="lightbox" id="lightbox" onclick="closeLightbox(event)">
    <span class="close-btn" onclick="closeLightbox()">&times;</span>
    <img id="lb-img" class="lightbox-content" src="" alt="preview">
  </div>

  <script>
    const items = {manifest_json};

    const categories = ['Tất cả (161)', 'Ảnh mẫu Catalog (112)', 'Ảnh thật cuộn chăn (23)', 'Screenshot camera (22)', 'Ảnh trùng lặp (4)'];
    let currentFilter = 'Tất cả (161)';

    const filtersEl = document.getElementById('filters');
    const gridEl = document.getElementById('grid');
    const lightboxEl = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');

    categories.forEach(cat => {{
      const btn = document.createElement('div');
      btn.className = 'stat-chip' + (cat === currentFilter ? ' active' : '');
      btn.textContent = cat;
      btn.onclick = () => {{
        document.querySelectorAll('.stat-chip').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = cat;
        render();
      }};
      filtersEl.appendChild(btn);
    }});

    function render() {{
      gridEl.innerHTML = '';
      const filtered = items.filter(it => {{
        if (currentFilter.startsWith('Tất cả')) return true;
        if (currentFilter.startsWith('Ảnh mẫu Catalog')) return it.category === 'Ảnh mẫu Catalog';
        if (currentFilter.startsWith('Ảnh thật cuộn chăn')) return it.category === 'Ảnh thật cuộn chăn';
        if (currentFilter.startsWith('Screenshot camera')) return it.category === 'Screenshot camera';
        if (currentFilter.startsWith('Ảnh trùng lặp')) return it.category === 'Ảnh trùng lặp';
        return true;
      }});

      filtered.forEach(item => {{
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openLightbox(item.rel_path);

        const isPortrait = item.h / item.w > 1.3;
        card.innerHTML = `
          <div class="thumb-wrap ${{isPortrait ? 'portrait' : ''}}">
            <img src="${{item.rel_path}}" alt="${{item.name}}" loading="lazy" />
          </div>
          <div class="info">
            <div class="name" title="${{item.name}}">${{item.name}}</div>
            <span class="badge">${{item.group_tag}}</span>
            <div class="meta">${{item.w}} × ${{item.h}} px</div>
          </div>
        `;
        gridEl.appendChild(card);
      }});
    }}

    function openLightbox(src) {{
      lbImg.src = src;
      lightboxEl.classList.add('active');
    }}
    function closeLightbox(e) {{
      if (!e || e.target !== lbImg) {{
        lightboxEl.classList.remove('active');
      }}
    }}
    window.addEventListener('keydown', e => {{
      if (e.key === 'Escape') closeLightbox();
    }});

    render();
  </script>
</body>
</html>
"""

with open(os.path.join(dest_root, 'gallery.html'), 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Classification completed successfully!")
print(f"Destination: {dest_root}")
print(f"Catalog items: {sum(catalog_counts.values())} in {len(catalog_counts)} color groups: {catalog_counts}")
print(f"Real blanket items: {real_idx - 1}")
print(f"Screenshot camera items: {screen_idx - 1}")
print(f"Duplicate items isolated: {dup_idx - 1}")
