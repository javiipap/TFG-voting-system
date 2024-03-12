import Aside from './_layout/Aside';
import SheetForm from './_layout/components/SheetForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import * as schema from '@/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { slug: string };
}>) {
  const client = postgres('postgres://pi:password@192.168.1.10:5432/tfg');
  const db = drizzle(client, { schema });

  const ballot = await db.query.ballots.findFirst({
    where: eq(schema.ballots.slug, params.slug),
  });

  if (!ballot) {
    return <div>Not found</div>;
  }

  return (
    <Sheet>
      <div className="grid lg:grid-cols-[280px_1fr]">
        <Aside />
        <div className="overflow-hidden">
          <div className="flex h-[calc(100vh_-_3.5rem)] lg:h-[calc(100vh_-_60px)] w-full dark:bg-black">
            <main className="overflow-auto w-full">
              <div className="px-6 py-8">{children}</div>
            </main>
          </div>
        </div>
      </div>
      <SheetContent>
        <div className="w-full">
          <SheetHeader>
            <SheetTitle>Create a new election</SheetTitle>
          </SheetHeader>
          <div className="">
            <SheetForm />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Create</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
