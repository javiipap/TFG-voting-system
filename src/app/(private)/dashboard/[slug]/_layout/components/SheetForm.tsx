'use client';

import { Textarea } from '@/components/ui/textarea';
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
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

enum AuthMethod {
  google = 'Google',
  fnmt = 'FNMT Certificate',
}

type Inputs = {
  name: string;
  description: string;
  scope: AuthMethod;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export default function SheetForm() {
  const form = useForm<Inputs>();
  const { toast } = useToast();

  const hours = [...new Array(24)].map((_, i) => {
    const time = (i + 8) % 12;
    const pm = (i + 8) % 24 >= 12;

    return `${!time ? '12' : time}:00 ${pm ? 'pm' : 'am'}`;
  });

  function onSubmit() {
    toast({
      title: 'Election created',
      description: 'The election has been created successfully',
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-4 [&>div]:mb-4"
      >
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Election name</FormLabel>
              <FormControl>
                <Input placeholder="election" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="max-h-80" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(AuthMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                Users will use this method in order to participate.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time span</FormLabel>
              <FormControl>
                <DatePickerWithRange />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4 [&>div]:w-[50%]">
          <FormField
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {hours.map((val) => (
                        <SelectItem key={`start-${val}`} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {hours.map((val) => (
                        <SelectItem key={`end-${val}`} value={val}>
                          {val}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Create</Button>
          </SheetClose>
        </SheetFooter>
      </form>
    </Form>
  );
}
