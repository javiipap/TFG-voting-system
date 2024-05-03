import { submitRequest } from './_actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function Faucet() {
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <form action={submitRequest} className="space-y-4 w-[400px]">
        <div className="">
          <h1 className="text-3xl font-bold">Introduce tu ticket</h1>
          <Separator />
          <span className="text-sm">
            Se cargará tu cuenta con el suficiente ether para votar en la
            elección designada
          </span>
        </div>
        <Textarea name="ticket" placeholder="Ticket" />
        <Button type="submit" className="float-right">
          Solicitar
        </Button>
      </form>
    </main>
  );
}
