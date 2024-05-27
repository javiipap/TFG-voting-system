'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useMemo, useState } from 'react';
import wasm_init, { rsa_decrypt } from 'client_utilities';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AddrViewer } from '@/app/(public)/vote/[slug]/(authorized)/previous/_components/addr-viewer';
import { Web3 } from 'web3';

export default function RecoverForm({ vote }: { vote: any }) {
  const pathname = usePathname();
  const [secret, setSecret] = useState<string | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [decrypted, setDecrypted] = useState<string>();

  const address = useMemo(() => {
    if (!decrypted) return '';

    return new Web3().eth.accounts.privateKeyToAccount(
      Buffer.from(decrypted.slice(2), 'hex')
    ).address;
  }, [decrypted]);

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
          <div className="space-y-2">
            <AddrViewer title="Address" value={address} />
            <AddrViewer title="Secret" value={decrypted} />
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
