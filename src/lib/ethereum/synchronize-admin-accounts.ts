import { getAccounts, updateAccountNonce } from '@/data-access/accounts';
import { getEthNode } from '@/lib/ethereum/get-eth-node';
import { Web3 } from 'web3';

export async function synchronizeAdminAccounts() {
  const accounts = await getAccounts();

  const web3 = new Web3(getEthNode());

  await Promise.all(
    accounts.map(async ({ addr, nonce }) => {
      const pendingTransactions = await web3.eth.getTransactionCount(
        addr,
        'pending'
      );

      await updateAccountNonce(addr, pendingTransactions).catch((err) => {
        console.error(`[SYNC]: ERROR ${addr} - ${err}`);
      });

      console.log(
        `[SYNC]: INFO synchronized ${addr} with nonce ${pendingTransactions}`
      );
    })
  );
}
