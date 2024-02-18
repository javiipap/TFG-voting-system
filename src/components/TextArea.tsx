import React from 'react';
import Label from './Label';

export default function TextArea({
  label,
  className,
  ...props
}: { label: string } & React.HTMLProps<HTMLTextAreaElement>) {
  return (
    <Label label={label}>
      <textarea
        {...props}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder-neutral-400 dark:text-neutral-100 dark:focus-visible:ring-offset-neutral-900 dark:focus-visible:ring-neutral-100 dark:focus-visible:ring-2 dark:disabled:opacity-70 dark:disabled:cursor-not-allowed dark:file:border-0 dark:file:bg-transparent dark:file:text-neutral-100 dark:file:font-medium dark:placeholder-neutral-400 dark:file:placeholder-neutral-400 dark:file:focus-visible:ring-offset-neutral-900 dark:file:focus-visible:ring-neutral-100 dark:file:focus-visible:ring-2 dark:file:disabled:opacity-70 dark:file:disabled:cursor-not-allowed dark:file:ring-offset-neutral-900 dark:file:ring-neutral-100 dark:file:ring-2 dark:file:ring-ring dark:file:ring-offset-2 dark:file:focus-visible:ring-offset-2 dark:file:focus-visible:ring-ring dark:file:focus-visible:ring-neutral-100 dark:file:focus-visible:ring-2 dark:file:ring-offset-2 dark:file:ring-ring dark:file:ring-neutral-100 dark:file:ring-2 dark:file:focus-visible:ring-offset-2 dark:file:focus-visible:ring-ring dark:file:focus-visible:ring-neutral-100 dark:file:focus-visible:ring-2 dark:file:ring-offset-2 dark:file:ring-ring dark:file:ring-neutral-100 dark:file:ring-2 dark:file:focus-visible:ring-offset-2 dark:file:focus-visible:ring-ring dark:file:focus-visible:ring-neutral-100 dark:file:focus-visible:ring-2 dark:file:ring-offset-2 dark:file:ring-ring dark:file:ring-neutral-100 dark:file:ring-2 dark:file:focus-visible:ring-offset-2 dark:file:focus-visible:ring-ring dark:file:focus-visible:ring-neutral-100 dark:file:focus-visible:ring-2 dark:file:ring-offset-2 dark:file:ring-ring dark:file:ring-neutral-100 dark:file:ring-2 dark:file:focus-visible:ring-offset-2 dark:file:focus-visible:ring-ring dark:file:focus-visible:ring-neutral-100 dark:file:focus-visible:ring-2 dark:file:ring-offset-2 dark:file:ring-ring dark"
      />
    </Label>
  );
}
