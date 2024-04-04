import { getPublicElections } from '@/db/helpers';

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
      <div className="">
        {elections.map((election) => (
          <div>{JSON.stringify(election)}</div>
        ))}
      </div>
    </main>
  );
}
