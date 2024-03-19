'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/statusBadge';
import Link from 'next/link';
import * as schema from '@/db/schema';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

export default function ElectionCard({
  id,
  slug,
  name,
  startDate,
  endDate,
  description,
}: typeof schema.ballots.$inferSelect) {
  const hydrated = useHydration();

  const status =
    startDate > new Date()
      ? 'upcoming'
      : endDate < new Date()
      ? 'closed'
      : 'open';

  return (
    <Suspense key={hydrated ? 'local' : 'utc'}>
      <Card key={id} className="hover:shadow-md transition">
        <CardHeader>
          <Link href={`/dashboard/${slug}`}>
            <CardTitle>{name}</CardTitle>
          </Link>
          <div className="">
            <StatusBadge variant={status} />
          </div>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
          <Separator className="my-2" />
          <CardDescription className="flex flex-col">
            <span>Start date: {startDate.toLocaleString().slice(0, -3)}</span>
            <span>End date: {endDate.toLocaleString().slice(0, -3)}</span>
          </CardDescription>
        </CardContent>
      </Card>
    </Suspense>
  );
}
