import { Button } from '@/components/ui/button';
import Title from '../components/Title';
import Link from 'next/link';
import { auth } from '@/auth';
import { getGroups } from '@/db/helpers';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
      <Table>
        <TableHeader>
          <TableCell>Name</TableCell>
          <TableCell>Description</TableCell>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id}>
              <TableCell>{group.name}</TableCell>
              <TableCell>{group.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
