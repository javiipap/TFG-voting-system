'use client';

import { Button } from '@/components/ui/button';

export function DownloadButton({ name, data }: { name: string; data: string }) {
  const file = new Blob([data], { type: 'text/plain' });

  return (
    <Button>
      <a
        download={name}
        target="_blank"
        rel="noreferrer"
        href={URL.createObjectURL(file)}
        style={{
          textDecoration: 'inherit',
          color: 'inherit',
        }}
      >
        Download
      </a>
    </Button>
  );
}
