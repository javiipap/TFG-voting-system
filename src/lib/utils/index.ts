import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createSlug = (name: string) => {
  name = name.replace(/^\s+|\s+$/g, '').toLowerCase(); // trim

  // remove accents, swap ñ for n, etc
  const from = 'ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;';
  const to = 'aaaaaeeeeeiiiiooooouuuunc------';
  for (let i = 0, l = from.length; i < l; i++) {
    name = name.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return name
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const downloadFile = (content: string) => {
  const url = window.URL.createObjectURL(
    new Blob([content], { type: 'text/plain' })
  );
};
