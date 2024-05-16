'use client';

import { Download } from 'lucide-react';

export function DownloadButton({ name, data }: { name: string; data: string }) {
  const file = new Blob([data], { type: 'text/plain' });

  return (
    <a
      download={name}
      target="_blank"
      rel="noreferrer"
      href={URL.createObjectURL(file)}
      className="bg-foreground text-sm text-background rounded px-4 py-2 flex justify-center items-center hover:bg-foreground/95 transition-colors"
    >
      Download
      <Download className="ml-1 h-[1em]" />
    </a>
  );
}
