import DeleteVoter from '@/app/(private)/dashboard/[slug]/voters/_components/unauthorize-voter';
import { TableCell, TableRow } from '@/components/ui/table';

import { getVoters } from '@/data-access/elections';

export default async function Voters({ params }: { params: { slug: string } }) {
  const voters = await getVoters(params.slug);

  return (
    <>
      {voters.map((voter, index) => (
        <TableRow key={`voter-${index}`}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{voter.name}</TableCell>
          <TableCell>{voter.email}</TableCell>
          <TableCell>{voter.hasVoted === null ? '❌' : '✅'}</TableCell>
          <TableCell>
            <DeleteVoter userId={voter.id} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
