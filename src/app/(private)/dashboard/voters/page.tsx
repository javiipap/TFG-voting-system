import Button from '@/components/Button';
import Table, { Row, TBody, THead, Td, Th } from '@/components/Table';
import Title from '../components/Title';

const voters = [
  {
    name: 'Juan Pérez',
    pkey: '8f0a1c19f6a1c2f3d5b7a9e0c1a3d5f7b9d8e9f0a1c2d3e4f5b6d7e8f9a0c1d',
    hasVoted: false,
  },
  {
    name: 'María García',
    pkey: '6b3d8e297c4b0d1e2f3a5b6c7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p',
    hasVoted: true,
  },
  {
    name: 'Luis Rodríguez',
    pkey: '4eab7f98d7e33a27b6d5f8a9c7b4d5f8a9c7b4d5f8a9c7b4d5f8a9c7b4d5f8a',
    hasVoted: true,
  },
  {
    name: 'Ana Martínez',
    pkey: '3c2e5dabcc341f76e8d9f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t',
    hasVoted: false,
  },
  {
    name: 'Carlos López',
    pkey: '9d86b40b5a1d8e7c6b5a4d3c2b1a9e8d7f6g5h4i3j2k1l0m9n8o7p6q5r4s3t',
    hasVoted: true,
  },
  {
    name: 'Sofía Fernández',
    pkey: '2f9e8a5d432b1cfd6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a',
    hasVoted: false,
  },
  {
    name: 'Javier González',
    pkey: '7c6e5b8a97d4c3b2a1d8e7f6g5h4i3j2k1l0m9n8o7p6q5r4s3t2u1v0w9x8y7z',
    hasVoted: false,
  },
  {
    name: 'Laura Díaz',
    pkey: '1d0e2f3a4c5b6d7e8f9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v',
    hasVoted: false,
  },
  {
    name: 'Pablo Ruiz',
    pkey: '5a6b7c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y',
    hasVoted: false,
  },
  {
    name: 'Elena Sánchez',
    pkey: '0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d',
    hasVoted: false,
  },
  {
    name: 'Manuel Romero',
    pkey: '9e8f7d6c5b4a3c2d1e0f9g8h7i6j5k4l3m2n1o0p9q8r7s6t5u4v3w2x1y0z',
    hasVoted: false,
  },
  {
    name: 'Carmen Torres',
    pkey: '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c',
    hasVoted: false,
  },
  {
    name: 'Francisco Pérez',
    pkey: '2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d',
    hasVoted: false,
  },
  {
    name: 'Isabel Gómez',
    pkey: '3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e',
    hasVoted: false,
  },
  {
    name: 'Antonio Martínez',
    pkey: '4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f',
    hasVoted: false,
  },
  {
    name: 'Marta Jiménez',
    pkey: '5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g',
    hasVoted: false,
  },
  {
    name: 'David Ruiz',
    pkey: '6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h',
    hasVoted: false,
  },
  {
    name: 'Eva Alonso',
    pkey: '7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i',
    hasVoted: false,
  },
  {
    name: 'Pedro Gutiérrez',
    pkey: '8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j',
    hasVoted: false,
  },
  {
    name: 'Cristina Ortiz',
    pkey: '9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k',
    hasVoted: false,
  },
  {
    name: 'José Ruiz',
    pkey: '0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l',
    hasVoted: false,
  },
  {
    name: 'Adriana Herrera',
    pkey: '1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m',
    hasVoted: false,
  },
  {
    name: 'Rafael Castro',
    pkey: '2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n',
    hasVoted: false,
  },
  {
    name: 'Natalia Soto',
    pkey: '3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o',
    hasVoted: false,
  },
  {
    name: 'Joaquín Vargas',
    pkey: '4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p',
    hasVoted: false,
  },
  {
    name: 'Lucía Moreno',
    pkey: '5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q',
    hasVoted: false,
  },
  {
    name: 'Gabriel Gómez',
    pkey: '6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r',
    hasVoted: false,
  },
  {
    name: 'Celia Rubio',
    pkey: '7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s',
    hasVoted: false,
  },
  {
    name: 'Fernando Iglesias',
    pkey: '8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t',
    hasVoted: false,
  },
  {
    name: 'Mónica Torres',
    pkey: '9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u',
    hasVoted: false,
  },
  {
    name: 'Alberto Díaz',
    pkey: '0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v',
    hasVoted: false,
  },
  {
    name: 'Elena Rivas',
    pkey: '1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w',
    hasVoted: false,
  },
  {
    name: 'Roberto Ramos',
    pkey: '2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x',
    hasVoted: false,
  },
  {
    name: 'Marina Delgado',
    pkey: '3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y',
    hasVoted: false,
  },
  {
    name: 'Jorge Molina',
    pkey: '4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z',
    hasVoted: false,
  },
  {
    name: 'Alicia Ortega',
    pkey: '5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a',
    hasVoted: false,
  },
  {
    name: 'Diego García',
    pkey: '6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b',
    hasVoted: false,
  },
  {
    name: 'Sara Cruz',
    pkey: '7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c',
    hasVoted: false,
  },
  {
    name: 'Víctor Medina',
    pkey: '8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d',
    hasVoted: false,
  },
  {
    name: 'Patricia Sánchez',
    pkey: '9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e',
    hasVoted: false,
  },
];

export default function Voters() {
  return (
    <>
      <Title component={<Button>Add voter</Button>}>Voters</Title>
      <div className="border shadow-sm rounded-lg dark:border-neutral-800 dark:bg-black">
        <Table className="w-full table-auto caption-bottom text-sm">
          <THead>
            <Row>
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Public Key</Th>
              <Th>Status</Th>
              <Th>Delete</Th>
            </Row>
          </THead>
          <TBody>
            {voters.map((voter, index) => (
              <Row key={`voter-${index}`}>
                <Td>{index + 1}</Td>
                <Td>{voter.name}</Td>
                <Td>{voter.pkey}</Td>
                <Td>{voter.hasVoted ? '✅' : '❌'}</Td>
                <Td>
                  <button className="hover:underline text-red-700">
                    Delete
                  </button>
                </Td>
              </Row>
            ))}
          </TBody>
        </Table>
      </div>
    </>
  );
}
