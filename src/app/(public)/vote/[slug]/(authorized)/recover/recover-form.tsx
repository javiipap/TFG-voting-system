'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';
import wasm_init, { rsa_decrypt } from 'client_utilities';
import CopyButton from '@/app/(public)/vote/[slug]/(authorized)/recover/copy-btn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function RecoverForm({ vote }: { vote: any }) {
  const pathname = usePathname();
  const [secret, setSecret] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [decrypted, setDecrypted] = useState<string>();

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length < 1) return;

    const reader = new FileReader();
    reader.onload = (file) => setSecret(file.target?.result?.toString());

    reader.readAsText(files[0]);
    e.target.value = '';
    e.target.files = null;
  };

  const handleDecrypt = async () => {
    if (!secret) return;
    setIsLoading(true);
    await wasm_init();

    setDecrypted(
      Buffer.from(
        rsa_decrypt(secret, Buffer.from(vote.recoveryEthSecret, 'base64'))
      ).toString()
    );

    setIsLoading(false);
  };

  return (
    <div className="mt-4">
      {!secret && <Input type="file" onChange={handleUpload} />}

      {!decrypted && secret && (
        <Button onClick={handleDecrypt} disabled={isLoading}>
          Descifrar
        </Button>
      )}

      {decrypted && (
        <div>
          <p>Secret key: </p>
          <div className="flex space-x-2 items-center">
            <div className="border rounded-md p-2 overflow-hidden text-ellipsis">
              {decrypted}
            </div>
            <div className="w-4">
              <CopyButton text={decrypted} />
            </div>
          </div>
          <Link href={pathname.replace('recover', 'delete')}>
            <Button className="mt-4">Eliminar</Button>
          </Link>
          <Link href={pathname.replace('recover', 'select')}>
            <Button className="mt-4 ml-2" variant="secondary">
              Seleccionar candidato
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
