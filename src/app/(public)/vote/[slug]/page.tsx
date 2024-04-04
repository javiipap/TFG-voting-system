import { auth } from '@/auth';
import { getElection, getCandidates } from '@/db/helpers';
import SelectCandidate from './components/SelectCandidate';

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
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel iure eius
          inventore saepe quaerat unde asperiores, distinctio, perspiciatis quae
          error nihil quasi, enim laboriosam? Autem alias iste magnam
          consequatur ullam.
        </p>
        <SelectCandidate candidates={candidates} session={session} />
      </div>
    </main>
  );
}
