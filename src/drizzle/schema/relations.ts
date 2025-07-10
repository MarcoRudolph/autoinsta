import { relations } from 'drizzle-orm';
import { users } from './users';
import { personas } from './personas';

export const usersRelations = relations(users, ({ many }) => ({
  personas: many(personas),
}));

export const personasRelations = relations(personas, ({ one }) => ({
  user: one(users, {
    fields: [personas.userId],
    references: [users.id],
  }),
})); 