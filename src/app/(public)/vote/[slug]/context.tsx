'use client';

import React, { createContext } from 'react';
import { candidates } from '@/db/schema';
import { User } from 'next-auth';

export interface Voter {
  userId: number;
  name: string;
  signature: string;
  pk: string;
  cert: string;
}

export interface Context {
  electionId: number;
  masterPublicKey: string;
  contractAddr: string;
  candidates: (typeof candidates.$inferSelect)[];
  user?: User;
  voters: Voter[];
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
