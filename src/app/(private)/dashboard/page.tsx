import { getBallots } from '@/db/helpers';
import Title from './components/Title';
import ElectionCard from './components/Election';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';

export default async function DashboardPage() {
  const session = await auth();

  const ballots = await getBallots(session!.user.adminId!);

  return (
    <main className="p-6">
      <Title
        component={
          <SheetTrigger asChild>
            <Button>Add election</Button>
          </SheetTrigger>
        }
      >
        Dashboard
      </Title>
      <div className="flex gap-4">
        {ballots.map((ballot) => (
          <ElectionCard key={ballot.id} {...ballot} />
        ))}
      </div>
    </main>
  );
}
