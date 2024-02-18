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
        className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </Label>
  );
}
