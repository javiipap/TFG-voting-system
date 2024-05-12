'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { submitElectionAction } from '@/app/(private)/dashboard/_layout/actions';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import load_wasm, { generate_elgamal_keypair } from 'client_utilities';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { schema } from '@/app/(private)/dashboard/_layout/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormItem,
  FormField,
  FormControl,
  Form,
  FormDescription,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { z } from 'zod';
import { DatePicker } from '@/components/ui/dat-picker';

export default function SheetForm() {
  const [keyPair, setKeyPair] = useState<{ public: string; secret: string }>();
  const { toast } = useToast();

  const formRef = React.useRef<HTMLFormElement>(null);
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      from: new Date(),
      to: new Date(new Date().getTime() + 86400000),
      start: '9',
      end: '9',
      isPrivate: true,
    },
    resolver: zodResolver(schema),
  });

  const { execute, result, status } = useAction(submitElectionAction, {
    onError: (error) => {
      toast({
        title: 'Error creating election',
        description: error.serverError,
      });
    },
    onSuccess: ({ slug }) => {
      formRef.current?.reset();
      toast({
        title: 'Election created',
        description: (
          <p>
            You can edit the election by visiting:{' '}
            <Link href={`/dashboard/${slug}`}>{slug}</Link>
          </p>
        ),
      });
    },
  });

  const hours = [...new Array(24)].map((_, i) => {
    const time = (i + 8) % 12;
    const pm = (i + 8) % 24 >= 12;

    return {
      label: `${!time ? '12' : time}:00 ${pm ? 'pm' : 'am'}`,
      value: `${(i + 8) % 24}`,
    };
  });

  useEffect(() => {
    load_wasm().then(() => {
      const keyPair = generate_elgamal_keypair();
      setKeyPair(() => ({
        public: Buffer.from(keyPair.public).toString('base64'),
        secret: Buffer.from(keyPair.secret).toString('base64'),
      }));
      form.setValue(
        'masterPublicKey',
        Buffer.from(keyPair.public).toString('base64')
      );
    });
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute, console.log)}
        className="mt-4 space-y-2"
        ref={formRef}
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Election name</FormLabel>
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
                <Textarea {...field} className="max-h-80" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="from"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start day</FormLabel>
              <FormControl>
                <DatePicker setValue={field.onChange} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="to"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End day</FormLabel>
              <FormControl>
                <DatePicker setValue={field.onChange} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 [&>div]:w-[50%]">
          <FormField
            name="start"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start time</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {hours.map(({ value, label }) => (
                          <SelectItem key={`start-${value}`} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="end"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {hours.map(({ value, label }) => (
                          <SelectItem key={`end-${value}`} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          name="isPrivate"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-4">
                <FormLabel>Private</FormLabel>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
              <FormDescription>
                If private, only users explicitly authorized will be able to
                vote.
              </FormDescription>
            </FormItem>
          )}
        />
        <SheetFooter>
          {!!keyPair && status === 'hasSucceeded' ? (
            <div className="flex flex-col w-full space-y-3 mt-4">
              <div className="">
                <FormLabel>Public key</FormLabel>
                <Textarea readOnly defaultValue={keyPair.public} />
              </div>
              <div className="">
                <FormLabel>Secret key</FormLabel>
                <Textarea readOnly defaultValue={keyPair.secret} />
              </div>
              <SheetClose asChild>
                <Button>Download</Button>
              </SheetClose>
            </div>
          ) : (
            <Button type="submit" disabled={status === 'executing'}>
              Create
            </Button>
          )}
        </SheetFooter>
      </form>
    </Form>
  );
}