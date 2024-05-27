'use client';

import React, { createContext } from 'react';
import { candidates } from '@/db/schema';
import { User } from 'next-auth';

export interface Context {
  electionId: number;
  masterPublicKey: string;
  contractAddr: string;
  candidates: (typeof candidates.$inferSelect)[];
  user?: User;
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
