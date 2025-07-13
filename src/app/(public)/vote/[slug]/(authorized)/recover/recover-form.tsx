'use client';

import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AddrViewer } from '@/components/addr-viewer';
import { privateKeyToAddress } from '@/lib/ethereum';
import { requestUserInteraction } from '@/lib/yotefirmo';
import LoadingButton from '@/components/loading-button';

export default function RecoverForm({ vote }: { vote: any }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [decrypted, setDecrypted] = useState<string>();

  const address = useMemo(() => {
    if (!decrypted) return '';

    return privateKeyToAddress(decrypted);
  }, [decrypted]);

  const handleDecrypt = async () => {
    setIsLoading(true);

    const response = await requestUserInteraction(
      'decrypt',
      Buffer.from(vote.recoveryEthPrivateKey, 'base64')
    );

    const { result } = JSON.parse(response);

    setDecrypted(Buffer.from(result, 'base64').toString());

    setIsLoading(false);
  };

  return (
    <div className="mt-4">
      {!decrypted && (
        <LoadingButton onClick={handleDecrypt} disabled={isLoading}>
          Descifrar
        </LoadingButton>
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
