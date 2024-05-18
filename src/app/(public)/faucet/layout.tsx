'use client';

import { ReactNode, Suspense } from 'react';

export default function FaucetLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
