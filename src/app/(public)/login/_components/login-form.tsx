'use client';

import { Button } from '@/components/ui/button';
import { FileKey2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { signInAction } from '@/app/(public)/login/_components/actions';
import { env } from '@/env';
import { useState } from 'react';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get('error'));

  const signIn = async () => {
    const req = await fetch(env.NEXT_PUBLIC_AUTH_PROXY);

    if (!req.ok) {
      setError("Couldn't retrieve certificate.");
      return;
    }

    const { cert } = await req.json();
    const result = await signInAction({ cert: decodeURIComponent(cert) });

    if (result && result.serverError) {
      setError(result.serverError);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Button className="" onClick={signIn}>
          <FileKey2 className="h-4 w-4 mr-2" />
          Certificado
        </Button>
        {!!error && (
          <div className="">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
