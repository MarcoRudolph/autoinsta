import { pgTable, serial, jsonb, timestamp, uuid, unique, varchar, text, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const personas = pgTable("personas", {
	id: serial().primaryKey().notNull(),
	data: jsonb().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	userId: uuid().notNull(),
});

export const users = pgTable("users", {
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar({ length: 255 }).notNull(),
	instaAccessToken: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	id: uuid().primaryKey().notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	subscriptionStatus: text("subscription_status").default('free'),
	subscriptionPlan: text("subscription_plan").default('free'),
	subscriptionStartDate: timestamp("subscription_start_date", { mode: 'string' }),
	subscriptionEndDate: timestamp("subscription_end_date", { mode: 'string' }),
	isPro: boolean("is_pro").default(false),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
