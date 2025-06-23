'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { createAccount } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib';
import { requestTicket } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib/request-ticket';
import { AddrViewer } from '@/components/addr-viewer';
import { Context } from '@/app/(public)/vote/[slug]/context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { DownloadButton } from '@/components/download-button';
import { User } from 'next-auth';
import { requestEther } from '@/lib/utils/request-ether';

type Account =
  | {
      isSet: false;
    }
  | {
      isSet: true;
      addr: string;
      sk: string;
      ticket: {
        ticket: { addr: string; electionId: number; iat: number };
        signature: string;
      };
      encryptedEthPrivateKey: string;
      error: undefined;
    }
  | {
      isSet: true;
      error: string;
      alreadyVoted?: boolean;
    };

export default function PreviousStepsPage() {
  const hasRan = useRef(false);
  const { toast } = useToast();
  const pathname = usePathname();
  const { electionId, user } = useContext(Context) as Context;

  const [state, setState] = useState<Account>({
    isSet: false,
  });

  const generateCredentials = async () => {
    if (state.isSet || hasRan.current) {
      return;
    }

    hasRan.current = true;

    const account = await createAccount();
    const ticket = await requestTicket(
      account.sk,
      account.addr,
      electionId,
      (user as User).userId,
      (user as User).pk
    );

    console.log('requesting ether');
    await requestEther(account.addr, electionId);

    setState({ isSet: true, error: undefined, ticket, ...account });
  };

  useEffect(() => {
    generateCredentials().catch((err) => {
      if (err instanceof Error) {
        if (err.message === 'already-voted') {
          setState({ isSet: true, error: err.message, alreadyVoted: true });
        } else {
          setState({ isSet: true, error: err.message });
        }
      } else {
        setState({
          isSet: true,
          error: 'Unexpected error, try again later' + err,
        });
      }
    });
    // @ts-ignore Empty dependency array
  }, []);

  return (
    <main className="flex justify-center">
      {!state.isSet && <p>Cargando...</p>}

      {state.isSet && typeof state.error === 'undefined' && (
        <>
          <div className="w-[95%] mx-auto md:w-[400px] space-y-2">
            <AddrViewer title="Address" value={state.addr} />
            <AddrViewer title="Secret" value={state.sk} secret />
            <div className="flex justify-center">
              <DownloadButton
                name="ticket.json"
                data={JSON.stringify({ ...state.ticket, privateKey: state.sk })}
              />
              <Link href={`${pathname.replace('previous', 'select')}`}>
                <Button variant="secondary" className="ml-2">
                  Continuar
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {state.isSet && state.error && state.alreadyVoted && (
        <div className="flex flex-col space-y-2 items-center">
          <p>Parece que ya has iniciado el proceso de voto</p>
          <Link href={pathname.replace('previous', 'recover')}>
            <Button>Recuperar credenciales</Button>
          </Link>
        </div>
      )}

      {state.isSet && state.error && !state.alreadyVoted && (
        <div className="bg-red-800 p-4 rounded-sm">
          <p>Error: {state.error}</p>
        </div>
      )}
    </main>
  );
}
