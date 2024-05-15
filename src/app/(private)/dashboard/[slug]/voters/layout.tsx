import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '@/app/(private)/dashboard/_components/title';
import AddVoterDialog from '@/app/(private)/dashboard/[slug]/voters/add-voter-dialog';

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
