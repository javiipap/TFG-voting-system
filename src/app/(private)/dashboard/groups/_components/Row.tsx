'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Edit2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { submitDeleteGroup } from '../_actions';
import * as schema from '@/db/schema';

export default function Row({
  id,
  name,
  description,
  slug,
}: typeof schema.userGroups.$inferSelect) {
  return (
    <TableRow key={`groups-${id}`}>
      <TableCell>{name}</TableCell>
      <TableCell>{description}</TableCell>
      <TableCell className="flex items-center">
        <Link href={`/dashboard/groups/edit/${slug}`}>
          <div className="bg-primary p-2 rounded">
            <Edit2 className="h-3 w-3 text-secondary" />
          </div>
        </Link>
        <Button
          variant="link"
          className="text-red-600"
          onClick={async () => await submitDeleteGroup(id)}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  );
}
