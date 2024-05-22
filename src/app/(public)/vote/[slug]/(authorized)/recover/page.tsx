import RecoverForm from '@/app/(public)/vote/[slug]/(authorized)/recover/recover-form';
import { getElectionBySlug, getVote } from '@/data-access/elections';
import { getSessionSSR } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ({ params }: { params: { slug: string } }) {
  const session = await getSessionSSR();

  const election = await getElectionBySlug(params.slug);

  if (!election) {
    redirect('/');
  }

  const vote = await getVote(session.userId, election.id);

  if (!vote?.recoveryEthSecret) {
    redirect(`/vote/${params.slug}/previous`);
  }

  return (
    <main className="flex justify-center">
      <div className="w-[95%] mx-auto md:max-w-[600px]">
        <p>
          A continuación se muestra su clave privada eth cifrada usando su
          certificado digital. Adjunte su clave privada para desencriptar.
        </p>
        <RecoverForm vote={vote} />
      </div>
    </main>
  );
}
