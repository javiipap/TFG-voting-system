import { getElectionBySlug } from '@/data-access/election';
import { isAuthorizedToVote } from '@/data-access/user';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function AuthorizedLayout({
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

  if (election.isPrivate) {
    const session = await auth();
    const canVote = await isAuthorizedToVote(
      session?.user.userId!,
      election.id
    );

    if (!canVote) {
      redirect('/');
    }
  }

  return <>{children}</>;
}
