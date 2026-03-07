import { pgTable, uuid, jsonb, timestamp, serial } from 'drizzle-orm/pg-core';

export const personas = pgTable('personas', {
  id: serial('id').primaryKey(),
  userId: uuid('userId').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}); 
