create table if not exists public.user_billing_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  plan text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  credits_total integer not null,
  credits_used integer not null default 0,
  api_budget_micros bigint not null,
  api_cost_micros bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_billing_cycles_user_period_uidx
  on public.user_billing_cycles(user_id, period_start, period_end);

create index if not exists user_billing_cycles_user_idx
  on public.user_billing_cycles(user_id);

create table if not exists public.billing_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  billing_cycle_id uuid not null references public.user_billing_cycles(id) on delete cascade,
  event_type text not null,
  credits_delta integer not null,
  api_cost_micros bigint not null default 0,
  model text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  platform_message_id text,
  ig_account_id text,
  thread_key text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists billing_ledger_usage_message_uidx
  on public.billing_ledger(event_type, platform_message_id);

create index if not exists billing_ledger_user_created_idx
  on public.billing_ledger(user_id, created_at);
