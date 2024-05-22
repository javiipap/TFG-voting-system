import { Separator } from '@/components/ui/separator';
import {
  getPrivateElections,
  getPublicElections,
} from '@/data-access/elections';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const elections = await getPublicElections();
  const session = await auth();
  let privateElections = await getPrivateElections(session?.user.userId);

  return (
    <main className="">
      <div className="mt-[60px] h-[40vh] flex justify-center items-center">
        <div className="">
          <h1 className="font-bold text-7xl">E3VOTE</h1>
          <div className="flex justify-between text-lg">
            <span>Easy</span>
            <span>Electronic</span>
            <span>Encrypted</span>
          </div>
        </div>
      </div>
      <Separator />
      <h2 className="text-center text-4xl font-bold my-5">
        Elecciones públicas
      </h2>
      {elections.length ? (
        <div className="max-w-5xl mx-auto flex flex-col gap-4 mb-4">
          {elections.map((election) => (
            <div
              key={`pub_election-${election.slug}`}
              className="p-4 border rounded-md"
            >
              <Link href={`/vote/${election.slug}`} className="font-bold">
                {election.name}
              </Link>
              <Separator className="my-2" />
              <p>{election.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">No hay elecciones públicas todavía...</div>
      )}

      {privateElections.length > 0 && (
        <>
          <Separator className="mt-8" />
          <h2 className="text-center text-4xl font-bold my-5">
            Elecciones privadas
          </h2>
          <div className="max-w-5xl mx-auto flex flex-col gap-4 mb-4">
            {privateElections.map((election) => (
              <div
                key={`pub_election-${election.slug}`}
                className="p-4 border rounded-md"
              >
                <Link href={`/vote/${election.slug}`} className="font-bold">
                  {election.name}
                </Link>
                <Separator className="my-2" />
                <p>{election.description}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
