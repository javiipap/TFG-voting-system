import Aside from './_layout/Aside';
import Header from './_layout/Header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="grid grid-cols-[280px_1fr] h-screen min-h-screen">
        <Aside />
        <div className="">
          <Header />
          <main className="">{children}</main>
        </div>
      </div>
    </>
  );
}
