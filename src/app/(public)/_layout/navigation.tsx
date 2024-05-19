'use client';

import { signOutAction } from '@/app/(public)/_layout/actions';
import Link from 'next/link';

export default function Navigation({ user }: { user: any | null }) {
  return (
    <nav className="">
      <ul className="flex space-x-4">
        <li>
          <a href="/">Home</a>
        </li>
        {user ? (
          <>
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li className="cursor-pointer" onClick={() => signOutAction({})}>
              Sign out
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
