import Aside from './_layout/aside';
import { getElection } from '@/db/helpers';
import { getCandidates } from '@/data-access/candidates';
import ContextProvider from './context';

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

  const candidates = await getCandidates(election.id);

  return (
    <div className="grid lg:grid-cols-[280px_1fr]">
      <ContextProvider value={{ ...election, candidates }}>
        <Aside />
        <div className="overflow-hidden">
          <div className="flex h-[calc(100vh_-_3.5rem)] lg:h-[calc(100vh_-_60px)] w-full dark:bg-black">
            <div className="overflow-auto w-full">
              <div className="px-6 py-8">{children}</div>
            </div>
          </div>
        </div>
      </ContextProvider>
    </div>
  );
}
