import RecoverForm from '@/app/(public)/vote/[slug]/(authorized)/recover/recover-form';
import { getElectionBySlug, getVote } from '@/data-access/elections';
import { getSessionSSR } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ({ params }: { params: { slug: string } }) {
  const session = await getSessionSSR();

  const election = await getElectionBySlug(params.slug);

  if (!election) {
    return redirect('/');
  }

  const vote = await getVote(session.userId, election.id);

  if (!vote?.recoveryEthPrivateKey) {
    return redirect(`/vote/${params.slug}/previous`);
  }

  return (
    <main className="flex justify-center">
      <div className="w-[95%] mx-auto md:max-w-[600px]">
        <p>
          Al pulsar en &quot;Descifrar&quot; se cargará el programa YoTeFirmo
          para utilizar sus certificados de sistema y descifrar su dirección.
        </p>
        <RecoverForm vote={vote} />
      </div>
    </main>
  );
}
