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
  bookkeeper_name text not null default '',
  location text,
  description text,
  interface_style text not null default 'red' check (interface_style in ('red', 'gray')),
  pdf_cover_image_data_url text,
  created_at timestamptz not null default now()
);

alter table events add column if not exists bookkeeper_name text not null default '';
alter table events add column if not exists interface_style text not null default 'red';
alter table events add column if not exists pdf_cover_image_data_url text;

create table if not exists event_members (
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

insert into event_members (event_id, user_id, role)
select id, user_id, 'owner'
from events
on conflict (event_id, user_id) do nothing;

create table if not exists gift_records (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  guest_name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  gift_item text not null default '',
  relative_title text,
  phone_number text,
  home_address text,
  return_gift_done boolean not null default false,
  return_gift_amount numeric(12, 2) check (return_gift_amount is null or return_gift_amount >= 0),
  return_gift_note text,
  record_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table gift_records add column if not exists phone_number text;
alter table gift_records add column if not exists home_address text;

alter table gift_records add column if not exists relative_title text;
alter table gift_records add column if not exists updated_at timestamptz not null default now();
alter table gift_records add column if not exists return_gift_done boolean not null default false;
alter table gift_records add column if not exists return_gift_amount numeric(12, 2);
alter table gift_records add column if not exists return_gift_note text;

create table if not exists event_attachments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  original_name text not null,
  stored_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  file_data bytea,
  created_at timestamptz not null default now()
);

alter table event_attachments add column if not exists display_name text;
alter table event_attachments add column if not exists note text;
alter table event_attachments add column if not exists file_data bytea;
alter table event_attachments alter column stored_name drop not null;

create table if not exists user_preferences (
  user_id uuid not null references users(id) on delete cascade,
  preference_key text not null,
  preference_value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, preference_key)
);

create index if not exists sessions_token_idx on sessions(token);
create index if not exists sessions_expires_at_idx on sessions(expires_at);
create index if not exists events_user_id_created_at_idx on events(user_id, created_at desc);
create index if not exists event_members_user_id_idx on event_members(user_id);
create index if not exists event_members_event_id_role_idx on event_members(event_id, role);
create index if not exists gift_records_event_id_created_at_idx on gift_records(event_id, created_at desc);
create index if not exists event_attachments_event_id_created_at_idx on event_attachments(event_id, created_at desc);
