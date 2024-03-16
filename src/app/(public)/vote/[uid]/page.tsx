import { Button } from '@/components/ui/button';
import { Vote } from 'lucide-react';

export default function VotePage({ params }: { params: { uid: string } }) {
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div className="max-w-[600px] text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          Elecciones municipales
        </h1>
        <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel iure eius
          inventore saepe quaerat unde asperiores, distinctio, perspiciatis quae
          error nihil quasi, enim laboriosam? Autem alias iste magnam
          consequatur ullam.
        </p>
        <Button className="px-8">
          <Vote className="mr-2" />
          Vota
        </Button>
      </div>
    </main>
  );
}
