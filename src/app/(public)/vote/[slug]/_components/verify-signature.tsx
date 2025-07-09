'use client';

import LoadingButton from '@/components/loading-button';
import { requestUserInteraction } from '@/lib/yotefirmo';

export interface Props {
  signature: string;
  data: number[];
  pk: string;
  cert: string;
}

export default function VerifySignature({ signature, data, pk, cert }: Props) {
  const onClick = async () => {
    const payload = Buffer.from(
      JSON.stringify(
        {
          signature: Buffer.from(signature, 'base64').toJSON().data,
          data,
          public_key: Buffer.from(pk, 'base64').toJSON().data,
          certificate: Buffer.from(cert, 'base64').toJSON().data,
        },
        null,
        0
      )
    );

    const response = await requestUserInteraction('verify', payload);
    console.log(response);
  };

  return <LoadingButton onClick={onClick}>Verificar</LoadingButton>;
}
