'use client';

import { requestPermissionAction } from '@/app/(public)/faucet/_actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAction } from 'next-safe-action/hooks';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schema } from './validation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Faucet() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticket: searchParams.get('ticket') || '',
    },
  });

  const { execute, status } = useAction(requestPermissionAction, {
    onSuccess: () => {
      formRef.current?.reset();
      toast({
        title: 'Permission granted',
      });
    },
    onError: (e) => {
      toast({
        title: e.serverError || 'Unkonwn validation error',
      });
    },
  });

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(execute)}
          className="space-y-4 w-[400px]"
          ref={formRef}
        >
          <div className="">
            <h1 className="text-3xl font-bold">Introduce tu ticket</h1>
            <Separator />
            <span className="text-sm">
              Se cargará tu cuenta con el suficiente ether para votar en la
              elección designada
            </span>
          </div>
          <FormField
            name="ticket"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="float-right"
            disabled={status === 'executing'}
          >
            Solicitar
          </Button>
        </form>
      </Form>
    </main>
  );
}
