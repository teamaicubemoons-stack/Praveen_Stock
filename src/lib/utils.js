import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function generateSKU(productName, size, color, index) {
  const prefix  = 'PTC';
  const namePart = productName.replace(/\s+/g, '-').toUpperCase().slice(0, 5);
  const sizePart = size.toUpperCase().slice(0, 3);
  const colorPart = color.toUpperCase().slice(0, 3);
  const num = String(index).padStart(3, '0');
  return `${prefix}-${namePart}-${sizePart}-${colorPart}-${num}`;
}

export const STATUS_COLORS = {
  // Order/Inward Status
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border border-blue-200',
  packed:     'bg-violet-50 text-violet-700 border border-violet-200',
  dispatched: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  partial:    'bg-orange-50 text-orange-700 border border-orange-200',
  rejected:   'bg-red-50 text-red-700 border border-red-200',
  verified:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  active:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  low_stock:  'bg-red-50 text-red-700 border border-red-200',
  processed:  'bg-teal-50 text-teal-700 border border-teal-200',
  done:       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  paid:       'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

