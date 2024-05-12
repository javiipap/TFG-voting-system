'use client';

import { useContext, useEffect, useState } from 'react';
import { createAccount } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib';
import { requestEther } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib/request-ether';
import { Textarea } from '@/components/ui/textarea';
import { AddrViewer } from '@/app/(public)/vote/[slug]/(authorized)/previous/_components/addr-viewer';
import { Context } from '@/app/(public)/vote/[slug]/context';
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
      ticket: string;
      encryptedEthSecret: string;
    };

let hasRan = false;

export default function PreviousStepsPage() {
  const pathname = usePathname();
  const { electionId } = useContext(Context) as Context;

  const [state, setState] = useState<Account>({
    isSet: false,
  });

  const generateCredentials = async () => {
    if (state.isSet || hasRan) {
      return;
    }

    hasRan = true;

    const account = await createAccount();
    const ticket = await requestEther(
      account.sk,
      account.encryptedEthSecret,
      account.addr,
      electionId
    );

    setState({ isSet: true, ticket, ...account });
  };

  useEffect(() => {
    generateCredentials();
  }, []);

  return (
    <main className="flex justify-center">
      {state.isSet ? (
        <div className="w-[400px] space-y-2">
          <AddrViewer title="Address" value={state.addr} />
          <AddrViewer title="Secret" value={state.sk} />
          <Textarea defaultValue={state.ticket} readOnly />
          <div className="">
            <Link href={`${pathname.replace('previous', 'select')}`}>
              <Button>Continue</Button>
            </Link>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}
