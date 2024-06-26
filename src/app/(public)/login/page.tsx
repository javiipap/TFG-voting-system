'use client';

import { Separator } from '@/components/ui/separator';
import LoginForm from '@/app/(public)/login/_components/login-form';
import { Suspense } from 'react';

export default function LoginPage({}) {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 py-6 px-4 mt-[200px] md:-mt-32 bg-foreground/5 rounded-sm">
        <h1 className="text-5xl font-bold text-center">Log in</h1>
        <Separator />
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
