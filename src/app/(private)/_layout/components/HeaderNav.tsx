import Link from 'next/link';

const LINKS: {
  href: string;
  label: string;
}[] = [
  {
    href: '/dashboard/results',
    label: 'Results',
  },
  {
    href: '/dashboard/candidates',
    label: 'Candidates',
  },
  {
    href: '/dashboard/voters',
    label: 'Voters',
  },
];

export default function HeaderNav() {
  return (
    <nav className="mr-4 [&>a:last-child]:pr-0">
      {LINKS.map(({ href, label }, index) => (
        <Link
          key={`header_nav-${index}`}
          href={href}
          className="dark:text-gray-200 px-2"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
