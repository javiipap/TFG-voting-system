import Link from 'next/link';

const LINKS: {
  href: string;
  label: string;
}[] = [
  {
    href: '/dashboard',
    label: 'Elections',
  },
  {
    href: '/',
    label: 'Home',
  },
];

export default function HeaderNav() {
  return (
    <nav className="mr-4 [&>a:last-child]:pr-0">
      {LINKS.map(({ href, label }, index) => (
        <Link
          key={`header_nav-${index}`}
          href={href}
          className="dark:text-neutral-200 px-2"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
