'use client';

import MakeItPrivate from '@/app/(private)/dashboard/[slug]/_components/make-it-private';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';

export async function PublicOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isPrivate } = useContext(Context) as Context;

  return (
    <main>
      {isPrivate ? (
        <>{children}</>
      ) : (
        <div className="w-full h-[calc(100vh-124px)] flex flex-col gap-4 justify-center items-center">
          <span className="text-3xl font-bold">Election is public</span>
          <MakeItPrivate />
        </div>
      )}
    </main>
  );
}
