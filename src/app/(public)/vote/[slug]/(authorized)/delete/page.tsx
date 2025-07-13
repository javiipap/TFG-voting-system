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
import { User } from 'next-auth';
import { encodeMetadata } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib';
import { publicKeyCreate } from 'secp256k1';
import { ethSign, privateKeyToAddress } from '@/lib/ethereum';
import LoadingButton from '@/components/loading-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DeleteVote() {
  const context = useContext(Context) as Context;
  const electionId = context.electionId;
  const user = context.user as User;
  const pathname = usePathname();
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
      console.log({ err });
      toast({
        title: 'Error',
        description: err.serverError || 'Unexpected server error',
      });
    },
  });

  const execChallenge = async (_privateKey: string) => {
    const challenge = await encodeMetadata([user.email, user.userId, user.pk]);
    const privateKey = new Uint8Array(Buffer.from(_privateKey.slice(2), 'hex'));
    const publicKey = publicKeyCreate(privateKey);

    const signature = await ethSign(challenge, privateKey);
    const address = privateKeyToAddress(_privateKey);

    return {
      signature,
      publicKey: Buffer.from(publicKey).toString('base64'),
      address,
    };
  };

  const onClick = async (e: any) => {
    e.preventDefault();

    const formValues = form.getValues();

    const { signature, publicKey, address } = await execChallenge(
      formValues.sk
    );

    execute({ ...formValues, publicKey, signature, address });
  };

  return (
    <div className="flex justify-center">
      <Form {...form}>
        <form className="w-[95%] mx-auto md:w-[400px] space-y-2">
          <FormField
            control={form.control}
            name="sk"
            render={({ field }) => (
              <FormItem>
                <Label>Clave privada eth</Label>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {status === 'hasSucceeded' || status === 'hasErrored' ? (
            <Link href={pathname.replace('delete', 'previous')}>
              <Button className="float-right mt-4">Continuar</Button>
            </Link>
          ) : (
            <LoadingButton
              type="submit"
              className="float-right mt-4"
              disabled={status === 'executing'}
              onClick={onClick}
            >
              Solicitar
            </LoadingButton>
          )}
        </form>
      </Form>
    </div>
  );
}
