import Aside from '../../_layout/Aside';
import Header from '../../_layout/Header';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import SheetForm from '../../_layout/components/SheetForm';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Sheet>
      <div className="grid lg:grid-cols-[280px_1fr] h-screen min-h-screen">
        <Aside />
        <div className="overflow-hidden">
          <Header />
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
