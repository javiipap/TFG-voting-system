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
} from '@/components/ui/table';
import Row from './_components/Row';

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
          <TableCell>Actions</TableCell>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <Row {...group} key={`groups-${group.id}`} />
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
