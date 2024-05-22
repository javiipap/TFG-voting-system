'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent, useState } from 'react';
import wasm_init, { rsa_decrypt } from 'client_utilities';

export default function RecoverForm({ vote }: { vote: any }) {
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
      ).toString('hex')
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
          <div className="border rounded-md p-2">0x{decrypted}</div>
        </div>
      )}
    </div>
  );
}
