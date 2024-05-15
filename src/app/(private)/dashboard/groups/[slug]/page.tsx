'use client';

import { Input } from '@/components/ui/input';
import { FormField, Label } from '../../[slug]/_layout/components/FormFields';
import { Textarea } from '@/components/ui/textarea';
import Title from '../../_components/title';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MouseEvent, MouseEventHandler, useRef, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { updateGroup } from '@/app/(private)/dashboard/groups/[slug]/actions';

interface Member {
  name: string;
  email: string;
  dni?: string;
}

export default function GroupPage() {
  const [members, setMembers] = useState<Member[]>([]);

  const memberNameRef = useRef<HTMLInputElement>(null);
  const memberEmailRef = useRef<HTMLInputElement>(null);
  const memberDNIRef = useRef<HTMLInputElement>(null);

  const addMember: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setMembers([
      ...members,
      {
        name: memberNameRef.current?.value || '',
        email: memberEmailRef.current?.value || '',
        dni: memberDNIRef.current?.value || '',
      },
    ]);

    memberNameRef.current!.value = '';
    memberEmailRef.current!.value = '';
    memberDNIRef.current!.value = '';
  };

  const deleteMember = (e: MouseEvent<HTMLButtonElement>, email: string) => {
    e.preventDefault();
    setMembers(members.filter((member) => member.email !== email));
  };

  return (
    <main className="m-4">
      <Title>Create Group</Title>
      <div className="grid grid-cols-2 gap-4">
        <form className="relative" action={updateGroup}>
          <FormField>
            <Label>Group Name</Label>
            <Input name="name" />
          </FormField>
          <FormField>
            <Label>Group description</Label>
            <Textarea name="description" />
          </FormField>
          <FormField>
            <Label>Add members</Label>
            <div className="flex gap-2 items-end">
              <FormField>
                <Label>Name</Label>
                <Input ref={memberNameRef} />
              </FormField>
              <FormField>
                <Label>Email</Label>
                <Input ref={memberEmailRef} />
              </FormField>
              <FormField>
                <Label>DNI</Label>
                <Input ref={memberDNIRef} />
              </FormField>
              <div className="flex-1 mb-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={addMember}
                >
                  Add
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <span className="text-sm text-foreground/80">
              You can add more users later
            </span>
          </FormField>
          <input type="hidden" name="members" value={JSON.stringify(members)} />
          <Button type="submit">Create Group</Button>
        </form>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map(({ name, email, dni }) => (
              <TableRow key={email}>
                <TableCell>{name}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{dni}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={(e) => deleteMember(e, email)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
