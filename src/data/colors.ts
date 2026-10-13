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
    id: 'caro',
    label: 'Kẻ Caro',
    hex: 'repeating-linear-gradient(45deg, #e4dfd7, #e4dfd7 5px, #c8beaf 5px, #c8beaf 10px)',
    borderHex: '#b5a999',
  },
  {
    id: 'vang-nhat',
    label: 'Vàng Bơ',
    hex: '#ead9a8',
    borderHex: '#d5be86',
  },
];

export function getColorOption(colorId: string): ColorOption {
  const found = DEFAULT_COLORS.find((c) => c.id === colorId);
  if (found) return found;
  return {
    id: colorId,
    label: colorId,
    hex: '#d6cfc7',
  };
}
