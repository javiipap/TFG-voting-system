'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { createGroupAction } from './actions';
import { useContext, useRef } from 'react';
import { Context } from '@/app/(private)/dashboard/groups/create/context';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { schema } from '@/app/(private)/dashboard/groups/create/_components/group-form/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';

export default function GroupForm() {
  const { execute } = useAction(createGroupAction);
  const { addMember, members } = useContext(Context) as Context;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      members,
    },
  });
  const memberInputRef = useRef<HTMLInputElement>(null);

  return (
    <Form {...form}>
      <form className="relative" onSubmit={form.handleSubmit(execute)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Group description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormLabel>Add members</FormLabel>
        <div className="my-4 gap-2 flex items-center">
          <Input name="email" ref={memberInputRef} placeholder="Email" />
          <div className="flex-1">
            <Button
              variant="secondary"
              className="px-8"
              onClick={(e) => {
                e.preventDefault();
                if (memberInputRef.current) {
                  addMember(memberInputRef.current.value);
                  memberInputRef.current.value = '';
                }
              }}
            >
              Add
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <span className="block text-sm mb-2 text-foreground/80">
          You can add more users later
        </span>
        <Button type="submit">Create Group</Button>
      </form>
    </Form>
  );
}
