'use client';

import { Button } from '@/components/ui/button';
import { FileKey2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { signInAction } from '@/app/(public)/login/_components/actions';
import { useState } from 'react';
import { execChallenge } from '@/lib/challenge';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get('error'));

  const signIn = async () => {
    try {
      const { certificate } = await execChallenge();
      const result = await signInAction({
        cert: Buffer.from(certificate).toString('base64'),
      });

      if (result && result.serverError) {
        setError(result.serverError);
      }
    } catch {
      setError("Couldn't retrieve certificate.");
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
