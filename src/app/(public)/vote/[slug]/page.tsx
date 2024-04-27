import { auth } from '@/auth';
import { getElection, getCandidates } from '@/db/helpers';
import CreateAccount from './_components/CreateAccount';

export default async function VotePage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await auth();
  const election = await getElection(params.slug);

  const candidates = await getCandidates(params.slug);

  if (!election) {
    return <div>Election not found</div>;
  }

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div className="max-w-[600px] text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          {election.name}
        </h1>
        <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          {election.description}
        </p>
        <CreateAccount />
      </div>
    </main>
  );
}
