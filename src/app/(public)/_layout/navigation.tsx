'use client';

import { signOutAction } from '@/app/(public)/_layout/actions';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation({ user }: { user: any | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="">
      <ul
        className={`${
          isOpen ? 'left-0' : 'left-[-100vw]'
        } transition-all fixed h-full w-full bg-background top-[80px] ml-12 mt-8 text-xl space-y-8 flex flex-col md:left-0 md:relative md:top-0 md:text-base md:mt-0 md:space-y-0 md:ml-0 md:flex-row md:space-x-4`}
      >
        <li>
          <a href="/">Home</a>
        </li>
        {user ? (
          <>
            <li>
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            </li>
            <li
              className="cursor-pointer"
              onClick={() => {
                signOutAction({});
                setIsOpen(false);
              }}
            >
              Sign out
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
      <Menu
        className="md:hidden cursor-pointer"
        onClick={() => setIsOpen((v) => !v)}
      />
    </nav>
  );
}
