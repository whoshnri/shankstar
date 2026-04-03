import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string) {
  return `₦${Number(price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function generateSKU(productName: string, brandName: string, categoryName: string, variantName?: string) {
  const clean = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  const b = clean(brandName);
  const c = clean(categoryName);
  const p = clean(productName);
  const v = variantName ? clean(variantName) : 'BASE';
  const random = Math.floor(1000 + Math.random() * 9000);
  
  return `${b}${c}-${p}-${v}-${random}`;
}
