'use client';

import { Textarea } from '@/components/ui/textarea';
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
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
import { useFormStatus, useFormState } from 'react-dom';
import { submitElection, submitPublicKey } from './_actions';
import Link from 'next/link';
import { FormField, Label } from '../../[slug]/_layout/components/FormFields';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import init, { generate_elgamal_keypair } from 'ballots_client';

export default function SheetForm() {
  const [keyPair, setKeyPair] =
    useState<ReturnType<typeof generate_elgamal_keypair>>();
  const { toast } = useToast();

  const formRef = React.useRef<HTMLFormElement>(null);

  const [formState, formAction] = useFormState(submitElection, {
    election: {
      name: '',
      slug: '',
    },
    error: '',
  });
  const { pending } = useFormStatus();

  const hours = [...new Array(24)].map((_, i) => {
    const time = (i + 8) % 12;
    const pm = (i + 8) % 24 >= 12;

    return {
      label: `${!time ? '12' : time}:00 ${pm ? 'pm' : 'am'}`,
      value: `${(i + 8) % 24}`,
    };
  });

  const generatePubKey = async (slug: string) => {
    await init();
    const _keyPair = generate_elgamal_keypair();
    submitPublicKey(slug, Buffer.from(_keyPair.public).toString('base64'));
    setKeyPair(_keyPair);
  };

  useEffect(() => {
    if (formState.error) {
      toast({ title: 'Error creating election', description: formState.error });
    } else if (formState.election.slug) {
      formRef.current?.reset();
      toast({
        title: 'Election created',
        description: (
          <p>
            You can edit the election by visiting:{' '}
            <Link href={`/dashboard/${formState.election.slug}`}>
              {formState.election.slug}
            </Link>
          </p>
        ),
      });
      generatePubKey(formState.election.slug);
    }
  }, [formState]);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  });

  return (
    <form action={formAction} className="mt-4" ref={formRef}>
      <FormField>
        <Label>Election name</Label>
        <Input name="name" required />
      </FormField>
      <FormField>
        <Label>Description</Label>
        <Textarea name="description" className="max-h-80" required />
      </FormField>
      <FormField>
        <Label>Time span</Label>
        <DatePickerWithRange onSelect={setDate} selected={date} />
        <input
          type="hidden"
          name="timespan"
          value={JSON.stringify({ from: date?.from, to: date?.to })}
        />
      </FormField>
      <div className="flex gap-4 [&>div]:w-[50%]">
        <FormField>
          <Label>Start time</Label>
          <Select name="start">
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
        </FormField>
        <FormField>
          <Label>End time</Label>
          <Select name="end">
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
        </FormField>
      </div>
      <FormField>
        <div className="flex gap-4">
          <Label>Private</Label>
          <Switch name="isPrivate" defaultChecked />
        </div>
        <span className="text-sm text-muted-foreground">
          If private only users explicitly authorized will be able to vote.
        </span>
      </FormField>
      <SheetFooter>
        <Button type="submit" disabled={pending}>
          Create
        </Button>
      </SheetFooter>
      {!!keyPair ? (
        <>
          <Textarea
            readOnly
            defaultValue={Buffer.from(keyPair.public).toString('base64')}
          />
          <Textarea
            readOnly
            defaultValue={Buffer.from(keyPair.secret).toString('base64')}
          />
          <SheetClose asChild>
            <Button>Download</Button>
          </SheetClose>
        </>
      ) : (
        ''
      )}
    </form>
  );
}
