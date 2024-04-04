import { Separator } from '@/components/ui/separator';
import { getPublicElections } from '@/db/helpers';
import Link from 'next/link';

export default async function Home() {
  const elections = await getPublicElections();

  return (
    <main className="">
      <div className="min-h-screen flex justify-center items-center">
        <div className="">
          <h1 className="font-bold text-7xl">E3VOTE</h1>
          <div className="flex justify-between text-lg">
            <span>Easy</span>
            <span>Encrypted</span>
            <span>Secure</span>
          </div>
        </div>
      </div>
      <Separator />
      <h2 className="text-center text-4xl font-bold my-5">Public elections</h2>
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
    </main>
  );
}
