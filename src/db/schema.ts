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
  secretKey: text('secret_key').notNull().unique(),
  publicKey: text('public_key').notNull().unique(),
  masterPublicKey: text('master_public_key').notNull(),
  contractAddr: text('contract_addr'),
  encryptedResult: text('encrypted_result'),
});

export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  img: text('img'),
  electionId: integer('election_id')
    .references(() => elections.id, { onDelete: 'cascade' })
    .notNull(),
  votes: integer('votes').default(0),
});

export const userGroups = pgTable('user_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  adminId: integer('admin_id')
    .references(() => admins.id, { onDelete: 'cascade' })
    .notNull(),
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
    encryptedEthSecret: text('encrypted_eth_secret').notNull(),
    recoveryEthSecret: text('recovery_eth_secret').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.electionId] }),
  })
);

export const userGroupMemberships = pgTable(
  'user_group_memberships',
  {
    id: serial('id').unique().notNull(),
    groupId: integer('group_id')
      .references(() => userGroups.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupId, table.userId] }),
  })
);

export const authorizedGroups = pgTable(
  'authorized_groups',
  {
    id: serial('id').unique().notNull(),
    groupId: integer('group_id')
      .references(() => userGroups.id, { onDelete: 'cascade' })
      .notNull(),
    electionId: integer('election_id')
      .references(() => elections.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupId, table.electionId] }),
  })
);

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
