'use client';

import { Context } from '@/app/(public)/vote/[slug]/context';
import { requestDeleteAction } from '@/app/(public)/vote/[slug]/delete/actions';
import { schema } from '@/app/(public)/vote/[slug]/delete/validation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function DeleteVote() {
  const { electionId } = useContext(Context) as Context;
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      address: '',
      token: '',
    },
    resolver: zodResolver(schema),
  });

  return (
    <div className="flex justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            requestDeleteAction({ ...values, electionId });
          })}
          className="w-[400px] space-y-2"
        >
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <Label>Dirección eth</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <Label>Token de verificación</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="float-right">
            Solicitar
          </Button>
        </form>
      </Form>
    </div>
  );
}
