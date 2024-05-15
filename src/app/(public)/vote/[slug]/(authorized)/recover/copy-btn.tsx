'use client';

import { Copy } from 'lucide-react';

export default function CopyButton({ text }: { text: string }) {
  return (
    <Copy
      className="translate-y-1 cursor-pointer"
      onClick={() => {
        navigator.clipboard.writeText(text);
      }}
    />
  );
}
