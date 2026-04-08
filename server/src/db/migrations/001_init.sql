create extension if not exists pgcrypto;

create table if not exists sessions (
  session_id text primary key,
  user_id text not null,
  email text not null,
  name text not null,
  role text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_expires_at_idx on sessions (expires_at);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'upcoming',
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'participant',
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leaderboard (
  participant_id uuid primary key references participants(id) on delete cascade,
  score integer not null default 0,
  rank integer not null default 0,
  updated_at timestamptz not null default now()
);