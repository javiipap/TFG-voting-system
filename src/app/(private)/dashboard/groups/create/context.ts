'use client';

import { createContext } from 'react';

export type Context = {
  members: { email: string }[];
  deleteMember: (email: string) => void;
  addMember: (email: string) => void;
};

export const Context = createContext<Context | null>(null);
