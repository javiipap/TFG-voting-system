'use client';

import { useContext, useEffect, useState } from 'react';
import { createAccount } from '../_lib';
import { requestEther } from '../_lib/requestEther';
import { Textarea } from '@/components/ui/textarea';
import { AddrViewer } from '../_components/AddrViewer';
import { Context } from '../context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

type Account =
  | {
      isSet: false;
    }
  | {
      isSet: true;
      addr: string;
      sk: string;
      ticket?: string;
    };

export default function PreviousStepsPage() {
  const pathname = usePathname();
  const { electionId } = useContext(Context) as Context;

  const [account, setAccount] = useState<Account>({
    isSet: false,
  });

  useEffect(() => {
    if (account.isSet) {
      return;
    }

    const pair = createAccount();
    requestEther(pair.addr, electionId)
      .then((ticket) => setAccount((acc) => ({ ...acc, ticket })))
      .catch((err) => {
        // TODO
      });

    setAccount((acc) => ({
      ...acc,
      isSet: true,
      ...pair,
    }));

    return () => {};
  }, []);

  return (
    <main className="flex justify-center">
      {account.isSet && (
        <div className="w-[400px] space-y-2">
          <AddrViewer title="Address" value={account.addr} />
          <AddrViewer title="Secret" value={account.sk} />
          <Textarea defaultValue={account.ticket} readOnly />
          <div className="">
            <Link href={`${pathname.replace('previous', 'select')}`}>
              <Button>Continue</Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
