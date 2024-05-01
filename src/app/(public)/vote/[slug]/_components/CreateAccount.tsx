'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { createAccount } from '../_lib';
import { requestEther } from '../_lib/requestEther';
import { Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

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

export default function CreateAccount({ electionId }: { electionId: number }) {
  const [account, setAccount] = useState<Account>({
    isSet: false,
  });

  const onSubmit = async () => {
    if (account.isSet) {
      return;
    }

    const pair = await createAccount();
    const ticket = await requestEther(pair.addr, electionId);

    setAccount({
      isSet: true,
      ticket,
      ...pair,
    });
  };

  return (
    <>
      {!account.isSet && <Button onClick={onSubmit}>Pasos previos</Button>}
      {account.isSet && (
        <div className="w-[400px] space-y-2">
          <AddrViewer title="Address" value={account.addr} />
          <AddrViewer title="Secret" value={account.sk} />
          <Textarea defaultValue={account.ticket} readOnly />
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
