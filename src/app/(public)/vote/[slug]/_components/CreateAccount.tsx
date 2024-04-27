'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { createAccount, requestEther } from '../_lib';
import { Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Account =
  | {
      isSet: false;
    }
  | {
      isSet: true;
      addr: string;
      sk: string;
      ticket: string;
    };

export default function CreateAccount() {
  const [account, setAccount] = useState<Account>({
    isSet: false,
  });

  const onSubmit = async () => {
    if (account.isSet) {
      return;
    }

    const pair = await createAccount();
    const ticket = await requestEther(pair.addr);

    setAccount({
      isSet: true,
      ...pair,
      ticket: Buffer.from(ticket.blind_msg).toString('hex'),
    });
  };

  return (
    <>
      {!account.isSet && <Button onClick={onSubmit}>Iniciar votación</Button>}
      {account.isSet && (
        <div className="w-[400px] space-y-2">
          <AddrViewer title="Address" value={account.addr} />
          <AddrViewer title="Secret" value={account.sk} />
          <AddrViewer title="Ticket" value={account.ticket} />
        </div>
      )}
    </>
  );
}

function AddrViewer({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex gap-2 items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="border rounded-md truncate py-2 px-4">
              <span>{title}: </span>
              0x{value}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p>0x{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        className="border rounded self-stretch flex items-center px-1 cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(`0x${value}`);
        }}
      >
        <Copy className="w-5" />
      </div>
    </div>
  );
}
