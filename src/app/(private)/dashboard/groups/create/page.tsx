'use client';

import Title from '@/app/(private)/dashboard/_components/title';
import MemberTable from '@/app/(private)/dashboard/groups/create/_components/table';
import GroupForm from '@/app/(private)/dashboard/groups/create/_components/group-form';
import { Context } from '@/app/(private)/dashboard/groups/create/context';
import { useState } from 'react';

export default function CreateGroup() {
  const [members, setMembers] = useState<Context['members']>([]);

  const addMember = (email: string) => {
    if (members.find((user) => user.email === email)) return;

    setMembers([...members, { email }]);
  };

  const deleteMember = (email: string) => {
    setMembers(members.filter((member) => member.email !== email));
  };

  return (
    <main className="m-4">
      <Title>Create Group</Title>
      <div className="grid grid-cols-2 gap-4">
        <Context.Provider value={{ members, addMember, deleteMember }}>
          <GroupForm />
          <MemberTable />
        </Context.Provider>
      </div>
    </main>
  );
}
