import { ColorOption } from '../types/product';

export const DEFAULT_COLORS: ColorOption[] = [
  {
    id: 'be',
    label: 'Be Cát / Mộc',
    hex: '#e2d7c5',
    borderHex: '#cfc1ab',
  },
  {
    id: 'trang',
    label: 'Trắng Ngà / Ivory',
    hex: '#f7f5ef',
    borderHex: '#d8d3c5',
  },
  {
    id: 'nau',
    label: 'Nâu Đất',
    hex: '#8b6f56',
    borderHex: '#735942',
  },
  {
    id: 'xam',
    label: 'Xám Tro',
    hex: '#8e9194',
    borderHex: '#75777a',
  },
  {
    id: 'xanh-reu',
    label: 'Xanh Rêu / Sage',
    hex: '#7e8f7f',
    borderHex: '#667567',
  },
  {
    id: 'hong-dat',
    label: 'Hồng Đất',
    hex: '#c4978c',
    borderHex: '#ad8075',
  },
  {
    id: 'vang-nhat',
    label: 'Vàng Bơ',
    hex: '#ead9a8',
    borderHex: '#d5be86',
  },
  {
    id: 'xanh-navy',
    label: 'Xanh Navy',
    hex: '#2c3e50',
    borderHex: '#1a252f',
  },
  {
    id: 'xanh-mint',
    label: 'Xanh Bạc Hà / Mint',
    hex: '#a3c1ad',
    borderHex: '#8da896',
  },
  {
    id: 'xanh-duong',
    label: 'Xanh Da Trời',
    hex: '#a6c2d7',
    borderHex: '#8fa8bc',
  },
  {
    id: 'cam-dat',
    label: 'Cam Đất / Terracotta',
    hex: '#ba6d57',
    borderHex: '#a05844',
  },
  {
    id: 'tim-khoi',
    label: 'Tím Khói',
    hex: '#9e8f9e',
    borderHex: '#887988',
  },
  {
    id: 'caro',
    label: 'Kẻ Caro',
    hex: 'repeating-linear-gradient(45deg, #e4dfd7, #e4dfd7 5px, #c8beaf 5px, #c8beaf 10px)',
    borderHex: '#b5a999',
  },
  {
    id: 'ke-soc',
    label: 'Kẻ Sọc',
    hex: 'repeating-linear-gradient(90deg, #e4dfd7, #e4dfd7 6px, #c8beaf 6px, #c8beaf 12px)',
    borderHex: '#b5a999',
  },
  {
    id: 'hoa-nhi',
    label: 'Họa Tiết Hoa Nhí',
    hex: '#e3d8cc',
    borderHex: '#cbbfae',
  },
];

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

  // 1. Populate default colors
  for (const c of DEFAULT_COLORS) {
    map.set(c.id.toLowerCase(), c);
  }

  // 2. Overlay custom colors (custom overrides defaults with same id or slug)
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

  // Embed the hex in the ID (slug__hexCode) so any client/device can read the exact hex even without localStorage
  const id = colorInput.id || `${slug}__${hexCode}`;

  const customList = getCustomColors();
  // Match by id or by slug
  const existingIdx = customList.findIndex(
    (c) => c.id.toLowerCase() === id.toLowerCase() || c.id.toLowerCase() === slug.toLowerCase()
  );

  const newColor: ColorOption = {
    id,
    label: label || `Màu #${hexCode}`,
    hex: cleanHex,
    borderHex: cleanHex,
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
    return { id: 'default', label: 'Tiêu chuẩn', hex: '#e2d7c5' };
  }

  const all = getAllColors();

  // 1. Direct exact match in all colors
  const exact = all.find((c) => c.id.toLowerCase() === colorId.toLowerCase());
  if (exact) return exact;

  // 2. Decode embedded hex from ID (e.g. "cam-chay__ff5722" or "xanh-reu__3e5a3c")
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
      };
    }
  }

  // 3. Direct hex color value (e.g. "#3b82f6" or "3b82f6")
  if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorId)) {
    const cleanHex = colorId.startsWith('#') ? colorId : `#${colorId}`;
    return {
      id: colorId,
      label: cleanHex,
      hex: cleanHex,
      borderHex: cleanHex,
    };
  }

  // 4. Base slug match (e.g. colorId was "cam-chay__ff5722" and we look for "cam-chay")
  const baseSlug = colorId.split('__')[0].toLowerCase();
  const bySlug = all.find((c) => c.id.toLowerCase() === baseSlug);
  if (bySlug) return bySlug;

  // 5. Fallback with humanized label
  return {
    id: colorId,
    label: colorId.charAt(0).toUpperCase() + colorId.slice(1).replace(/[-_]/g, ' '),
    hex: '#7e8f7f',
  };
}
