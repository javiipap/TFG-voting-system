import { Button } from '@/components/ui/button';
import Title from '@/app/(private)/dashboard/_components/title';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getGroups } from '@/db/helpers';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit2 } from 'lucide-react';
import DeleteGroup from '@/app/(private)/dashboard/groups/_components/delete-group';

export default async function Groups() {
  const session = await auth();

  const groups = await getGroups(session!.user.adminId!);

  return (
    <main className="m-4">
      <Title
        component={
          <Button>
            <Link href="/dashboard/groups/create">Create</Link>
          </Button>
        }
      >
        Groups
      </Title>
      {groups.length > 0 ? (
        <Table>
          <TableHeader>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableHeader>
          <TableBody>
            {groups.map(({ id, name, description, slug }) => (
              <TableRow key={`groups-${id}`}>
                <TableCell>{name}</TableCell>
                <TableCell>{description}</TableCell>
                <TableCell className="flex items-center">
                  <Link href={`/dashboard/groups/edit/${slug}`}>
                    <div className="bg-primary p-2 rounded">
                      <Edit2 className="h-3 w-3 text-secondary" />
                    </div>
                  </Link>
                  <DeleteGroup id={id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <span>No groups...</span>
      )}
    </main>
  );
}
