import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const userBillingCycles = pgTable(
  'user_billing_cycles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plan: text('plan').notNull(),
    periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
    periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
    creditsTotal: integer('credits_total').notNull(),
    creditsUsed: integer('credits_used').notNull().default(0),
    apiBudgetMicros: bigint('api_budget_micros', { mode: 'number' }).notNull(),
    apiCostMicros: bigint('api_cost_micros', { mode: 'number' }).notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userPeriodUniqueIdx: uniqueIndex('user_billing_cycles_user_period_uidx').on(
      table.userId,
      table.periodStart,
      table.periodEnd
    ),
    userIdx: index('user_billing_cycles_user_idx').on(table.userId),
  })
);

export const billingLedger = pgTable(
  'billing_ledger',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    billingCycleId: uuid('billing_cycle_id')
      .notNull()
      .references(() => userBillingCycles.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(), // grant | usage
    creditsDelta: integer('credits_delta').notNull(),
    apiCostMicros: bigint('api_cost_micros', { mode: 'number' }).notNull().default(0),
    model: text('model'),
    promptTokens: integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    totalTokens: integer('total_tokens'),
    platformMessageId: text('platform_message_id'),
    igAccountId: text('ig_account_id'),
    threadKey: text('thread_key'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    usageEventUniqueIdx: uniqueIndex('billing_ledger_usage_message_uidx').on(
      table.eventType,
      table.platformMessageId
    ),
    userCreatedIdx: index('billing_ledger_user_created_idx').on(table.userId, table.createdAt),
  })
);
