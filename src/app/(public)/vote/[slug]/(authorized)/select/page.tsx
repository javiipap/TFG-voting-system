'use client';

import { Input } from '@/components/ui/input';
import { ChangeEvent, useContext, useState } from 'react';
import { submitVote } from '@/app/(public)/vote/[slug]/(authorized)/select/_lib/submit-vote';
import { Context } from '@/app/(public)/vote/[slug]/context';
import init, { encrypt_vote } from 'client_utilities';
import SelectCandidate from '@/app/(public)/vote/[slug]/(authorized)/select/_components/select-candidate';

export default function SelectVotePage() {
  const { masterPublicKey, contractAddr, candidates } = useContext(
    Context
  ) as Context;

  const [inputState, setInputState] = useState({ addr: '', secret: '' });
  const [blockInfo, setBlockInfo] =
    useState<Awaited<ReturnType<typeof submitVote>>>();

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInputState((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (selected: number) => {
    if (!inputState.addr || !inputState.secret) {
      // TODO
      return;
    }

    await init();
    const ballot = encrypt_vote(
      Buffer.from(masterPublicKey, 'base64'),
      selected,
      candidates.length
    );

    const response = await submitVote(
      ballot,
      contractAddr,
      inputState.addr,
      inputState.secret
    );

    setBlockInfo(response);
  };

  return (
    <main className="flex justify-center">
      <div className="w-[800px]">
        <Input name="addr" value={inputState.addr} onChange={onChange} />
        <Input name="secret" value={inputState.secret} onChange={onChange} />
        {!!blockInfo?.blockHash && (
          <div>
            <span>{blockInfo.blockHash}</span>
            <span>{blockInfo.blockNumber.toString()}</span>
          </div>
        )}
        <SelectCandidate onChange={onSubmit} candidates={candidates} />
      </div>
    </main>
  );
}
