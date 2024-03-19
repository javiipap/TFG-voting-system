import { getBallots } from '@/db/helpers';
import Title from './components/Title';
import ElectionCard from './components/Election';

export default async function DashboardPage() {
  const ballots = await getBallots();

  return (
    <main className="p-6">
      <Title>Dashboard</Title>
      <div className="flex gap-4">
        {ballots.map((ballot) => (
          <ElectionCard key={ballot.id} {...ballot} />
        ))}
      </div>
    </main>
  );
}
