import { sql } from 'drizzle-orm';
import {
  serial,
  text,
  timestamp,
  pgTable,
  integer,
  boolean,
  primaryKey,
  pgEnum,
  json,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { withTimezone: true }),
  image: text('image'),
  cert: text('cert').unique(),
  publicKey: text('public_key'),
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
});

export const elections = pgTable('elections', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  slug: text('slug').unique().notNull(),
  adminId: integer('admin_id')
    .references(() => admins.id, { onDelete: 'cascade' })
    .notNull(),
  isPrivate: boolean('private').default(true),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  privateKey: text('private_key').notNull().unique(),
  publicKey: text('public_key').notNull().unique(),
  masterPublicKey: text('master_public_key').notNull(),
  contractAddr: text('contract_addr'),
  encryptedResult: text('encrypted_result'),
});

export const authorizedUsers = pgTable('authorized_users', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  electionId: integer('election_id')
    .references(() => elections.id, { onDelete: 'cascade' })
    .notNull(),
});

export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  img: text('img'),
  electionId: integer('election_id')
    .references(() => elections.id, { onDelete: 'cascade' })
    .notNull(),
  votes: integer('votes'),
});

export const votes = pgTable(
  'votes',
  {
    id: serial('id').unique().notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    electionId: integer('election_id')
      .references(() => elections.id, { onDelete: 'cascade' })
      .notNull(),
    recoveryEthPrivateKey: text('recovery_eth_private').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.electionId] }),
  })
);

export type InsertBallot = typeof votes.$inferInsert;
export type Ballot = typeof votes.$inferSelect;

export const issuedTickets = pgTable('issued_tickets', {
  id: serial('id').primaryKey(),
  addr: text('addr').unique().notNull(),
  electionId: integer('election_id').references(() => elections.id, {
    onDelete: 'cascade',
  }),
  revoked: boolean('revoked').default(false),
  revokedBy: integer('revoked_by').references(() => users.id, {
    onDelete: 'set null',
  }),
});

export const accounts = pgTable('eth_accounts', {
  id: serial('id').primaryKey(),
  addr: text('addr').unique().notNull(),
  privateKey: text('private_key').unique().notNull(),
  nonce: integer('nonce').default(0).notNull(),
});

export type Account = typeof accounts.$inferSelect;

const jobStatus = ['idle', 'executing', 'success', 'error'] as const;

export type JobStatus = (typeof jobStatus)[number];

export const jobStatusEnum = pgEnum('job_status', jobStatus);

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  handler: text('handler').notNull(),
  arguments: json('arguments').default(sql`'{}'::json`),
  errorMsg: text('error_msg'),
  iat: timestamp('iat', { withTimezone: true }).defaultNow(),
  executionDate: timestamp('execution_date', { withTimezone: true }).notNull(),
  status: jobStatusEnum('status').default('idle'),
});

// ---------------------------NextAuth-----------------------------------------

export const verificationToken = pgTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
    token: text('token').notNull(),
  },
  (table) => ({ pk: primaryKey({ columns: [table.identifier, table.token] }) })
);

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
  sessionToken: text('sessionToken').notNull(),
});
