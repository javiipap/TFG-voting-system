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
import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { execChallenge } from '@/lib/challenge';

function getErrorText(err: string) {
  switch (err) {
    case 'no-acc':
      return 'Ha intentado iniciar sesión con una cuenta que no existe, regístrese primero.';
    case 'no-cert':
      return 'El certificado utilizado no es reconocido por el servidor.';

    default:
      return 'Ha habido un error inesperado, inténtalo de nuevo más tarde.';
  }
}

export default function SignUpForm() {
  const error = useSearchParams().get('error');
  const triggered = useRef(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', cert: '' },
  });

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    execChallenge()
      .then(({ subj, certificate, publicKey }) => {
        form.setValue('email', subj);
        form.setValue('cert', Buffer.from(certificate).toString('base64'));
        form.setValue('publicKey', Buffer.from(publicKey).toString('base64'));
      })
      .catch((e) => {
        router.push('/register?error=no-cert');
      });
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
        {error && (
          <div className="bg-red-700 p-4 rounded text-sm">
            {getErrorText(error)}
          </div>
        )}
        <Button type="submit" className="w-full mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
}
