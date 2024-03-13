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
import { getVoters } from '@/db/helpers';

export default async function Voters({ params }: { params: { slug: string } }) {
  const voters = await getVoters(params.slug);

  return (
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
          <TableBody>
            {voters.map((voter, index) => (
              <TableRow key={`voter-${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{voter.name}</TableCell>
                {/* <TableCell>{voter.pkey}</TableCell> */}
                <TableCell>{voter.hasVoted === null ? '❌' : '✅'}</TableCell>
                <TableCell>
                  <Button variant="link" className="text-red-600 px-0">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddVoter />
    </Dialog>
  );
}
