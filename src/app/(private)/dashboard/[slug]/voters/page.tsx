import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

import { getVoters } from '@/db/helpers';

export default async function Voters({ params }: { params: { slug: string } }) {
  const voters = await getVoters(params.slug);
  return (
    <>
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
    </>
  );
}
