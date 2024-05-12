import { getElections } from '@/db/helpers';
import Title from './components/Title';
import ElectionCard from './components/Election';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SheetTrigger } from '@/components/ui/sheet';

export default async function DashboardPage() {
  const session = await auth();

  const elections = await getElections(session!.user.adminId!);

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
      {elections.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {elections.map((election) => (
            <ElectionCard key={election.id} {...election} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="">
            <h2 className="text-2xl font-bold">
              You still haven&apos;t created any election...
            </h2>
          </div>
        </div>
      )}
    </main>
  );
}
