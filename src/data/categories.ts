import { Category } from '../types/product';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'bo-chan-ga',
    name: 'Bộ chăn ga',
    description: 'Bộ trọn gói gồm vỏ chăn, ga chun/phủ và 2 vỏ gối đồng bộ',
    displayOrder: 1,
  },
  {
    id: 'ga-giuong',
    name: 'Ga giường',
    description: 'Ga bọc chun hoặc ga phủ chất liệu đũi/linen thoáng mát',
    displayOrder: 2,
  },
  {
    id: 'vo-goi',
    name: 'Vỏ gối',
    description: 'Cặp vỏ gối nằm đũi mềm mại, mộc mạc và thấm hút tốt',
    displayOrder: 3,
  },
  {
    id: 'chan-he',
    name: 'Chăn hè',
    description: 'Chăn hè chần bông mỏng nhẹ êm, đắp mát quanh năm',
    displayOrder: 4,
  },
  {
    id: 'combo',
    name: 'Combo tiết kiệm',
    description: 'Các gói kết hợp phụ kiện phòng ngủ ưu đãi cho phòng nhỏ',
    displayOrder: 5,
  },
];
