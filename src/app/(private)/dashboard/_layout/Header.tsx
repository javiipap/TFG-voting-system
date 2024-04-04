import { auth } from '@/auth';
import HeaderNav from './components/HeaderNav';
import Title from './components/Title';
import { getElections } from '@/db/helpers';

export default async function Header() {
  const session = await auth();
  const elections = await getElections(session!.user.adminId!);

  return (
    <header className="h-14 lg:h-[60px] border-b bg-neutral-100 dark:bg-black dark:border-neutral-800 flex justify-between items-center">
      <Title elections={elections} />
      <div className="flex justify-end items-center h-full px-6">
        <HeaderNav />
        <img
          alt="Avatar"
          className="rounded-full"
          height="32"
          src="https://generated.vusercontent.net/placeholder.svg"
          style={{
            aspectRatio: '32/32',
            objectFit: 'cover',
          }}
          width="32"
        />
      </div>
    </header>
  );
}
