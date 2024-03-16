import { getCandidates } from '@/db/helpers';
import Title from '../../components/Title';

export default async function Page({ params }: { params: { slug: string } }) {
  const candidates = await getCandidates(params.slug);

  return (
    <main>
      <Title>Candidates</Title>
      <div className="">
        {candidates.map((candidate) => (
          <div key={candidate.candidates.id} className="">
            <div className="">{candidate.candidates.name}</div>
            <div className="">{candidate.candidates.description}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
