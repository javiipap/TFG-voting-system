'use client';

import { Context } from '@/app/(private)/dashboard/[slug]/context';
import { storeClearResultsAction } from '@/app/(private)/dashboard/[slug]/results/_components/decrypt-form/actions';
import LoadingButton from '@/components/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import wasm_init, { decrypt_result } from 'client_utilities';
import { useAction } from 'next-safe-action/hooks';
import { useContext, useState } from 'react';

export default function DecryptForm() {
  const { encryptedResult, candidates, slug, adminCount } = useContext(
    Context
  ) as Context;
  console.log(adminCount);
  const { execute, status } = useAction(storeClearResultsAction);
  const [inputState, setInputState] = useState(new Array(adminCount).fill(''));
  const [isLoading, setIsLoading] = useState(false);

  const decryptResult = async () => {
    setIsLoading(true);
    await wasm_init();
    try {
      const input = Object.values(inputState).reduce((acc, share) => {
        const parsedShare = Buffer.from(share, 'base64');
        const buf = Buffer.alloc(acc.length + parsedShare.length);
        buf.set(acc, 0);
        buf.set(parsedShare, acc.length);

        return new Uint8Array(buf);
      }, new Uint8Array());

      const result = decrypt_result(
        input,
        Buffer.from(inputState[0], 'base64').length,
        adminCount,
        new Uint8Array(Buffer.from(encryptedResult!.slice(2), 'hex'))
      );

      setIsLoading(false);
      execute({
        slug,
        candidates: candidates.map((c, i) => ({
          ...c,
          votes: Number(result[i]),
        })),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <Label>Resultado cifrado</Label>
      <div className="w-[600px] font-mono break-all text-ellipsis overflow-hidden">
        {encryptedResult}
      </div>
      <div className="mt-3 space-y-2">
        <Label>Clave privada</Label>
        <div className="flex flex-wrap gap-4 pb-4">
          {[...new Array(adminCount).fill(0)].map((_, i) => (
            <div
              className="w-full md:w-[calc(50%-theme('spacing.2'))]"
              key={`private_share-${i}`}
            >
              <Input
                value={inputState[i]}
                className="mt-1 block w-full"
                placeholder={`Fragmento ${i + 1}`}
                onChange={(e) =>
                  setInputState((inp) =>
                    inp.map((val, j) => (j === i ? e.target.value : val))
                  )
                }
              />
            </div>
          ))}
        </div>
        <LoadingButton
          onClick={decryptResult}
          disabled={status === 'executing' || isLoading}
        >
          Descifrar
        </LoadingButton>
      </div>
    </div>
  );
}
