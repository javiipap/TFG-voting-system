'use client';

import { Context } from '@/app/(public)/vote/[slug]/context';
import { requestDeleteAction } from '@/app/(public)/vote/[slug]/(authorized)/delete/actions';
import { schema } from '@/app/(public)/vote/[slug]/(authorized)/delete/validation';
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
import { useAction } from 'next-safe-action/hooks';
import { useToast } from '@/components/ui/use-toast';

export default function DeleteVote() {
  const { electionId } = useContext(Context) as Context;
  const { toast } = useToast();
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      electionId,
    },
    resolver: zodResolver(schema),
  });

  const { execute, status } = useAction(requestDeleteAction, {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your vote has been deleted successfully',
      });
    },
    onError: (err) => {
      console.log(err.serverError);
      toast({
        title: 'Error',
        description: err.serverError || 'Unexpected server error',
      });
    },
  });

  return (
    <div className="flex justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            execute(values);
          })}
          className="w-[95%] mx-auto md:w-[400px] space-y-2"
        >
          <FormField
            control={form.control}
            name="sk"
            render={({ field }) => (
              <FormItem>
                <Label>Clave secreta eth</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {}
          <Button
            type="submit"
            className="float-right"
            disabled={status === 'executing'}
          >
            Solicitar
          </Button>
        </form>
      </Form>
    </div>
  );
}
