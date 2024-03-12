import Header from './_layout/Header';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: any;
}>) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
