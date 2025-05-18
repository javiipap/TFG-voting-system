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

export const retry = async <T>(
  callback: () => Promise<T>,
  maxAttempts: number = -1
) => {
  for (let i = 0; i < maxAttempts || maxAttempts === -1; i++) {
    try {
      return await callback();
    } catch (e) {
      if (i === maxAttempts - 1) {
        throw e;
      }

      sleep(i * 1000 + Math.random() * 100);
    }
  }

  throw new Error('Retry function exited unexpectedly');
};

export const sleep = async (ms: number) =>
  new Promise((r) => setTimeout(r, ms));

export const getRandomElement = (array: Array<any>) =>
  array[Math.floor(Math.random() * array.length)];
