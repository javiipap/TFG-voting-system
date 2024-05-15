'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '@/app/(private)/dashboard/_components/title';
import { Button } from '@/components/ui/button';
import { forceTally } from '@/app/(private)/dashboard/[slug]/results/actions';

export default function Page({ params }: { params: { slug: string } }) {
  const [result, setResult] = useState<string>();
  const onClick = async () => {
    await forceTally(params.slug);
  };

  return (
    <main>
      <Title>Results</Title>
      <div className="flex gap-8 h-[400px] mb-8">
        <Button onClick={onClick}>Retrieve results</Button>
        {!!result && <p>result</p>}
      </div>
      <div className="border shadow-sm rounded-lg">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>Jan</TableCell>
              <TableCell>111</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
