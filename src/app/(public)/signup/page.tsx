import { Separator } from '@/components/ui/separator';
import SignUpForm from '@/app/(public)/signup/_components/sign-up-form';

export default function LoginPage({}) {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-8 md:-mt-32 bg-foreground/5 rounded-sm">
        <h1 className="text-5xl font-bold text-center">Sign up</h1>
        <Separator />
        <SignUpForm />
      </div>
    </main>
  );
}
