'use client';

import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { storeClearResultsAction } from '@/app/(private)/dashboard/[slug]/results/_components/decrypt-form/actions';
import LoadingButton from '@/components/loading-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import wasm_init, { decrypt_result } from 'client_utilities';
import { useAction } from 'next-safe-action/hooks';
import { useContext, useState } from 'react';

export default function DecryptForm() {
  const { encryptedResult, candidates, slug } = useContext(Context) as Context;
  const { execute, status } = useAction(storeClearResultsAction);
  const [inputState, setInputState] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const decryptResult = async () => {
    setIsLoading(true);
    await wasm_init();

    const result = decrypt_result(
      Buffer.from(inputState, 'base64') as unknown as Uint8Array,
      Buffer.from(encryptedResult!.slice(2), 'hex') as unknown as Uint8Array
    );

    setIsLoading(false);
    execute({
      slug,
      candidates: candidates.map((c, i) => ({
        ...c,
        votes: Number(result[i]),
      })),
    });
  };

  return (
    <div className="">
      <Label>Resultado cifrado</Label>
      <div className="w-[600px] font-mono break-all text-ellipsis overflow-hidden">
        {encryptedResult}
      </div>
      <div className="mt-3 space-y-2">
        <Label>Clave privada</Label>
        <Input
          value={inputState}
          onChange={(e) => setInputState(e.target.value)}
        />
        <LoadingButton
          onClick={decryptResult}
          disabled={status === 'executing' || isLoading}
        >
          Desencriptar
        </LoadingButton>
      </div>
    </div>
  );
}
