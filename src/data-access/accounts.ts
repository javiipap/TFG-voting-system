import { execQuery } from '@/db/helpers';
import { accounts, Account } from '@/db/schema';
import { Mutex } from 'async-mutex';
import { eq, sql } from 'drizzle-orm';

const mutex = new Mutex();

export const getAccount = (
  random: boolean = true
): Promise<Account | undefined> =>
  mutex.runExclusive(async () => {
    if (random) {
      const retrievedAccounts = await execQuery((db) =>
        db.query.accounts.findMany()
      );

      const idx =
        Math.floor(Math.random() * (retrievedAccounts.length - 1)) + 1;

      const result = await execQuery((db) =>
        db
          .update(accounts)
          .set({ nonce: sql`nonce + 1` })
          .where(eq(accounts.id, retrievedAccounts[idx].id))
          .returning({
            addr: accounts.addr,
            privateKey: accounts.privateKey,
            nonce: accounts.nonce,
            id: accounts.id,
          })
      );
      return result.length > 0
        ? { ...result[0], nonce: result[0].nonce - 1 }
        : undefined;
    } else {
      const result = await execQuery((db) =>
        db
          .update(accounts)
          .set({ nonce: sql`nonce + 1` })
          .where(eq(accounts.id, 1))
          .returning({
            addr: accounts.addr,
            privateKey: accounts.privateKey,
            nonce: accounts.nonce,
            id: accounts.id,
          })
      );

      return result.length > 0
        ? { ...result[0], nonce: result[0].nonce - 1 }
        : undefined;
    }
  });

export const getAccounts = async () =>
  execQuery((db) => db.query.accounts.findMany());

export const updateAccountNonce = async (addr: string, nonce: number) =>
  execQuery((db) =>
    db.update(accounts).set({ nonce }).where(eq(accounts.addr, addr))
  );
