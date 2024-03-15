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
import { getBallot } from '@/db/helpers';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { slug: string };
}>) {
  const ballot = await getBallot(params.slug);

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
        <SheetHeader>
          <SheetTitle>Create a new election</SheetTitle>
        </SheetHeader>
        <SheetForm />
      </SheetContent>
    </Sheet>
  );
}
