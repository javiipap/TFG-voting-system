'use client';

import { Input } from '@/components/ui/input';
import { ChangeEvent, useContext, useState } from 'react';
import { submitVote } from '@/app/(public)/vote/[slug]/(authorized)/select/_lib/submit-vote';
import { Context } from '@/app/(public)/vote/[slug]/context';
import init, { encrypt_vote } from 'client_utilities';
import SelectCandidate from '@/app/(public)/vote/[slug]/(authorized)/select/_components/select-candidate';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { AddrViewer } from '@/components/addr-viewer';
import { Ticket } from '@/tfg-types';

export default function SelectVotePage() {
  const { toast } = useToast();
  const { masterPublicKey, contractAddr, candidates } = useContext(
    Context
  ) as Context;

  const [ticket, setTicket] = useState<
    (Ticket & { privateKey: string }) | null
  >(null);

  const onUploadTicket = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length < 1) return;
    const rawTicket = await e.target.files[0].text();

    try {
      const decoded = JSON.parse(rawTicket);
      setTicket(decoded);
    } catch {
      e.target.files = null;
      // TODO: mostrar error
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [blockInfo, setBlockInfo] =
    useState<Awaited<ReturnType<typeof submitVote>>>();

  const onSubmit = async (selected: number) => {
    if (!ticket) {
      toast({ title: 'Debes adjuntar tu tique para poder votar' });
      return;
    }

    setIsLoading(true);

    await init();
    const ballot = encrypt_vote(
      Buffer.from(masterPublicKey, 'base64') as unknown as Uint8Array,
      selected,
      candidates.length
    );

    try {
      const response = await submitVote(
        Buffer.from(ballot),
        contractAddr,
        ticket.ticket.addr,
        ticket.privateKey,
        ticket.ticket.iat,
        Buffer.from(ticket.signature, 'base64')
      );
      setBlockInfo(response);
    } catch (err) {
      console.log(err);

      toast({
        title: 'Ha habido un error inesperado, ¿Ya has canjeado tu ticket?',
      });
    }
    setIsLoading(false);
  };

  return (
    <main className="flex justify-center">
      <div className="w-[95%] mx-auto md:max-w-[800px]">
        {!!ticket && (
          <>
            <div className="mb-2 space-y-1">
              <Label>Dirección eth</Label>
              <AddrViewer title="Addr" value={ticket.ticket.addr} />
            </div>
            <div className="space-y-1">
              <Label>Clave privada</Label>
              <AddrViewer title="Private" value={ticket.privateKey} />
            </div>
          </>
        )}
        {!ticket && (
          <div className="space-y-1">
            <Label>Adjunta tu tique para poder votar</Label>
            <Input type="file" onChange={onUploadTicket} />
          </div>
        )}
        {!!blockInfo?.blockHash ? (
          <div className="bg-blue-500/60 my-4 rounded-md p-4">
            <h2 className="text-2xl text-center">
              Información de la transacción
            </h2>
            <Separator className="my-2 bg-foreground/20" />
            <div className="">
              <p className="font-bold">
                Hash del bloque:{' '}
                <span className="font-mono font-medium">
                  {blockInfo.blockHash}
                </span>
              </p>
            </div>
            <div className="">
              <p className="font-bold">
                Número de bloque:{' '}
                <span className="font-mono font-medium">
                  {blockInfo.blockNumber.toString()}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="my-4 flex items-center justify-center gap-2">
              <div className="flex flex-1">
                <Separator className="my-4 static" />
              </div>
              <h2 className="text-center text-2xl font-bold">Candidatos</h2>
              <div className="flex flex-1">
                <Separator className="my-4" />
              </div>
            </div>
            <SelectCandidate
              onChange={onSubmit}
              candidates={candidates}
              submitDisabled={!ticket || isLoading}
            />
          </>
        )}
      </div>
    </main>
  );
}
