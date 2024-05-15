import ContextProvider from './context';
import { auth } from '@/lib/auth';
import { isAuthorizedToVote } from '@/data-access/users';
import { ReactNode } from 'react';
import { getCandidates, getElectionBySlug } from '@/data-access/elections';

export default async function VoteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  const election = await getElectionBySlug(params.slug);

  if (!election) {
    return <div>Election not found</div>;
  }

  let canVote = !election.isPrivate;

  if (election.isPrivate) {
    const session = await auth();
    canVote = await isAuthorizedToVote(session?.user.userId!, election.id);
  }

  const candidates = await getCandidates(election.id);

  return (
    <div className="min-h-screen h-full min-w-screen flex flex-col justify-center space-y-8">
      <div className="flex justify-center items-center">
        <div className="max-w-[600px] text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            {election.name}
          </h1>
          <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            {election.description}
          </p>
        </div>
      </div>
      <ContextProvider
        value={{
          electionId: election.id,
          candidates,
          contractAddr: election.contractAddr!,
          masterPublicKey: election.masterPublicKey!,
        }}
      >
        {canVote && <>{children}</>}
      </ContextProvider>
    </div>
  );
}
