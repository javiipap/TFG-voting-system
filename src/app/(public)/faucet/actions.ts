'use server';

import { storeTicket } from '@/data-access/elections';
import { verify } from 'server_utilities';
import { Ticket } from '@/tfg-types';
import { sendWei } from '@/lib/ethereum/send-wei';
import { calculateGas } from '@/lib/ethereum/calculate-gas';
import { grantPermissions } from '@/lib/ethereum/grant-permissions';
import { ActionError, unauthenticatedAction } from '@/lib/safe-action';
import { schema as requestSchema } from '@/app/(public)/faucet/validation';
import { getElection, getCandidates } from '@/data-access/elections';

export const requestPermissionAction = unauthenticatedAction(
  requestSchema,
  async ({ ticket: rawTicket }) => {
    const { signature, ticket, padding } = JSON.parse(
      Buffer.from(rawTicket, 'base64').toString()
    ) as Ticket;

    const election = await getElection(ticket.electionId);

    if (!election) {
      throw new ActionError('Election not found');
    }

    if (!election.contractAddr) {
      throw new ActionError("Election hasn't started yet");
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
      throw new ActionError("Couldn't verify tickets signature");
    }

    // Guardar en bbdd
    await storeTicket({ addr: ticket.addr, electionId: ticket.electionId });

    const candidates = await getCandidates(ticket.electionId);

    // Añadir dirección a la lista granted
    await grantPermissions(ticket.addr, election.contractAddr);
    // Calcular gas
    const wei = await calculateGas(
      Buffer.from(election.masterPublicKey!, 'base64'),
      candidates.length,
      election.contractAddr,
      ticket.addr
    );
    // Mandar ether
    await sendWei(ticket.addr, wei);
  }
);
