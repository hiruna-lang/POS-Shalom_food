import type { MenuItem } from '../types/pos';

export const standardSizes = ['Small', 'Medium', 'Large'] as const;

export function getPortions(item: Pick<MenuItem, 'price' | 'portions'>) {
  const configured = item.portions ?? [];
  const standardKeys = standardSizes.map((size) => size.toLowerCase());
  const defaults = standardSizes.map((name) => {
    const match = configured.find((option) => option.name.trim().toLowerCase() === name.toLowerCase());
    return { name, price: match?.price ?? item.price };
  });
  return [...defaults, ...configured.filter((option) => !standardKeys.includes(option.name.trim().toLowerCase()))];
}
