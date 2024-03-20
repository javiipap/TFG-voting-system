import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '../../components/Title';
import AddVoterDialog from './components/AddVoterDialog';

export default async function Voters({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Title component={<AddVoterDialog />}>Voters</Title>
      <div className="border shadow-sm rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>
    </main>
  );
}
