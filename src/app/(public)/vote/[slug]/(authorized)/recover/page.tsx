import CopyButton from '@/app/(public)/vote/[slug]/(authorized)/recover/copy-btn';
import { Button } from '@/components/ui/button';
import { getElectionBySlug } from '@/data-access/election';
import { getEncryptedAddr } from '@/data-access/user';
import { getSessionSSR } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ({ params }: { params: { slug: string } }) {
  const session = await getSessionSSR();

  const election = await getElectionBySlug(params.slug);

  if (!election) {
    redirect('/');
  }

  const encryptedAddr = await getEncryptedAddr(session.userId, election.id);

  if (!encryptedAddr) {
    redirect(`/vote/${params.slug}/previous`);
  }

  return (
    <main className="flex justify-center">
      <div className="max-w-[600px]">
        <p>
          A continuación se muestra su clave privada eth cifrada usando su
          certificado digital. Para recuperarla puede utilizar el siguiente
          comando de openssl:{' '}
        </p>
        <div className="flex items-center space-x-1">
          <div className="mt-2 bg-foreground/5 rounded px-1 border font-mono whitespace-nowrap text-ellipsis overflow-hidden">
            echo &#60; cipher &#62; | base64 -d | openssl rsautl -decrypt -out
            private_key -inkey privkey.pem
          </div>
          <CopyButton
            text={`echo ${encryptedAddr} | base64 -d | openssl rsautl -decrypt -out private_key -inkey privkey.pem`}
          />
        </div>
        <div className="font-mono border rounded-sm break-all p-2 mt-4">
          {encryptedAddr}
        </div>
        <p className="mt-2">
          Una vez recuperada puede eliminar el voto y reiniciar el proceso de
          votación.
        </p>
        <Link href={`/vote/${params.slug}/delete`}>
          <Button className="mt-2 float-right">Eliminar voto</Button>
        </Link>
      </div>
    </main>
  );
}
