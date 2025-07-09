import ContextProvider, { Voter } from './context';
import { auth } from '@/lib/auth';
import { isAuthorizedToVote } from '@/data-access/users';
import { ReactNode } from 'react';
import {
  getCandidates,
  getElectionBySlug,
  getVoters,
} from '@/data-access/elections';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import VerifySignature from '@/app/(public)/vote/[slug]/_components/verify-signature';
import { encodeMetadata } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib';

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

  const voters = await Promise.all(
    ((await getVoters(election.slug)) as unknown as Voter[]).map(
      async (voter) => ({
        ...voter,
        metadata: (
          await encodeMetadata([voter.name, election.id.toString()])
        ).toJSON().data,
      })
    )
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
          user: session?.user,
          voters,
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
              <div className="min-w-[40%] max-w-[80%] m-auto bg-neutral-100 dark:bg-neutral-900 rounded-sm py-4 px-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>id</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voters.map(
                      ({ userId, name, signature, metadata, pk, cert }) => (
                        <TableRow key={`voter-${userId}`}>
                          <TableCell>{name}</TableCell>
                          <TableCell>{userId}</TableCell>
                          <TableCell>{election.id}</TableCell>
                          <TableCell>
                            <VerifySignature
                              signature={signature}
                              data={metadata}
                              pk={pk}
                              cert={cert}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
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
