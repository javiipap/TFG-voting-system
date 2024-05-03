'use server';

import { execQuery, storeTicket } from '@/db/helpers';
import { verify } from 'blind_signatures_server';
import { Ticket } from '@/tfg-types';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendWei } from './sendWei';
import { calculateGas } from './calculateGas';

export async function submitRequest(formData: FormData) {
  const rawTicket = formData.get('ticket') as string;

  const { signature, ticket, padding } = JSON.parse(
    Buffer.from(rawTicket, 'base64').toString()
  ) as Ticket;

  const election = await execQuery((db) =>
    db.query.elections.findFirst({
      where: eq(schema.elections.id, ticket.electionId),
    })
  );

  if (!election) {
    // TODO
    console.log('a');
    return;
  }

  if (!election.contractAddr) {
    // TODO
    console.log('b');
    return;
  }

  // Comprobar firma
  try {
    const isOk = verify(
      election.publicKey,
      Buffer.from(signature, 'base64'),
      Buffer.from(padding, 'base64'),
      ticket.addr
    );

    if (!isOk) {
      throw 'Invalid signature';
    }
  } catch (error) {
    console.log(error);
    // TODO
    return;
  }

  // Guardar en bbdd
  try {
    await storeTicket({ addr: ticket.addr, electionId: ticket.electionId });
  } catch (error) {
    console.log(error);
    // TODO
    return;
  }

  const candidates = await execQuery((db) =>
    db
      .select()
      .from(schema.elections)
      .innerJoin(
        schema.candidates,
        eq(schema.elections.id, schema.candidates.electionId)
      )
  );

  // Calcular gas
  const wei = await calculateGas(
    Buffer.from(election.masterPublicKey!, 'base64'),
    candidates.length,
    election.contractAddr,
    ticket.addr
  );
  // Mandar ether
  await sendWei(ticket.addr, wei);

  return;
}
