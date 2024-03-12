import * as schema from '@/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
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

export default async function DashboardPage() {
  const client = postgres('postgres://pi:password@192.168.1.10:5432/tfg');
  const db = drizzle(client, { schema });

  const ballots = await db.query.ballots.findMany();

  return (
    <main className="p-6">
      <h1>Dashboard</h1>
      <p>Elige la votación</p>
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
              <p>Start date: {ballot.startDate.toLocaleString()}</p>
              <p>End date: {ballot.endDate.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
