import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '@/app/(private)/dashboard/components/Title';
import AddVoterDialog from '@/app/(private)/dashboard/[slug]/voters/_components/AddVoterDialog';
import { PublicOverlay } from '@/app/(private)/dashboard/[slug]/_components/public-overlay';

export default async function Voters({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  return (
    <PublicOverlay slug={params.slug}>
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
    </PublicOverlay>
  );
}
