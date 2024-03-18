import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';

export default function LoadingVotes() {
  return (
    <>
      {[...new Array(10)].map((i) => (
        <TableRow key={`voter_sk-${i}`}>
          <TableCell>
            <Skeleton className="w-4 h-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-20 h-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-4 h-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="w-4 h-4" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
