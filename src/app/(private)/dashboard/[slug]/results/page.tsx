'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '@/app/(private)/dashboard/_components/title';
import DecryptForm from '@/app/(private)/dashboard/[slug]/results/_components/decrypt-form';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';
import ForceTally from '@/app/(private)/dashboard/[slug]/results/_components/force-tally';

export default function Page() {
  const { encryptedResult, candidates } = useContext(Context) as Context;

  return (
    <main>
      <Title>Results</Title>
      <div className="mb-8">
        {!encryptedResult && <ForceTally />}
        {encryptedResult && typeof candidates[0].votes !== 'number' && (
          <DecryptForm />
        )}
      </div>
      <div className="border shadow-sm rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates
              .toSorted((lhs, rhs) => (rhs.votes || 0) - (lhs.votes || 0))
              .map(({ name, votes, id }, i) => (
                <TableRow key={`candidate-${id}`}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>{votes ?? 'N/A'}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
