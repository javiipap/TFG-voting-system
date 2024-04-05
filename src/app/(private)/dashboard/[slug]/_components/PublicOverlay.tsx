import { getElection } from '@/db/helpers';
import * as schema from '@/db/schema';
import MakeItPrivate from './MakeItPrivate';

export async function PublicOverlay({
  slug,
  children,
  preFetchedElection,
}: {
  slug: string;
  children: React.ReactNode;
  preFetchedElection?: typeof schema.elections.$inferSelect;
}) {
  const election = preFetchedElection ?? (await getElection(slug));

  return (
    <main>
      {election?.isPrivate ? (
        <>{children}</>
      ) : (
        <div className="w-full h-[calc(100vh-124px)] flex flex-col gap-4 justify-center items-center">
          <span className="text-3xl font-bold">Election is public</span>
          <MakeItPrivate slug={slug} />
        </div>
      )}
    </main>
  );
}
