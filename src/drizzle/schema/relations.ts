import { relations } from 'drizzle-orm';
import { users } from './users';
import { personas } from './personas';
import { subscriptions } from './subscriptions';

export const usersRelations = relations(users, ({ many }) => ({
  personas: many(personas),
  subscriptions: many(subscriptions),
}));

export const personasRelations = relations(personas, ({ one }) => ({
  user: one(users, {
    fields: [personas.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
})); 