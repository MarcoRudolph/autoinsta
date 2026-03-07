import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const instagramConnections = pgTable(
  'instagram_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id'),
    igAccountId: text('ig_account_id').notNull(),
    igUsername: text('ig_username'),
    provider: text('provider').notNull().default('instagram'),
    accessToken: text('access_token'),
    tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
    scopes: jsonb('scopes'),
    status: text('status').notNull().default('connected'),
    webhookVerified: boolean('webhook_verified').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accountUniqueIdx: uniqueIndex('instagram_connections_ig_account_id_uidx').on(table.igAccountId),
    userIdIdx: index('instagram_connections_user_id_idx').on(table.userId),
  })
);

export const instagramThreads = pgTable(
  'instagram_threads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    igAccountId: text('ig_account_id').notNull(),
    threadKey: text('thread_key').notNull(),
    participantIgId: text('participant_ig_id'),
    incomingMessageCount: integer('incoming_message_count').notNull().default(0),
    outgoingMessageCount: integer('outgoing_message_count').notNull().default(0),
    lastIncomingAt: timestamp('last_incoming_at', { withTimezone: true }),
    lastOutgoingAt: timestamp('last_outgoing_at', { withTimezone: true }),
    lastPromoAt: timestamp('last_promo_at', { withTimezone: true }),
    lastPromoMessageId: text('last_promo_message_id'),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    threadUniqueIdx: uniqueIndex('instagram_threads_account_thread_uidx').on(
      table.igAccountId,
      table.threadKey
    ),
    accountIdx: index('instagram_threads_account_idx').on(table.igAccountId),
  })
);

export const instagramMessages = pgTable(
  'instagram_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    igAccountId: text('ig_account_id').notNull(),
    threadKey: text('thread_key').notNull(),
    platformMessageId: text('platform_message_id').notNull(),
    messageKind: text('message_kind').notNull(),
    direction: text('direction').notNull().default('unknown'),
    senderIgId: text('sender_ig_id'),
    recipientIgId: text('recipient_ig_id'),
    messageText: text('message_text'),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),
    rawPayload: jsonb('raw_payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    messageUniqueIdx: uniqueIndex('instagram_messages_platform_message_id_uidx').on(table.platformMessageId),
    threadTimeIdx: index('instagram_messages_thread_time_idx').on(
      table.igAccountId,
      table.threadKey,
      table.sentAt
    ),
    senderIdx: index('instagram_messages_sender_idx').on(table.senderIgId),
  })
);

export const instagramPromoAudit = pgTable(
  'instagram_promo_audit',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    igAccountId: text('ig_account_id').notNull(),
    threadKey: text('thread_key').notNull(),
    platformMessageId: text('platform_message_id'),
    personaId: text('persona_id'),
    decision: text('decision').notNull(), // promo_sent | promo_skipped
    reason: text('reason').notNull(),
    selectedLinkUrl: text('selected_link_url'),
    selectedActionType: text('selected_action_type'),
    selectedSendingBehavior: text('selected_sending_behavior'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    threadCreatedIdx: index('instagram_promo_audit_thread_created_idx').on(table.igAccountId, table.threadKey, table.createdAt),
  })
);

export const instagramDeliveryAudit = pgTable(
  'instagram_delivery_audit',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    igAccountId: text('ig_account_id').notNull(),
    threadKey: text('thread_key').notNull(),
    direction: text('direction').notNull(),
    status: text('status').notNull(), // succeeded | failed
    providerMessageId: text('provider_message_id'),
    errorCode: integer('error_code'),
    errorType: text('error_type'),
    errorMessage: text('error_message'),
    retryCount: integer('retry_count').notNull().default(0),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    deliveryAuditIdx: index('instagram_delivery_audit_thread_created_idx').on(
      table.igAccountId,
      table.threadKey,
      table.createdAt
    ),
  })
);
