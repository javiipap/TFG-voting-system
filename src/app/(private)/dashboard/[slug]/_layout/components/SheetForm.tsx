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
import React, { useEffect } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { submitElection } from './_actions';
import Link from 'next/link';
import { FormField, Label } from './FormFields';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

export default function SheetForm() {
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
    }
  }, [formState]);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });

  return (
    <form action={formAction} className="mt-4 [&>div]:mb-4" ref={formRef}>
      <FormField>
        <Label>Election name</Label>
        <Input name="name" required />
      </FormField>
      <FormField>
        <Label>Description</Label>
        <Textarea name="description" className="max-h-80" required />
      </FormField>
      <FormField>
        <Label>Authentication method</Label>
        <Select name="auth" defaultValue="google">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a method" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="fnmt">FNMT certificate</SelectItem>
              <SelectItem value="any">Any</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          Users will use this method in order to participate.
        </span>
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
      <SheetFooter>
        <SheetClose asChild>
          <Button type="submit" disabled={pending}>
            Create
          </Button>
        </SheetClose>
      </SheetFooter>
    </form>
  );
}
