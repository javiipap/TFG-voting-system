'use client';

import { Separator } from '@/components/ui/separator';
import SignUpForm from '@/app/(public)/register/_components/sign-up-form';
import { Suspense } from 'react';

export default function LoginPage({}) {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-8 mt-[200px] md:-mt-32 bg-foreground/5 rounded-sm">
        <h1 className="text-5xl font-bold text-center">Sign up</h1>
        <Separator />
        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
    </main>
  );
}
