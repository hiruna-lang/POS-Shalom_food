import { Order } from '../types/pos';

export const formatLkr = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-LK', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;

export const isPaidSale = (order: Order) =>
  order.paymentStatus === 'paid' && order.orderStatus !== 'cancelled';

export function calculateBill(
  lines: { price: number; quantity: number }[],
  discount: number,
  discountType: 'percentage' | 'fixed',
  taxRate: number,
  serviceRate: number,
) {
  const subtotal = lines.reduce((sum, line) => sum + Math.round(line.price * 100) * line.quantity, 0);
  const reduction = discountType === 'percentage'
    ? Math.round(subtotal * Math.min(100, discount) / 100)
    : Math.round(discount * 100);
  const discountAmount = Math.max(0, Math.min(reduction, subtotal));
  const base = subtotal - discountAmount;
  const tax = Math.round(base * taxRate / 100);
  const service = Math.round(base * serviceRate / 100);
  return { subtotal: subtotal / 100, discountAmount: discountAmount / 100, taxAmount: tax / 100,
    serviceChargeAmount: service / 100, grandTotal: (base + tax + service) / 100 };
}
