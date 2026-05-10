import { synchronizeAdminAccounts } from '@/lib/ethereum/synchronize-admin-accounts';

export async function POST() {
  await synchronizeAdminAccounts();
  return Response.json({ ok: true });
}
