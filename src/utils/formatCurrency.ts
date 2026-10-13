/**
 * Format a number into Vietnamese Dong currency string (e.g. 380000 -> "380.000 ₫")
 */
export function formatVND(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '0 ₫';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 ₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format standard number with dots (e.g. 380000 -> "380.000")
 */
export function formatNumber(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(num);
}
