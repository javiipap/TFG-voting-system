import { redirect } from 'next/navigation';
import Header from './_layout/Header';
import { auth } from '@/auth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import SheetForm from './_layout/components/SheetForm';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: any;
}>) {
  const session = await auth();
  if (!session) {
    return redirect('/login');
  }

  if (session.user.role !== 'admin') {
    return redirect('/profile');
  }

  return (
    <Sheet>
      <Header />
      {children}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create a new election</SheetTitle>
        </SheetHeader>
        <SheetForm />
      </SheetContent>
    </Sheet>
  );
}
