'use client';

import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { authorizeUserAction } from '@/app/(private)/dashboard/[slug]/voters/_components/authorize-voter-dialog/actions';
import { schema } from '@/app/(private)/dashboard/[slug]/voters/_components/authorize-voter-dialog/validation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function AddVoterDialog() {
  const {
    startDate,
    id: electionId,
    slug,
    isPrivate,
  } = useContext(Context) as Context;
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const { execute, status } = useAction(authorizeUserAction, {
    onSettled: () => {
      dialogCloseRef.current?.click();
    },
    onError: (e) => {
      toast({ title: e.serverError || 'Unkown error' });
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { electionId, slug },
  });

  if (startDate < new Date()) {
    return <></>;
  }

  return (
    <Dialog>
      {isPrivate && (
        <DialogTrigger asChild>
          <Button variant="secondary">Add voter</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add voter</DialogTitle>
          <DialogDescription>
            Fill in the information for the new voter.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-4 py-4"
            onSubmit={form.handleSubmit(execute)}
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Email</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={status === 'executing'}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <DialogClose ref={dialogCloseRef} />
      </DialogContent>
    </Dialog>
  );
}
