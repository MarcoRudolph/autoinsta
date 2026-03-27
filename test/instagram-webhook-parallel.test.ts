import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

type EnvMap = Record<string, string>;

type WebhookResponse = {
  received?: boolean;
  events?: number;
  stored?: number;
  duplicates?: number;
  storeErrors?: number;
  enqueued?: number;
  storeFailures?: Array<Record<string, unknown>>;
  error?: string;
};

type DbMessageRow = {
  id: string;
  direction: string;
  message_text: string | null;
  thread_key: string;
  platform_message_id: string;
  created_at: string;
};

type DbPendingRow = {
  id: string;
  status: string;
  error_message: string | null;
  thread_key: string;
  created_at: string;
  processed_at: string | null;
};

function loadEnvFromDotEnv(): EnvMap {
  const out: EnvMap = {};
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return out;

  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
    out[key] = value;
  }
  return out;
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  assert.ok(value, `Missing required env: ${name}`);
  return value;
}

function buildBaseUrlCandidates(): string[] {
  const explicit = process.env.WEBHOOK_BASE_URL?.trim();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const app = process.env.APP_BASE_URL?.trim();
  const defaults = ['https://rudolpho-chat.de', 'https://www.rudolpho-chat.de'];

  const seeds = [explicit, site, app, ...defaults].filter(
    (v): v is string => Boolean(v && v.length > 0)
  );

  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of seeds) {
    const normalized = raw.replace(/\/+$/, '');
    if (!seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }

    // Fallback for environments where www host is not resolvable.
    if (normalized.includes('://www.')) {
      const withoutWww = normalized.replace('://www.', '://');
      if (!seen.has(withoutWww)) {
        seen.add(withoutWww);
        out.push(withoutWww);
      }
    }
  }

  return out;
}

async function postWebhook(
  baseUrl: string,
  igAccountId: string,
  senderId: string,
  marker: string
): Promise<{ status: number; bodyText: string; parsed: WebhookResponse | null; elapsedMs: number }> {
  const mid = `m_${marker}`;
  const started = Date.now();
  const response = await fetch(`${baseUrl}/api/instagram/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      object: 'instagram',
      entry: [
        {
          id: igAccountId,
          time: Math.floor(Date.now() / 1000),
          messaging: [
            {
              sender: { id: senderId },
              recipient: { id: igAccountId },
              timestamp: Date.now(),
              message: {
                mid,
                text: `parallel webhook probe ${marker}`,
              },
            },
          ],
        },
      ],
    }),
  });

  const bodyText = await response.text();
  let parsed: WebhookResponse | null = null;
  try {
    parsed = JSON.parse(bodyText) as WebhookResponse;
  } catch {
    parsed = null;
  }

  return {
    status: response.status,
    bodyText,
    parsed,
    elapsedMs: Date.now() - started,
  };
}

async function postWebhookWithFallback(
  baseUrlCandidates: string[],
  igAccountId: string,
  senderId: string,
  marker: string
): Promise<{ baseUrl: string; status: number; bodyText: string; parsed: WebhookResponse | null; elapsedMs: number }> {
  let lastError: unknown = null;

  for (const baseUrl of baseUrlCandidates) {
    try {
      const result = await postWebhook(baseUrl, igAccountId, senderId, marker);
      return { baseUrl, ...result };
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('[parallel-webhook-test] base URL failed, trying next candidate', {
        baseUrl,
        error: errorMessage,
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

test(
  'parallel POST webhook ingest -> DB message + pending queue',
  { timeout: 90_000 },
  async () => {
    loadEnvFromDotEnv();

    const postgresUrl = requiredEnv('POSTGRES_URL');
    const siteBaseUrlCandidates = buildBaseUrlCandidates();
    assert.ok(
      siteBaseUrlCandidates.length > 0,
      'Missing WEBHOOK_BASE_URL / NEXT_PUBLIC_SITE_URL / APP_BASE_URL and no defaults available'
    );

    const igAccountId = process.env.TEST_IG_ACCOUNT_ID?.trim() || '9873982649372272';
    const senderA = process.env.TEST_IG_SENDER_A?.trim() || `test-a-${Date.now()}`;
    const senderB = process.env.TEST_IG_SENDER_B?.trim() || `test-b-${Date.now()}`;
    const markerA = `parallel_${Date.now()}_${randomUUID().slice(0, 8)}_a`;
    const markerB = `parallel_${Date.now()}_${randomUUID().slice(0, 8)}_b`;

    const expectedMidA = `m_${markerA}`;
    const expectedMidB = `m_${markerB}`;

    const startedAtIso = new Date().toISOString();

    console.log('[parallel-webhook-test] configuration', {
      startedAtIso,
      siteBaseUrlCandidates,
      igAccountId,
      senderA,
      senderB,
      expectedMidA,
      expectedMidB,
      hasPostgresUrl: Boolean(postgresUrl),
    });

    const [resA, resB] = await Promise.all([
      postWebhookWithFallback(siteBaseUrlCandidates, igAccountId, senderA, markerA),
      postWebhookWithFallback(siteBaseUrlCandidates, igAccountId, senderB, markerB),
    ]);

    console.log('[parallel-webhook-test] webhook responses', {
      requestA: {
        status: resA.status,
        elapsedMs: resA.elapsedMs,
        parsed: resA.parsed,
        bodyText: resA.bodyText,
      },
      requestB: {
        status: resB.status,
        elapsedMs: resB.elapsedMs,
        parsed: resB.parsed,
        bodyText: resB.bodyText,
      },
    });

    const db = new Client({
      connectionString: postgresUrl,
      ssl: { rejectUnauthorized: false },
    });
    await db.connect();

    const dbMessages = await db.query<DbMessageRow>(
      `
        select id, direction, message_text, thread_key, platform_message_id, created_at
        from instagram_messages
        where platform_message_id = any($1)
        order by created_at desc
      `,
      [[expectedMidA, expectedMidB]]
    );

    const dbPending = await db.query<DbPendingRow>(
      `
        select id, status, error_message, thread_key, created_at, processed_at
        from instagram_dm_pending
        where thread_key = any($1)
        order by created_at desc
        limit 10
      `,
      [[`dm:${senderA}`, `dm:${senderB}`]]
    );

    const latestMessages = await db.query<DbMessageRow>(
      `
        select id, direction, message_text, thread_key, platform_message_id, created_at
        from instagram_messages
        order by created_at desc
        limit 10
      `
    );

    const latestPending = await db.query<DbPendingRow>(
      `
        select id, status, error_message, thread_key, created_at, processed_at
        from instagram_dm_pending
        order by created_at desc
        limit 10
      `
    );

    await db.end();

    const foundMidA = dbMessages.rows.some((row) => row.platform_message_id === expectedMidA);
    const foundMidB = dbMessages.rows.some((row) => row.platform_message_id === expectedMidB);
    const pendingA = dbPending.rows.find((row) => row.thread_key === `dm:${senderA}`);
    const pendingB = dbPending.rows.find((row) => row.thread_key === `dm:${senderB}`);

    console.log('[parallel-webhook-test] db verification summary', {
      expected: {
        expectedMidA,
        expectedMidB,
        threadKeyA: `dm:${senderA}`,
        threadKeyB: `dm:${senderB}`,
      },
      found: {
        foundMidA,
        foundMidB,
        pendingA: pendingA
          ? { status: pendingA.status, error: pendingA.error_message, createdAt: pendingA.created_at }
          : null,
        pendingB: pendingB
          ? { status: pendingB.status, error: pendingB.error_message, createdAt: pendingB.created_at }
          : null,
      },
      raw: {
        dbMessages: dbMessages.rows,
        dbPending: dbPending.rows,
        latestMessages: latestMessages.rows,
        latestPending: latestPending.rows,
      },
    });

    assert.equal(resA.status, 200, `Request A returned ${resA.status}, body=${resA.bodyText}`);
    assert.equal(resB.status, 200, `Request B returned ${resB.status}, body=${resB.bodyText}`);
    assert.ok(foundMidA, `Did not find message row for ${expectedMidA}`);
    assert.ok(foundMidB, `Did not find message row for ${expectedMidB}`);
    assert.ok(pendingA, `Did not find pending row for thread dm:${senderA}`);
    assert.ok(pendingB, `Did not find pending row for thread dm:${senderB}`);
  }
);
