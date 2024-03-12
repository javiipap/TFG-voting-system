import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getBallots } from '@/db/helpers';
import Title from './components/Title';

export default async function DashboardPage() {
  const ballots = await getBallots();

  return (
    <main className="p-6">
      <Title>Dashboard</Title>
      <div className="flex gap-4">
        {ballots.map((ballot) => (
          <Card key={ballot.id} className="">
            <CardHeader>
              <Link href={`/dashboard/${ballot.slug}`}>
                <CardTitle>{ballot.name}</CardTitle>
              </Link>
            </CardHeader>
            <CardContent>
              <p>{ballot.description}</p>
              <Separator className="my-2" />
              <CardDescription>
                <p>
                  Start date:{' '}
                  {ballot.startDate.toLocaleString('es-ES').slice(0, -3)}
                </p>
                <p>
                  End date:{' '}
                  {ballot.endDate.toLocaleString('es-ES').slice(0, -3)}
                </p>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
