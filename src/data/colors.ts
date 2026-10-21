import { ColorOption, ParentColorGroup, Product } from '../types/product';
import { normalizeVietnamese } from '../utils/filterProducts';

/**
 * 14 Parent Color Groups based on real bedding industry standards:
 * - 11 Solid Colors (Màu trơn)
 * - 3 Pattern / Special Groups (Họa tiết / Đặc biệt)
 */
export const PARENT_COLOR_GROUPS: ParentColorGroup[] = [
  // --- 1. Nhóm màu trơn (Solid Colors) - 11 màu ---
  {
    id: 'trang',
    name: 'Trắng',
    description: 'Trắng tinh, trắng sữa, trắng ngà (màu ga khách sạn phổ biến)',
    type: 'solid',
    hex: '#fbfaf7',
    borderHex: '#d8d3c5',
    subColors: ['trang', 'trang-tinh', 'trang-sua', 'trang-nga', 'ivory', 'white', 'kem-trang'],
    keywords: ['trắng', 'trang', 'ivory', 'trắng tinh', 'trắng sữa', 'trắng ngà', 'bạch'],
  },
  {
    id: 'be',
    name: 'Be / Kem',
    description: 'Vải thô tự nhiên, màu oatmeal (yến mạch), màu cát',
    type: 'solid',
    hex: '#e2d7c5',
    borderHex: '#cfc1ab',
    subColors: ['be', 'kem', 'be-cat', 'cat', 'oatmeal', 'yen-mach', 'moc', 'linen', 'tho'],
    keywords: ['be', 'kem', 'cát', 'oatmeal', 'yến mạch', 'mộc', 'linen', 'thô', 'be cát', 'be kem', 'be nâu'],
  },
  {
    id: 'xam',
    name: 'Xám / Ghi',
    description: 'Xám nhạt, xám khói, xám đậm, ghi (sạch và hiện đại)',
    type: 'solid',
    hex: '#8e9194',
    borderHex: '#75777a',
    subColors: ['xam', 'ghi', 'xam-tro', 'xam-khoi', 'xam-dam', 'silver', 'bac'],
    keywords: ['xám', 'ghi', 'tro', 'khói', 'xám tro', 'xám khói', 'xám đậm', 'xám ghi', 'ghi xám'],
  },
  {
    id: 'xanh-duong',
    name: 'Xanh dương',
    description: 'Xanh navy, xanh coban, xanh denim, xanh pastel, xanh da trời',
    type: 'solid',
    hex: '#4a7bb0',
    borderHex: '#365e8a',
    subColors: ['xanh-duong', 'xanh-da-troi', 'xanh-navy', 'navy', 'coban', 'denim', 'blue', 'da-troi'],
    keywords: ['xanh dương', 'xanh da trời', 'navy', 'coban', 'denim', 'xanh biển', 'da trời', 'xanh đậm'],
  },
  {
    id: 'xanh-la',
    name: 'Xanh lá',
    description: 'Xanh mint (bạc hà), xanh rêu, xanh lục bảo, xanh sage, xanh bơ',
    type: 'solid',
    hex: '#6b8e6b',
    borderHex: '#537353',
    subColors: ['xanh-la', 'xanh-reu', 'xanh-mint', 'mint', 'reu', 'sage', 'luc-bao', 'bo', 'com'],
    keywords: ['xanh lá', 'xanh rêu', 'xanh mint', 'bạc hà', 'rêu', 'sage', 'lục bảo', 'quả bơ', 'cốm', 'cây'],
  },
  {
    id: 'hong',
    name: 'Hồng',
    description: 'Hồng phấn, hồng đất, hồng cam, dâu tây (phái nữ rất chuộng)',
    type: 'solid',
    hex: '#d48c96',
    borderHex: '#b86d78',
    subColors: ['hong', 'hong-dat', 'hong-phan', 'hong-cam', 'dau-tay', 'dao', 'pink'],
    keywords: ['hồng', 'hồng đất', 'hồng phấn', 'hồng cam', 'dâu tây', 'hồng đào', 'cam đào', 'dâu', 'nơ'],
  },
  {
    id: 'vang',
    name: 'Vàng',
    description: 'Vàng nhạt, vàng bơ, vàng chanh, vàng nghệ',
    type: 'solid',
    hex: '#e8c86d',
    borderHex: '#cca746',
    subColors: ['vang', 'vang-nhat', 'vang-bo', 'vang-chanh', 'vang-nghe', 'kem-vang'],
    keywords: ['vàng', 'vàng nhạt', 'vàng bơ', 'vàng chanh', 'vàng nghệ', 'pooh', 'chuối', 'bơ'],
  },
  {
    id: 'tim',
    name: 'Tím',
    description: 'Tím khoai môn, tím nhạt, tím oải hương (Lavender), tím khói',
    type: 'solid',
    hex: '#9c84ab',
    borderHex: '#7e658e',
    subColors: ['tim', 'tim-khoi', 'tim-pastel', 'khoai-mon', 'lavender', 'tim-nhat'],
    keywords: ['tím', 'tím khói', 'tím pastel', 'khoai môn', 'lavender', 'oải hương', 'tím nhạt'],
  },
  {
    id: 'nau',
    name: 'Nâu',
    description: 'Nâu tây, nâu đất, nâu cà phê, hạt dẻ, socola',
    type: 'solid',
    hex: '#7d5b42',
    borderHex: '#61432c',
    subColors: ['nau', 'nau-dat', 'nau-tay', 'ca-phe', 'socola', 'hat-de'],
    keywords: ['nâu', 'nâu đất', 'nâu tây', 'cà phê', 'socola', 'hạt dẻ', 'teddy', 'nâu đậm'],
  },
  {
    id: 'do',
    name: 'Đỏ / Đỏ đô',
    description: 'Đỏ nhung, đỏ mận, đỏ tươi, đỏ tết (bán chạy dịp Tết, đám cưới)',
    type: 'solid',
    hex: '#b83a3a',
    borderHex: '#912424',
    subColors: ['do', 'do-do', 'do-nhung', 'do-man', 'do-tuoi', 'ruou-vang'],
    keywords: ['đỏ', 'đỏ đô', 'đỏ nhung', 'đỏ mận', 'đỏ tươi', 'rượu vang', 'đỏ tết', 'mận'],
  },
  {
    id: 'den',
    name: 'Đen / Than',
    description: 'Tông màu tối cá tính cho nam giới hoặc phong cách Industrial',
    type: 'solid',
    hex: '#2a2b2c',
    borderHex: '#181819',
    subColors: ['den', 'than', 'than-chi', 'black'],
    keywords: ['đen', 'than', 'than chì', 'đen tuyền', 'đen trắng'],
  },

  // --- 2. Nhóm màu họa tiết / Đặc biệt - 3 nhóm bắt buộc ---
  {
    id: 'hoa-la',
    name: 'Họa tiết Hoa / Lá',
    description: 'Dành cho các dòng ga vải in hoa nhí, hoa cỏ thiên nhiên, vintage',
    type: 'pattern',
    hex: 'linear-gradient(135deg, #fcefe9 0%, #ecd0c3 100%)',
    borderHex: '#cbbfae',
    icon: 'flower',
    subColors: ['hoa-la', 'hoa-nhi', 'hoa-co', 'hoa-cuc', 'hoa-tulip', 'hoa', 'vintage-hoa'],
    keywords: ['hoa nhí', 'hoa cúc', 'hoa cỏ', 'hoa', 'tulip', 'đồng nội', 'cỏ cây', 'lá', 'hoa lá'],
  },
  {
    id: 'ke-caro',
    name: 'Họa tiết Kẻ / Hình học',
    description: 'Dành cho ga kẻ caro (gingham), kẻ sọc, hình khối hiện đại',
    type: 'pattern',
    hex: 'repeating-linear-gradient(45deg, #e4dfd7, #e4dfd7 5px, #c8beaf 5px, #c8beaf 10px)',
    borderHex: '#b5a999',
    icon: 'grid',
    subColors: ['ke-caro', 'caro', 'ke-soc', 'soc', 'hinh-hoc', 'zigzag', 'gingham'],
    keywords: ['caro', 'kẻ sọc', 'kẻ caro', 'sọc', 'hình học', 'zigzag', 'gingham', 'kẻ'],
  },
  {
    id: 'nhieu-mau',
    name: 'Nhiều màu / Phối màu',
    description: 'Ga giường dạng block màu hoặc ga loang màu (Ombre), cầu vồng',
    type: 'pattern',
    hex: 'linear-gradient(135deg, #e8a87c 0%, #c38d9e 50%, #41b3a3 100%)',
    borderHex: '#a89078',
    icon: 'palette',
    subColors: ['nhieu-mau', 'phoi-mau', 'color-block', 'ombre', 'cau-vong', 'loang-mau'],
    keywords: ['nhiều màu', 'phối màu', 'color-block', 'ombre', 'cầu vồng', 'loang màu', 'sắc màu'],
  },
];

/**
 * Default color list for swatch rendering & dropdowns
 */
export const DEFAULT_COLORS: ColorOption[] = PARENT_COLOR_GROUPS.map((g) => ({
  id: g.id,
  label: g.name,
  hex: g.hex,
  borderHex: g.borderHex,
  parentId: g.id,
}));

const STORAGE_KEY = 'ncnang_custom_colors';

export function slugifyColor(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getParentColorGroups(): ParentColorGroup[] {
  return PARENT_COLOR_GROUPS;
}

/**
 * Find the parent color group of any color ID, sub-color, or label
 */
export function getParentColorGroup(colorIdOrSlug: string): ParentColorGroup | null {
  if (!colorIdOrSlug) return null;
  const norm = colorIdOrSlug.toLowerCase().trim();

  // 1. Direct match on parent ID
  const direct = PARENT_COLOR_GROUPS.find((g) => g.id.toLowerCase() === norm);
  if (direct) return direct;

  // 2. Match in subColors array
  const bySub = PARENT_COLOR_GROUPS.find((g) =>
    g.subColors.some((sub) => sub.toLowerCase() === norm || norm.includes(sub.toLowerCase()))
  );
  if (bySub) return bySub;

  // 3. Match in keywords
  const normNoAccents = normalizeVietnamese(norm);
  const byKeyword = PARENT_COLOR_GROUPS.find((g) =>
    g.keywords.some((kw) => {
      const kwNorm = normalizeVietnamese(kw);
      return normNoAccents.includes(kwNorm);
    })
  );
  if (byKeyword) return byKeyword;

  return null;
}

/**
 * Check if a child color matches a parent color group
 */
export function isColorInParentGroup(childColorId: string, parentGroupId: string): boolean {
  if (!childColorId || !parentGroupId) return false;
  if (childColorId.toLowerCase() === parentGroupId.toLowerCase()) return true;

  const parent = PARENT_COLOR_GROUPS.find((g) => g.id.toLowerCase() === parentGroupId.toLowerCase());
  if (!parent) return false;

  const childNorm = childColorId.toLowerCase().trim();
  const childNoAccents = normalizeVietnamese(childNorm);

  if (parent.subColors.some((sub) => sub.toLowerCase() === childNorm || childNorm.includes(sub.toLowerCase()))) {
    return true;
  }

  return parent.keywords.some((kw) => childNoAccents.includes(normalizeVietnamese(kw)));
}

/**
 * Auto-detect parent colors & patterns from a product's name, description, colors, and variants
 */
export function detectParentColorsFromProduct(product: Partial<Product>): string[] {
  const detected = new Set<string>();

  // 1. Check existing colors on product
  if (Array.isArray(product.colors)) {
    for (const c of product.colors) {
      const parent = getParentColorGroup(c);
      if (parent) detected.add(parent.id);
    }
  }

  // 2. Check variants
  if (Array.isArray(product.variants)) {
    for (const v of product.variants) {
      if (v.color) {
        const pColor = getParentColorGroup(v.color);
        if (pColor) detected.add(pColor.id);
      }
      if (v.label) {
        const pLabel = getParentColorGroup(v.label);
        if (pLabel) detected.add(pLabel.id);
      }
    }
  }

  // 3. Check name and description text
  const fullText = normalizeVietnamese(`${product.name || ''} ${product.description || ''}`.toLowerCase());
  for (const group of PARENT_COLOR_GROUPS) {
    if (group.keywords.some((kw) => fullText.includes(normalizeVietnamese(kw)))) {
      detected.add(group.id);
    }
  }

  return Array.from(detected);
}

/**
 * Master color matcher for catalog filtering
 */
export function doesProductMatchColor(product: Product, filterColorId: string): boolean {
  if (!filterColorId || filterColorId === 'all') return true;

  const targetGroup = getParentColorGroup(filterColorId);
  const targetParentId = targetGroup ? targetGroup.id : filterColorId.toLowerCase();

  // 1. Check product colors array
  if (Array.isArray(product.colors)) {
    for (const c of product.colors) {
      if (isColorInParentGroup(c, targetParentId)) return true;
    }
  }

  // 2. Check product variants
  if (Array.isArray(product.variants)) {
    for (const v of product.variants) {
      if (v.color && isColorInParentGroup(v.color, targetParentId)) return true;
      if (v.label && isColorInParentGroup(v.label, targetParentId)) return true;
    }
  }

  // 3. Check product name & description keywords if target group has keywords
  if (targetGroup) {
    const normText = normalizeVietnamese(`${product.name} ${product.description || ''}`);
    if (targetGroup.keywords.some((kw) => normText.includes(normalizeVietnamese(kw)))) {
      return true;
    }
  }

  return false;
}

export function getCustomColors(): ColorOption[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read custom colors from localStorage:', err);
    return [];
  }
}

export function getAllColors(): ColorOption[] {
  const custom = getCustomColors();
  const map = new Map<string, ColorOption>();

  // 1. Populate default colors (14 parent groups)
  for (const c of DEFAULT_COLORS) {
    map.set(c.id.toLowerCase(), c);
  }

  // 2. Overlay custom colors
  for (const c of custom) {
    if (c && c.id) {
      map.set(c.id.toLowerCase(), c);
      const baseSlug = c.id.split('__')[0].toLowerCase();
      if (baseSlug && baseSlug !== c.id.toLowerCase()) {
        map.set(baseSlug, c);
      }
    }
  }

  return Array.from(new Set(map.values()));
}

export function saveCustomColor(colorInput: { label: string; hex: string; id?: string }): ColorOption {
  const label = colorInput.label.trim();
  const rawHex = colorInput.hex.trim();
  const cleanHex = rawHex.startsWith('#') ? rawHex.toLowerCase() : `#${rawHex.toLowerCase()}`;
  const hexCode = cleanHex.replace('#', '');
  const slug = slugifyColor(label) || `color-${Date.now()}`;

  const id = colorInput.id || `${slug}__${hexCode}`;
  const parent = getParentColorGroup(label) || getParentColorGroup(slug);

  const customList = getCustomColors();
  const existingIdx = customList.findIndex(
    (c) => c.id.toLowerCase() === id.toLowerCase() || c.id.toLowerCase() === slug.toLowerCase()
  );

  const newColor: ColorOption = {
    id,
    label: label || `Màu #${hexCode}`,
    hex: cleanHex,
    borderHex: cleanHex,
    parentId: parent ? parent.id : undefined,
  };

  if (existingIdx >= 0) {
    customList[existingIdx] = newColor;
  } else {
    customList.push(newColor);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customList));
      window.dispatchEvent(new Event('ncnang_colors_updated'));
    } catch (e) {
      console.error('Failed to save custom color:', e);
    }
  }

  return newColor;
}

export function deleteCustomColor(colorId: string): void {
  const baseTarget = colorId.split('__')[0].toLowerCase();
  const customList = getCustomColors().filter(
    (c) => c.id.toLowerCase() !== colorId.toLowerCase() && c.id.toLowerCase() !== baseTarget
  );
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customList));
      window.dispatchEvent(new Event('ncnang_colors_updated'));
    } catch (e) {
      console.error('Failed to delete custom color:', e);
    }
  }
}

export function getColorOption(colorId: string): ColorOption {
  if (!colorId) {
    return { id: 'be', label: 'Be / Kem', hex: '#e2d7c5', borderHex: '#cfc1ab' };
  }

  // Check 14 parent color groups first
  const parent = getParentColorGroup(colorId);
  if (parent && (parent.id.toLowerCase() === colorId.toLowerCase() || !colorId.includes('__'))) {
    return {
      id: parent.id,
      label: parent.name,
      hex: parent.hex,
      borderHex: parent.borderHex,
      parentId: parent.id,
    };
  }

  const all = getAllColors();

  // 1. Direct exact match in all colors
  const exact = all.find((c) => c.id.toLowerCase() === colorId.toLowerCase());
  if (exact) return exact;

  // 2. Decode embedded hex from ID (e.g. "cam-chay__ff5722")
  if (colorId.includes('__') || colorId.includes('_#')) {
    const parts = colorId.split(/__|_#/);
    const slugPart = parts[0];
    const hexPart = parts[1];
    if (hexPart && /^[0-9a-fA-F]{3,8}$/.test(hexPart.replace('#', ''))) {
      const cleanHex = hexPart.startsWith('#') ? hexPart : `#${hexPart}`;
      const baseMatch = all.find((c) => c.id.toLowerCase() === slugPart.toLowerCase());
      const label = baseMatch
        ? baseMatch.label
        : slugPart
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
      return {
        id: colorId,
        label,
        hex: cleanHex,
        borderHex: cleanHex,
        parentId: parent ? parent.id : undefined,
      };
    }
  }

  // 3. Fallback to parent group if resolved
  if (parent) {
    return {
      id: parent.id,
      label: parent.name,
      hex: parent.hex,
      borderHex: parent.borderHex,
      parentId: parent.id,
    };
  }

  return {
    id: colorId,
    label: colorId.charAt(0).toUpperCase() + colorId.slice(1).replace(/[-_]/g, ' '),
    hex: '#7e8f7f',
  };
}
