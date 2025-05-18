import { getAccount } from '@/data-access/accounts';
import { executeAdminTransaction } from '@/lib/ethereum/execute-admin-transaction';

export async function sendWei(clientAddr: string, wei: bigint) {
  const account = await getAccount();

  if (!account) {
    throw new Error("Couldn't retrieve admin ETH account");
  }

  await executeAdminTransaction(
    {
      from: account.addr,
      to: clientAddr,
      value: wei,
      nonce: account.nonce,
    },
    account.privateKey
  );
}
