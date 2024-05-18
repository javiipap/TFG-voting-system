'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signUpAction } from '@/app/(public)/register/_components/actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { schema } from '@/app/(public)/register/_components/validation';
import { useEffect } from 'react';
import { env } from '@/env';

export default function SignUpForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', cert: '' },
  });

  const getCertificate = async () => {
    const req = await fetch(env.NEXT_PUBLIC_AUTH_PROXY);

    if (!req.ok) {
      form.setValue('cert', '');
      return;
    }
    const { cert, email } = await req.json();

    form.setValue('email', decodeURIComponent(email));
    form.setValue('cert', decodeURIComponent(cert));
  };

  useEffect(() => {
    getCertificate();
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          signUpAction(values);
        })}
        className="space-y-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
}
