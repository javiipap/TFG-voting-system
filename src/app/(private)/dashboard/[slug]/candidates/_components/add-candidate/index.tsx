'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addCandidateAction } from '@/app/(private)/dashboard/[slug]/candidates/_components/add-candidate/actions';
import { useContext, useRef } from 'react';
import { useAction } from 'next-safe-action/hooks';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { schema } from '@/app/(private)/dashboard/[slug]/candidates/_components/add-candidate/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Context } from '@/app/(private)/dashboard/[slug]/context';

export default function AddCandidate() {
  const { id: electionId, slug } = useContext(Context) as Context;
  const formRef = useRef<HTMLFormElement>(null);
  const { execute } = useAction(addCandidateAction, {
    onSuccess: () => {
      formRef.current?.reset();
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      electionId,
      slug,
    },
    resolver: zodResolver(schema),
  });

  return (
    <div>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(execute)}
          className="space-y-2 [&>div]:space-y-1"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
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
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="py-4">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
