import { redirect } from 'next/navigation';
import Header from './_layout/Header';
import { auth } from '@/auth';

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
    <>
      <Header />
      {children}
    </>
  );
}
