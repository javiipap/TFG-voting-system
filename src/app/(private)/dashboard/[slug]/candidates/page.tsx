'use client';

import Title from '@/app/(private)/dashboard/components/Title';
import AddCandidate from '@/app/(private)/dashboard/[slug]/candidates/_components/add-candidate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import RemoveCandidate from '@/app/(private)/dashboard/[slug]/candidates/_components/remove-candidate';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';

export default async function Page() {
  const { candidates } = useContext(Context) as Context;

  return (
    <main>
      <Title>Candidates</Title>
      <AddCandidate />
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
              {candidates.map(({ id, name, description }) => (
                <TableRow key={id}>
                  <TableCell>
                    <Avatar>
                      <AvatarFallback>
                        {name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>{description}</TableCell>
                  <TableCell>
                    <RemoveCandidate id={id} name={name} />
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
