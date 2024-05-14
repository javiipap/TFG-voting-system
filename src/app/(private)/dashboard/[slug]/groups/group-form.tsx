'use client';

import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schema } from '@/app/(private)/dashboard/[slug]/groups/validations';
import { z } from 'zod';
import { useContext } from 'react';
import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { authorizeGroupAction } from '@/app/(private)/dashboard/[slug]/groups/actions';

export default function GroupForm({
  groups,
}: {
  groups: {
    authorized_groups: {
      id: number;
      electionId: number;
      groupId: number;
    } | null;
    user_groups: {
      id: number;
      name: string;
      description: string | null;
      slug: string;
      adminId: number;
    };
  }[];
}) {
  const { id: electionId, slug, startDate } = useContext(Context) as Context;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      electionId,
      slug,
    },
  });

  if (startDate < new Date()) {
    return <></>;
  }

  return (
    <Form {...form}>
      <form
        className="flex gap-4 w-1/2 mb-8"
        onSubmit={form.handleSubmit(authorizeGroupAction)}
      >
        <FormField
          name="groupId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups
                      .filter((group) => !group.authorized_groups?.id)
                      .map(({ user_groups }) => (
                        <SelectItem
                          key={user_groups.id}
                          value={user_groups.id.toString()}
                        >
                          {user_groups.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Add</Button>
      </form>
    </Form>
  );
}
