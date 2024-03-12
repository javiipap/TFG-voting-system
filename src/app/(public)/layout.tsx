import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import React from 'react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <header className="fixed w-full top-0 left-0 h-[80px] border-b ">
        <div className="h-full w-full flex items-center justify-between px-12">
          <Link href="/" className="font-bold text-xl">
            Logo
          </Link>
          <div className="flex gap-4 items-center">
            <nav className="">
              <ul className="flex space-x-4">
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/login">Login</a>
                </li>
                <li>
                  <a href="/register">Register</a>
                </li>
              </ul>
            </nav>
            <Avatar>
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
