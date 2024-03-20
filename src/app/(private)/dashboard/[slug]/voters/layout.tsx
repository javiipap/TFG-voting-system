import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '../../components/Title';
import AddVoterDialog from './components/AddVoterDialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Voters({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Title
        component={
          <div className="space-x-4">
            <Link href="/dashboard/groups/create">
              <Button>Add group</Button>
            </Link>
            <AddVoterDialog />
          </div>
        }
      >
        Voters
      </Title>
      <div className="border shadow-sm rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Public Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </main>
  );
}
