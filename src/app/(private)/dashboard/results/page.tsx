'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Title from '../components/Title';

export default function Page() {
  return (
    <>
      <Title>Results</Title>
      <div className="flex gap-8 h-[400px] mb-8"></div>
      <div className="border shadow-sm rounded-lg dark:border-neutral-800 dark:bg-black">
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
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>Feb</TableCell>
              <TableCell>157</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3</TableCell>
              <TableCell>Mar</TableCell>
              <TableCell>129</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>4</TableCell>
              <TableCell>Apr</TableCell>
              <TableCell>150</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5</TableCell>
              <TableCell>May</TableCell>
              <TableCell>119</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>6</TableCell>
              <TableCell>Jun</TableCell>
              <TableCell>72</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
