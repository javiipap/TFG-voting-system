import {
  serial,
  text,
  timestamp,
  pgTable,
  bigint,
  integer,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { withTimezone: true }),
  image: text('image'),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .unique(),
});

export const ballots = pgTable('ballots', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  slug: text('slug').unique().notNull(),
  adminId: integer('admin_id')
    .references(() => admins.id)
    .notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
});

export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  img: text('img'),
  ballotId: integer('ballot_id')
    .references(() => ballots.id)
    .notNull(),
});

export const userGroups = pgTable('user_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  adminId: integer('admin_id')
    .references(() => admins.id)
    .notNull(),
});

export const votes = pgTable(
  'votes',
  {
    id: serial('id').unique().notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    ballotId: integer('ballot_id')
      .references(() => ballots.id)
      .notNull(),
    // blockId or transactionId
  },
  (table) => ({
    pk: [table.userId, table.ballotId],
  })
);

export const userGroupMemberships = pgTable(
  'user_group_memberships',
  {
    id: serial('id').unique().notNull(),
    groupId: integer('group_id').notNull(),
    userId: integer('user_id').notNull(),
  },
  (table) => ({
    pk: [table.groupId, table.userId],
  })
);

export const authorizedGroups = pgTable(
  'authorized_groups',
  {
    id: serial('id').unique().notNull(),
    groupId: integer('group_id')
      .references(() => userGroups.id)
      .notNull(),
    ballotId: integer('ballot_id')
      .references(() => ballots.id)
      .notNull(),
  },
  (table) => ({
    pk: [table.groupId, table.ballotId],
  })
);

// ---------------------------NextAuth-----------------------------------------

export const verificationToken = pgTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
    token: text('token').notNull(),
  },
  (table) => ({ pk: [table.identifier, table.token] })
);

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: bigint('expires_at', { mode: 'number' }),
  id_token: text('id_token'),
  scope: text('scope'),
  session_state: text('session_state'),
  token_type: text('token_type'),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull(),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
  sessionToken: text('sessionToken').notNull(),
});
