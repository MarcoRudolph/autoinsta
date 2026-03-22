import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  integer,
} from 'drizzle-orm/pg-core';

export const telegramLinkTokens = pgTable(
  'telegram_link_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: text('token').notNull(),
    userId: text('user_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenUidx: uniqueIndex('telegram_link_tokens_token_uidx').on(table.token),
    userIdIdx: index('telegram_link_tokens_user_id_idx').on(table.userId),
  })
);

export const telegramIdentities = pgTable(
  'telegram_identities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    telegramUserId: text('telegram_user_id').notNull(),
    telegramUsername: text('telegram_username'),
    status: text('status').notNull().default('linked'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userUidx: uniqueIndex('telegram_identities_user_id_uidx').on(table.userId),
    tgUserUidx: uniqueIndex('telegram_identities_telegram_user_id_uidx').on(table.telegramUserId),
  })
);

export const telegramChatLinks = pgTable(
  'telegram_chat_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    telegramChatId: text('telegram_chat_id').notNull(),
    kind: text('kind').notNull(),
    title: text('title'),
    enabled: boolean('enabled').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userChatUidx: uniqueIndex('telegram_chat_links_user_chat_uidx').on(table.userId, table.telegramChatId),
    userIdIdx: index('telegram_chat_links_user_id_idx').on(table.userId),
  })
);

export const telegramThreads = pgTable(
  'telegram_threads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    threadKey: text('thread_key').notNull(),
    chatKind: text('chat_kind'),
    participantTelegramUserId: text('participant_telegram_user_id'),
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
    threadUidx: uniqueIndex('telegram_threads_user_thread_uidx').on(table.userId, table.threadKey),
    userIdIdx: index('telegram_threads_user_id_idx').on(table.userId),
  })
);

export const telegramMessages = pgTable(
  'telegram_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    threadKey: text('thread_key').notNull(),
    platformMessageId: text('platform_message_id').notNull(),
    messageKind: text('message_kind').notNull(),
    direction: text('direction').notNull().default('unknown'),
    senderTelegramUserId: text('sender_telegram_user_id'),
    recipientTelegramUserId: text('recipient_telegram_user_id'),
    chatId: text('chat_id').notNull(),
    messageText: text('message_text'),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),
    rawPayload: jsonb('raw_payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    msgUidx: uniqueIndex('telegram_messages_platform_message_id_uidx').on(table.platformMessageId),
    threadTimeIdx: index('telegram_messages_thread_time_idx').on(table.userId, table.threadKey, table.sentAt),
  })
);

export const telegramDmPending = pgTable(
  'telegram_dm_pending',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    threadKey: text('thread_key').notNull(),
    updateKind: text('update_kind').notNull(),
    inboundPayload: jsonb('inbound_payload').notNull(),
    threadState: jsonb('thread_state').notNull(),
    status: text('status').notNull().default('pending'),
    errorMessage: text('error_message'),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index('telegram_dm_pending_status_idx').on(table.status),
    createdAtIdx: index('telegram_dm_pending_created_idx').on(table.createdAt),
  })
);
