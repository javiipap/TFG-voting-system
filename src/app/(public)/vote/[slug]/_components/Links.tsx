'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Links() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-2">
      <Link href={`${pathname}/delete`}>
        <Button>Eliminar voto previo</Button>
      </Link>
      <Link href={`${pathname}/previous`}>
        <Button variant="secondary">Pasos previos</Button>
      </Link>
      <Link href={`${pathname}/select`}>
        <Button>Seleccionar candidato</Button>
      </Link>
    </div>
  );
}
