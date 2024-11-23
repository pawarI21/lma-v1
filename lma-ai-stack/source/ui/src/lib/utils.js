import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TIME_UNITS = [
  { label: 'd', ms: 86400000 },
  { label: 'h', ms: 3600000 },
  { label: 'm', ms: 60000 },
  { label: 's', ms: 1000 },
];
export function msToHumanReadableTime(ms) {
  let remainingMs = ms;

  const parts = TIME_UNITS.map((unit) => {
    const value = Math.floor(remainingMs / unit.ms);
    remainingMs %= unit.ms;
    return value > 0 ? `${value}${unit.label}` : null;
  }).filter(Boolean);

  return parts.length ? parts.join(' ') : '0s';
}
