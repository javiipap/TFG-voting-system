import Navigation from '@/app/(public)/_layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import React from 'react';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="">
      <header className="fixed w-full top-0 left-0 h-[80px] border-b bg-background/80 backdrop-blur-sm backdrop-saturate-150">
        <div className="h-full w-full flex items-center justify-between px-12">
          <Link href="/" className="font-bold text-xl">
            E3vote
          </Link>
          <div className="flex gap-4 items-center">
            <Navigation user={session?.user} />
            {!!session?.user && (
              <Avatar>
                <AvatarFallback>
                  {session.user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
