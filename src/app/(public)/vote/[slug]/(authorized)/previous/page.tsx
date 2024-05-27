'use client';

import { useContext, useEffect, useState } from 'react';
import { createAccount } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib';
import { requestEther } from '@/app/(public)/vote/[slug]/(authorized)/previous/_lib/request-ether';
import { AddrViewer } from '@/app/(public)/vote/[slug]/(authorized)/previous/_components/addr-viewer';
import { Context } from '@/app/(public)/vote/[slug]/context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { DownloadButton } from '@/components/download-button';
import { QRCodeSVG } from 'qrcode.react';
import { User } from 'next-auth';

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
      error: undefined;
    }
  | {
      isSet: true;
      error: string;
      alreadyVoted?: boolean;
    };

let hasRan = false;

export default function PreviousStepsPage() {
  const { toast } = useToast();
  const pathname = usePathname();
  const { electionId, user } = useContext(Context) as Context;

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
      electionId,
      (user as User).pk
    );

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
        setState({ isSet: true, error: 'Unexpected error, try again later' });
      }
    });
  }, []);

  return (
    <main className="flex justify-center">
      {!state.isSet && <p>Cargando...</p>}

      {state.isSet && typeof state.error === 'undefined' && (
        <>
          <div className="w-[95%] mx-auto md:w-[400px] space-y-2">
            <AddrViewer title="Address" value={state.addr} />
            <AddrViewer title="Secret" value={state.sk} />
            <div className="flex justify-center">
              <QRCodeSVG
                size={240}
                level="L"
                value={`https://e3vote.iaas.ull.es/faucet?ticket=${encodeURIComponent(
                  state.ticket
                )}`}
              />
            </div>
            <div className="bg-foreground/5 py-2 px-4 rounded border text-sm tracking-wide text-justify">
              Escanea el QR para transferir el suficiente ether a tu cuenta y
              así poder votar. También lo puedes hacer manualmente desde este
              ordenador accediendo al{' '}
              <Link
                className="underline"
                target="_blank"
                href={`/faucet?ticket=${encodeURIComponent(state.ticket)}`}
              >
                faucet
              </Link>
              , o usando el ticket que puedes descargar abajo.
            </div>
            <div className="flex justify-center">
              <DownloadButton
                name="key-pair.json"
                data={JSON.stringify({
                  address: state.addr,
                  secretKey: state.sk,
                  ticket: state.ticket,
                })}
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
