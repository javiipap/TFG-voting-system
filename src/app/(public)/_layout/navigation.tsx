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
          isOpen ? 'left-0' : 'left-[-120vw]'
        } z-40 transition-all fixed h-[100vh] w-full bg-background top-[80px] pl-12 pt-8 text-xl space-y-8 block md:flex md:h-auto md:left-0 md:relative md:top-0 md:text-base md:pt-0 md:space-y-0 md:ml-0 md:flex-row md:space-x-4`}
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
