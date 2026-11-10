export interface MaterialOption {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  keywords: string[];
}

export const MATERIALS: MaterialOption[] = [
  {
    id: 'cotton-dui',
    name: 'Cotton Đũi / Đũi xốp',
    shortName: 'Cotton Đũi',
    description: 'Thoáng mát mộc mạc, sợi đũi xốp mềm thấm hút mồ hôi tối đa',
    icon: '🌿',
    keywords: ['đũi', 'cotton đũi', 'dui', 'bông xốp', 'puff pastry', 'wash mềm'],
  },
  {
    id: 'cotton',
    name: 'Cotton 100% / Cotton Hàn',
    shortName: 'Cotton',
    description: 'Đứng form bền đẹp, bề mặt sợi cotton dệt dày dặn vibe Hàn',
    icon: '🧵',
    keywords: ['cotton', 'cotton hàn'],
  },
  {
    id: 'thun-lanh',
    name: 'Thun lạnh / Tencel Ice Silk',
    shortName: 'Thun lạnh',
    description: 'Mát lạnh chạm da, sợi dệt Ice Silk mềm rủ hạ nhiệt mùa hè',
    icon: '❄️',
    keywords: ['thun lạnh', 'thunlanh', 'tencel', 'ice silk', 'lụa lạnh', 'ceeling'],
  },
  {
    id: 'ni-nhung',
    name: 'Nỉ nhung / Nỉ sữa',
    shortName: 'Nỉ nhung / Nỉ sữa',
    description: 'Mềm mịn như nhung, giữ nhiệt nhanh siêu ấm cho mùa đông',
    icon: '🧶',
    keywords: ['nỉ nhung', 'nỉ sữa', 'ni nhung', 'ni sua', 'nhung kim sa', 'nỉ', 'ni_nhung'],
  },
  {
    id: 'long-cuu',
    name: 'Lông cừu / Lông thỏ / San hô',
    shortName: 'Lông cừu / Lông thỏ',
    description: 'Ấm tức thì ngay khi đắp, sợi lông mềm êm ái hai mặt',
    icon: '🐑',
    keywords: [
      'lông cừu',
      'long cuu',
      'lông thỏ',
      'long tho',
      'san hô',
      'san ho',
      'lông chuột',
      'freemond',
      'sherpa',
    ],
  },
  {
    id: 'phi-lua',
    name: 'Phi lụa cao cấp (Silk)',
    shortName: 'Phi lụa',
    description: 'Bóng nhẹ óng ả, viền ren thêu sang trọng chuẩn quý tộc',
    icon: '✨',
    keywords: ['phi lụa', 'phi lua', 'lụa', 'lua', 'romance'],
  },
  {
    id: 'chan-bong',
    name: 'Thun chần bông / Chần bông',
    shortName: 'Chần bông',
    description: 'Lõi bông micro êm nhẹ, chần vi tính định hình giặt máy thoải mái',
    icon: '☁️',
    keywords: ['bingbong', 'chần bông', 'chan bong', 'chần viền'],
  },
  {
    id: 'long-tuyet',
    name: 'Chăn tuyết / Nhung tuyết xuất Hàn',
    shortName: 'Chăn tuyết',
    description: 'Dập gân nổi cao cấp, bản King size 4kg đại hàn',
    icon: '🏔️',
    keywords: ['chăn tuyết', 'tuyết xuất hàn', 'nhung dập ô', 'nhung 4', '4 cân', '4kg', 'korea home'],
  },
];

/**
 * Intelligently infer product material from description tag <!--material:...-->,
 * or based on product name, description, and ID.
 */
export function inferProductMaterial(
  name?: string,
  desc?: string,
  id?: string
): string {
  // 1. Check embedded tag <!--material:xyz--> in description
  if (desc && typeof desc === 'string') {
    const match = desc.match(/<!--material:(.*?)-->/);
    if (match && match[1]) {
      const tagMat = match[1].trim();
      if (MATERIALS.some((m) => m.id === tagMat)) {
        return tagMat;
      }
    }
  }

  const text = `${id || ''} ${name || ''} ${desc || ''}`.toLowerCase();

  // 2. Specific matching order
  // Thun lạnh
  if (
    text.includes('thun lạnh') ||
    text.includes('thunlanh') ||
    text.includes('ice silk') ||
    text.includes('ceeling')
  ) {
    return 'thun-lanh';
  }

  // Phi lụa
  if (text.includes('phi lụa') || text.includes('phi lua') || text.includes('romance quilting')) {
    return 'phi-lua';
  }

  // Chăn tuyết / Nhung tuyết
  if (
    text.includes('chăn tuyết') ||
    text.includes('tuyết xuất hàn') ||
    text.includes('nhung dập ô') ||
    text.includes('4 cân') ||
    text.includes('4kg') ||
    text.includes('korea home')
  ) {
    return 'long-tuyet';
  }

  // Lông cừu / Lông thỏ / San hô
  if (
    text.includes('lông cừu') ||
    text.includes('long cuu') ||
    text.includes('lông thỏ') ||
    text.includes('long tho') ||
    text.includes('san hô') ||
    text.includes('san ho') ||
    text.includes('lông chuột') ||
    text.includes('freemond') ||
    text.includes('sherpa')
  ) {
    return 'long-cuu';
  }

  // Nỉ nhung / Nỉ sữa / Nỉ ấm
  if (
    text.includes('nỉ nhung') ||
    text.includes('nỉ sữa') ||
    text.includes('ni nhung') ||
    text.includes('ni sua') ||
    text.includes('nhung kim sa') ||
    text.includes('nỉ') ||
    text.includes('ni_nhung') ||
    text.includes('ni_299k')
  ) {
    return 'ni-nhung';
  }

  // Chần bông / Bingbong
  if (
    text.includes('bingbong') ||
    text.includes('chần bông') ||
    text.includes('chan bong') ||
    text.includes('mark de')
  ) {
    return 'chan-bong';
  }

  // Cotton Đũi / Đũi
  if (text.includes('đũi') || text.includes('dui') || text.includes('bông xốp') || text.includes('puff pastry')) {
    return 'cotton-dui';
  }

  // Cotton (không chứa đũi)
  if (text.includes('cotton')) {
    return 'cotton';
  }

  // Default fallback
  return 'cotton-dui';
}

export function getMaterialOption(id: string): MaterialOption {
  const found = MATERIALS.find((m) => m.id === id);
  return (
    found || {
      id,
      name: id,
      shortName: id,
      description: '',
      icon: '✨',
      keywords: [],
    }
  );
}
