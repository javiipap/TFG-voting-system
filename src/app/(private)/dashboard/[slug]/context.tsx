'use client';

import React, { createContext } from 'react';
import { candidates, elections } from '@/db/schema';

export type Context = {
  candidates: (typeof candidates.$inferSelect)[];
} & typeof elections.$inferSelect;

export const Context = createContext<Context | null>(null);

export default function ContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: Context;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
