'use client';

import Link from 'next/link';
import { StatsIcon, UsersIcon } from './icons';
import { useParams, usePathname } from 'next/navigation';

export function AsideNav() {
  const pathname = usePathname();
  const params = useParams();
  const activeLink =
    'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-neutral-50';
  const hover = 'hover:text-neutral-950 dark:hover:text-neutral-50';

  const LINKS: {
    href: string;
    Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    label: string;
  }[] = [
    {
      href: `/dashboard/${params.slug}/results`,
      Icon: StatsIcon,
      label: 'Results',
    },
    {
      href: `/dashboard/${params.slug}/candidates`,
      Icon: UsersIcon,
      label: 'Candidates',
    },
    {
      href: `/dashboard/${params.slug}/voters`,
      Icon: UsersIcon,
      label: 'Voters',
    },
  ];

  return (
    <nav className="flex-1 px-4 text-sm font-medium border-b dark:border-neutral-800 mt-2">
      {LINKS.map(({ href, Icon, label }, index) => (
        <Link
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 transition-all ${hover} ${
            pathname === href ? activeLink : 'dark:text-neutral-300'
          }`}
          href={href}
          key={`aside_link-${index}`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
