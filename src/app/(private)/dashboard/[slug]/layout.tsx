import Aside from './_layout/Aside';
import { getElection } from '@/db/helpers';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { slug: string };
}>) {
  const election = await getElection(params.slug);

  if (!election) {
    return <div>Not found</div>;
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr]">
      <Aside />
      <div className="overflow-hidden">
        <div className="flex h-[calc(100vh_-_3.5rem)] lg:h-[calc(100vh_-_60px)] w-full dark:bg-black">
          <div className="overflow-auto w-full">
            <div className="px-6 py-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
