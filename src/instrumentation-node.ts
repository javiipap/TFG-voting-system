import { synchronizeAdminAccounts } from '@/lib/ethereum/synchronize-admin-accounts';
import { init } from '@/lib/scheduler';

synchronizeAdminAccounts();

init();
