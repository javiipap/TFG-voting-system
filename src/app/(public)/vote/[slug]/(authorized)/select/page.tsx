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

export default function SelectVotePage() {
  const { toast } = useToast();
  const { masterPublicKey, contractAddr, candidates } = useContext(
    Context
  ) as Context;

  const [inputState, setInputState] = useState({ addr: '', secret: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [blockInfo, setBlockInfo] =
    useState<Awaited<ReturnType<typeof submitVote>>>();

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInputState((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (selected: number) => {
    if (!inputState.addr || !inputState.secret) {
      toast({ title: 'Debes introducir tu dirección y clave privada' });
      return;
    }

    setIsLoading(true);

    await init();
    const ballot = encrypt_vote(
      Buffer.from(masterPublicKey, 'base64'),
      selected,
      candidates.length
    );

    try {
      const response = await submitVote(
        ballot,
        contractAddr,
        inputState.addr,
        inputState.secret
      );
      setBlockInfo(response);
    } catch (err) {
      toast({
        title: 'Ha habido un error inesperado, ¿Ya has canjeado tu ticket?',
      });
    }
    setIsLoading(false);
  };

  return (
    <main className="flex justify-center">
      <div className="w-[800px]">
        <div className="mb-2 space-y-1">
          <Label>Dirección eth</Label>
          <Input name="addr" value={inputState.addr} onChange={onChange} />
        </div>
        <div className="space-y-1">
          <Label>Clave secreta</Label>
          <Input
            name="secret"
            value={inputState.secret}
            onChange={onChange}
            autoComplete="off"
          />
        </div>
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
              <div className="flex relative flex-1">
                <Separator className="my-4" />
              </div>
              <h2 className="text-center text-2xl font-bold">Candidatos</h2>
              <div className="flex relative flex-1">
                <Separator className="my-4" />
              </div>
            </div>
            <SelectCandidate
              onChange={onSubmit}
              candidates={candidates}
              submitDisabled={
                !(inputState.addr && inputState.secret) || isLoading
              }
            />
          </>
        )}
      </div>
    </main>
  );
}
