'use client';

import React, { createContext } from 'react';
import { candidates } from '@/db/schema';

export interface Context {
  electionId: number;
  masterPublicKey: string;
  contractAddr: string;
  candidates: (typeof candidates.$inferSelect)[];
}

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
