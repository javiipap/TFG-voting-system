'use client';

import { Context } from '@/app/(private)/dashboard/groups/create/context';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useContext } from 'react';

export default function MemberTable() {
  const { members, deleteMember } = useContext(Context) as Context;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map(({ email }) => (
          <TableRow key={email}>
            <TableCell>{email}</TableCell>
            <TableCell>
              <Button
                variant="link"
                className="p-0 text-red-600"
                onClick={(e) => {
                  e.preventDefault;
                  deleteMember(email);
                }}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
