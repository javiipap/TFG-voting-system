'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { createAccount } from '../_lib';
import { Copy } from 'lucide-react';

type Account =
  | {
      isSet: false;
    }
  | {
      isSet: true;
      addr: string;
      sk: string;
    };

export default function CreateAccount() {
  const [account, setAccount] = useState<Account>({
    isSet: false,
  });

  const onSubmit = async () => {
    if (!account.isSet) {
      setAccount({
        isSet: true,
        ...(await createAccount()),
      });
    }
  };

  return (
    <>
      {!account.isSet && <Button onClick={onSubmit}>Iniciar votación</Button>}
      {account.isSet && (
        <div className="w-[400px] space-y-2">
          <div className="flex gap-2 items-center">
            <p className="border rounded-md truncate py-2 px-4">
              <span>Address: </span>
              0x{account.addr}
            </p>
            <div
              className="border rounded self-stretch flex items-center px-1 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(`0x${account.addr}`);
              }}
            >
              <Copy className="w-5" />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <p className="border rounded-md truncate py-2 px-4">
              <span>Secret: </span>
              0x{account.sk}
            </p>
            <div
              className="border rounded self-stretch flex items-center px-1 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(`0x${account.sk}`);
              }}
            >
              <Copy className="w-5" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
