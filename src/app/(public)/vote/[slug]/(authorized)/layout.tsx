import { getElectionBySlug } from '@/data-access/elections';
import { isAuthorizedToVote } from '@/data-access/users';
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

  const isOpen =
    election.startDate < new Date() && election.endDate > new Date();

  if (!isOpen) {
    redirect('/');
  }

  return <>{children}</>;
}
