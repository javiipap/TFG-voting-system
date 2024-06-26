import ContextProvider from './context';
import { auth } from '@/lib/auth';
import { isAuthorizedToVote } from '@/data-access/users';
import { ReactNode } from 'react';
import { getCandidates, getElectionBySlug } from '@/data-access/elections';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  const session = await auth();

  if (election.isPrivate) {
    canVote = await isAuthorizedToVote(session?.user.userId!, election.id);
  }

  if (!canVote) {
    return redirect('/');
  }

  const isOpen =
    election.startDate < new Date() && election.endDate > new Date();

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
          user: session?.user,
        }}
      >
        {isOpen && <>{children}</>}

        {!isOpen && typeof candidates[0].votes === 'number' && (
          <Table className="mx-auto border max-w-4xl">
            <TableHeader className="border-b">
              <TableHead>Candidato</TableHead>
              <TableHead>Votos</TableHead>
            </TableHeader>
            <TableBody>
              {candidates
                .sort((lhs, rhs) => rhs.votes! - lhs.votes!)
                .map(({ name, votes, id }) => (
                  <TableRow className="space-x-2" key={`candidate_${id}`}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{votes}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}

        {election.endDate < new Date() &&
          typeof candidates[0].votes !== 'number' && (
            <>
              <p className="text-center">Pendiente de recuento...</p>
            </>
          )}

        {election.startDate > new Date() && (
          <>
            <p className="text-center">Todavía no ha empezado...</p>
          </>
        )}
      </ContextProvider>
    </div>
  );
}
