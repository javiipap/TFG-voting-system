'use server';

import { createBallot, getAdmin } from '@/db/helpers';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

interface State {
  error: string | null;
  election: {
    name: string;
    slug: string;
  };
}

const createSlug = (name: string) => {
  return name.toLowerCase().replace(/ /g, '-');
};

export const submitElection = async (prevState: State, formData: FormData) => {
  const session = await auth();

  if (!session) {
    return {
      error: 'Authorization error, no session found.',
      election: {
        name: '',
        slug: '',
      },
    };
  }

  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const authMethod = formData.get('auth') as string;
    const timespan = formData.get('timespan') as string;
    const start = parseInt(formData.get('start') as string);
    const end = parseInt(formData.get('end') as string);

    const { from, to } = JSON.parse(timespan);

    const startDate = new Date(from);
    const endDate = new Date(to);
    startDate.setHours(start);
    endDate.setHours(end);

    const admin = await getAdmin(session.user.email!);

    const election = await createBallot({
      name,
      slug: createSlug(name),
      description,
      startDate,
      endDate,
      adminId: admin[0].admins.id,
    });

    revalidatePath('/dashboard');
    return {
      error: '',
      election: {
        name,
        slug: election[0].slug,
      },
    };
  } catch (error: any) {
    return {
      error: error.message,
      election: {
        name: '',
        slug: '',
      },
    };
  }
};
