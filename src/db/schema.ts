import { serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
});

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  userId: serial('user_id')
    .references(() => users.id)
    .unique(),
  createdAt: timestamp('created_at'),
});

export const ballots = pgTable('ballots', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  slug: text('slug').unique(),
  adminId: serial('admin_id').references(() => admins.id),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
});

export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  img: text('img'),
  ballotId: serial('ballot_id').references(() => ballots.id),
});

export const userGroups = pgTable('user_groups', {
  id: serial('id').primaryKey(),
  name: text('name'),
  admin_id: serial('admin_id').references(() => admins.id),
});

export const votes = pgTable(
  'votes',
  {
    id: serial('id').unique(),
    userId: serial('user_id').references(() => users.id),
    ballotId: serial('ballot_id').references(() => ballots.id),
    // blockId or transactionId
  },
  (table) => ({
    pk: [table.userId, table.ballotId],
  })
);

export const userGroupMemberships = pgTable(
  'user_group_memberships',
  {
    id: serial('id').unique(),
    groupId: serial('group_id'),
    userId: serial('user_id'),
  },
  (table) => ({
    pk: [table.groupId, table.userId],
  })
);

export const authorizedGroups = pgTable(
  'authorized_groups',
  {
    id: serial('id').unique(),
    groupId: serial('group_id').references(() => userGroups.id),
    ballotId: serial('ballot_id').references(() => ballots.id),
  },
  (table) => ({
    pk: [table.groupId, table.ballotId],
  })
);
