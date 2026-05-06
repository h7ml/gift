create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  type text not null,
  event_date date not null,
  location text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists gift_records (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  guest_name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  gift_item text not null default '',
  record_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists sessions_token_idx on sessions(token);
create index if not exists sessions_expires_at_idx on sessions(expires_at);
create index if not exists events_user_id_created_at_idx on events(user_id, created_at desc);
create index if not exists gift_records_event_id_created_at_idx on gift_records(event_id, created_at desc);
