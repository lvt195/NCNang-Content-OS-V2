import { PriceRange } from '../types/product';

export const SITE_CONFIG = {
  name: 'Nhà Có Mùi Nắng',
  tagline: 'Tiệm chăn ga gối đũi & linen tự nhiên cho giấc ngủ an lành',
  description:
    'Bộ sưu tập chăn ga, gối và phụ kiện phòng ngủ từ chất liệu đũi & linen tự nhiên mộc mạc, thoáng khí, êm dịu làn da.',
  baseUrl: 'https://ncnang.pages.dev',
  contact: {
    zalo: {
      url: 'https://zalo.me/0987654321', // Configurable placeholder URL
      displayPhone: '0987.654.321',
      actionText: 'Tư vấn qua Zalo',
      note: 'Nhắn Zalo kèm Mã SP để tư vấn chọn kích thước, xem ảnh cận vải & nhận ship nhanh.',
    },
    messenger: {
      url: 'https://m.me/nhacomuinang', // Configurable placeholder URL
      handle: 'nhacomuinang',
      actionText: 'Nhắn qua Messenger',
      note: 'Gửi tin nhắn Messenger để nhận báo giá chi tiết và tư vấn phối màu phòng ngủ.',
    },
    phone: '0987.654.321',
    address: 'Hà Nội, Việt Nam (Bán online & giao hàng toàn quốc)',
    openHours: '8:30 – 21:30 hàng ngày',
  },
  priceRanges: [
    { id: 'all', label: 'Tất cả mức giá' },
    { id: 'under-200k', label: 'Dưới 200.000₫', max: 200000 },
    { id: '200k-400k', label: '200.000₫ – 400.000₫', min: 200000, max: 400000 },
    { id: 'above-400k', label: 'Trên 400.000₫', min: 400000 },
  ] as PriceRange[],
  standardSizes: ['1m2 x 2m', '1m6 x 2m', '1m8 x 2m', '2m x 2m2', '45x65cm', '50x70cm'],
};
