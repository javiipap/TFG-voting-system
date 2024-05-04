'use client';

import React, { createContext } from 'react';
import { candidates } from '@/db/schema';

export interface Value {
  electionId?: number;
  masterPublicKey?: string;
  contractAddr?: string;
  candidates?: (typeof candidates.$inferSelect)[];
}

export const Context = createContext<Value>({});

export default function ContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: Value;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
