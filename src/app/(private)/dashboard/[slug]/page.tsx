import { redirect } from 'next/navigation';

export default function Dashboard({ params }: { params: { slug: string } }) {
  return redirect('/dashboard/' + params.slug + '/voters');
}
