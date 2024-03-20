import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { promoteAdmin } from './_actions';

export default async function Profile() {
  const session = await auth();

  if (!session) {
    return redirect('/login');
  }

  return (
    <main className="mt-[80px]">
      <div className="p-4">
        <h1 className="text-5xl font-bold">Profile</h1>
        <p className="mt-4">Welcome {session.user.name}</p>
        <p className="mt-4">Email: {session.user.email}</p>
        {session.user.role === 'user' && (
          <form action={promoteAdmin} className="mt-8">
            <Button type="submit">Promote admin</Button>
          </form>
        )}
      </div>
    </main>
  );
}
