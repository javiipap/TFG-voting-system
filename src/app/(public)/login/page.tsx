import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signIn } from '@/auth';
import LoginForm from './copmonents/login';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32 bg-foreground/20 rounded-sm">
        <h1 className="text-5xl font-bold text-center">Log in</h1>
        <Separator />
        <LoginForm />
      </div>
    </main>
  );
}
