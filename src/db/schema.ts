import { serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  userId: serial('user_id')
    .references(() => users.id)
    .unique(),
});

export const ballots = pgTable('ballots', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  slug: text('slug').unique().notNull(),
  adminId: serial('admin_id')
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
  ballotId: serial('ballot_id')
    .references(() => ballots.id)
    .notNull(),
});

export const userGroups = pgTable('user_groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  admin_id: serial('admin_id')
    .references(() => admins.id)
    .notNull(),
});

export const votes = pgTable(
  'votes',
  {
    id: serial('id').unique().notNull(),
    userId: serial('user_id')
      .references(() => users.id)
      .notNull(),
    ballotId: serial('ballot_id')
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
    groupId: serial('group_id').notNull(),
    userId: serial('user_id').notNull(),
  },
  (table) => ({
    pk: [table.groupId, table.userId],
  })
);

export const authorizedGroups = pgTable(
  'authorized_groups',
  {
    id: serial('id').unique().notNull(),
    groupId: serial('group_id')
      .references(() => userGroups.id)
      .notNull(),
    ballotId: serial('ballot_id')
      .references(() => ballots.id)
      .notNull(),
  },
  (table) => ({
    pk: [table.groupId, table.ballotId],
  })
);
