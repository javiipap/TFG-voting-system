import { generateElgamalKeypair, generateRsaKeypair } from 'server_utilities';
import { getAdminId } from '@/data-access/admins';
import { createElection, getElectionBySlug } from '@/data-access/elections';
import { execQuery } from '@/db/helpers';
import { deployContract } from '@/lib/ethereum/deploy-contract';
import { getRandomElement } from '@/lib/utils';
import { addCandidate } from '@/data-access/candidates';

export async function POST() {
  const electionNames = [
    [
      'admiring',
      'stoic',
      'jolly',
      'quirky',
      'wizardly',
      'serene',
      'frosty',
      'zealous',
      'vibrant',
      'dazzling',
    ],
    [
      'hopper',
      'turing',
      'lumiere',
      'bohr',
      'morse',
      'pike',
      'kilby',
      'wozniak',
      'meitner',
      'knuth',
    ],
  ];

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

  const users = await execQuery((db) => db.query.users.findMany());

  if (users.length === 0) {
    throw new Error('No users were found');
  }

  const adminId = await getAdminId(getRandomElement(users).email);

  if (typeof adminId === 'undefined') {
    throw new Error('Admin user not found');
  }

  const electionSlug = `${getRandomElement(
    electionNames[0]
  )}_${getRandomElement(electionNames[1])}`;

  const rsaKeypair = generateRsaKeypair();
  const elgamalKeyPair = generateElgamalKeypair();

  await createElection({
    adminId,
    name: electionSlug.replace('_', ' '),
    slug: electionSlug,
    description: 'Lorem ipsum...',
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    privateKey: rsaKeypair.private.toString('base64'),
    publicKey: rsaKeypair.public.toString('base64'),
    masterPublicKey: elgamalKeyPair.public.toString('base64'),
  });

  const election = await getElectionBySlug(electionSlug);

  if (!election) {
    throw new Error('Could not retrieve created election');
  }

  const candidates = new Array(5)
    .fill('')
    .map(() => `${getRandomElement(names)} ${getRandomElement(surnames)}`);

  for (const candidate of candidates) {
    await addCandidate({ name: candidate, electionId: election.id });
  }

  const contractAddr = await deployContract(
    candidates,
    `election_${election.id}`,
    elgamalKeyPair.public,
    rsaKeypair.public
  );

  return Response.json({
    ...election,
    candidates,
    contractAddr,
    elgamalPrivate: elgamalKeyPair.private.toString('base64'),
  });
}
