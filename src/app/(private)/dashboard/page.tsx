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
import { StatusBadge, StatusBadgeProps } from '@/components/ui/statusBadge';

export default async function DashboardPage() {
  const rawBallots = await getBallots();

  const currentDate = new Date();
  const ballots = rawBallots.map((ballot) => ({
    ...ballot,
    startDate: ballot.startDate.toLocaleString('es-ES').slice(0, -3),
    endDate: ballot.endDate.toLocaleString('es-ES').slice(0, -3),
    status:
      ballot.startDate > currentDate
        ? 'upcoming'
        : ballot.endDate < currentDate
        ? 'closed'
        : ('open' as StatusBadgeProps['variant']),
  }));

  return (
    <main className="p-6">
      <Title>Dashboard</Title>
      <div className="flex gap-4">
        {ballots.map((ballot) => (
          <Card key={ballot.id} className="hover:shadow-md transition">
            <CardHeader>
              <Link href={`/dashboard/${ballot.slug}`}>
                <CardTitle>{ballot.name}</CardTitle>
              </Link>
              <div className="">
                <StatusBadge variant={ballot.status} />
              </div>
            </CardHeader>
            <CardContent>
              <p>{ballot.description}</p>
              <Separator className="my-2" />
              <CardDescription>
                <p suppressHydrationWarning={true}>
                  Start date: {ballot.startDate}
                </p>
                <p suppressHydrationWarning={true}>
                  End date: {ballot.endDate}
                </p>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
