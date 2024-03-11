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
  const hours = [...new Array(24)].map((_, i) => {
    const time = (i + 8) % 12;
    const pm = (i + 8) % 24 >= 12;

    return `${!time ? '12' : time}:00 ${pm ? 'pm' : 'am'}`;
  });

  return (
    <Form {...form}>
      <div className="mt-4 [&>div]:mb-4">
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
                <Textarea className="max-h-80" />
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
              <FormControl>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
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
              </FormControl>
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
              {/* <FormDescription>This is your public display name.</FormDescription> */}
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
                <FormControl>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="scope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End time</FormLabel>
                <FormControl>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Form>
  );
}
