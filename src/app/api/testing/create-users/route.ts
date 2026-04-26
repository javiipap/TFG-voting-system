import { addUser, getUserByCertOrEmail } from '@/data-access/users';
import { promoteUser } from '@/data-access/admins';
import { getRandomElement } from '@/lib/utils';

export async function POST() {
  const names = [
    'Lucía',
    'Javier',
    'Valentina',
    'Diego',
    'Camila',
    'Andrés',
    'Sofía',
    'Gabriel',
    'Isabella',
    'Mateo',
  ];

  const surnames = [
    'Mendoza',
    'Rojas',
    'Soto',
    'Herrera',
    'Navarro',
    'Guzmán',
    'Paredes',
    'Morales',
    'Castro',
    'Delgado',
  ];

  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com'];

  const name = `${getRandomElement(names)} ${getRandomElement(surnames)}`;

  const email = `${name.replace(' ', '.').toLowerCase()}@${getRandomElement(
    domains
  )}`;

  await addUser({
    name,
    email,
    emailVerified: new Date(),
    cert: `${email}-<testing>`,
    publicKey: `${email}-<testing>`,
  });

  const user = await getUserByCertOrEmail(`${email}-<testing>`, email);

  if (!user) {
    throw new Error('User not found after creation.');
  }

  await promoteUser(user.id);

  return Response.json(user);
}
