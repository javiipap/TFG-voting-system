import { getCandidates } from '@/db/helpers';
import Title from '../../components/Title';
import AddCandidate from './_components/AddCandidate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DeleteCandidate from './_components/DeleteCandidate';

export default async function Page({ params }: { params: { slug: string } }) {
  const candidates = await getCandidates(params.slug);

  return (
    <main>
      <Title>Candidates</Title>
      <AddCandidate slug={params.slug} />
      {candidates.length > 0 && (
        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.candidates.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarFallback>
                        {candidate.candidates.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{candidate.candidates.name}</TableCell>
                  <TableCell>{candidate.candidates.description}</TableCell>
                  <TableCell>
                    <DeleteCandidate
                      id={candidate.candidates.id}
                      slug={params.slug}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
