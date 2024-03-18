import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import Title from '../../components/Title';
import AddVoter from './components/AddVoter';

export default async function Voters({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Dialog>
        <Title
          component={
            <DialogTrigger asChild>
              <Button>Add voter</Button>
            </DialogTrigger>
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
        <AddVoter />
      </Dialog>
    </main>
  );
}
