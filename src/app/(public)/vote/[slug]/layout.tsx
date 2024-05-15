import { getCandidates, getElection } from '@/db/helpers';
import ContextProvider from './context';

export default async function VoteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const election = await getElection(params.slug);

  if (!election) {
    return <div>Election not found</div>;
  }

  // TODO: Validar usuario

  const candidates = (await getCandidates(params.slug)).map(
    ({ candidates }) => candidates
  );

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
        {children}
      </ContextProvider>
    </div>
  );
}
