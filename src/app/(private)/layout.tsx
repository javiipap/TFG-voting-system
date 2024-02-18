import Aside from './_layout/Aside';
import Header from './_layout/Header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="grid lg:grid-cols-[280px_1fr] h-screen min-h-screen">
        <Aside />
        <div className="overflow-hidden">
          <Header />
          <div className="flex h-[calc(100vh_-_3.5rem)] lg:h-[calc(100vh_-_60px)] w-full dark:bg-black">
            <main className="overflow-auto w-full">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
