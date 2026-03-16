-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text,
  age integer,
  bio text,
  photos text[] default '{}',
  langs text[] default '{}',
  interests text[] default '{}',
  social_energy text,
  drinks_pref text,
  smoking_pref text,
  music_genres text[] default '{}',
  transport text,
  format text,
  city text,
  color text default '#6366F1',
  created_at timestamptz default now()
);

-- ─── EVENTS ──────────────────────────────────────────────────────────────────
create table if not exists events (
  id bigserial primary key,
  host_id uuid references profiles(id) on delete cascade,
  title text not null,
  category text,
  date text,
  time text,
  location text,
  max_participants integer default 5,
  format text default 'group',
  description text,
  status text default 'open',
  created_at timestamptz default now()
);

-- ─── JOIN REQUESTS ────────────────────────────────────────────────────────────
create table if not exists join_requests (
  id bigserial primary key,
  event_id bigint references events(id) on delete cascade,
  requester_id uuid references profiles(id) on delete cascade,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(event_id, requester_id)
);

-- ─── CHATS ───────────────────────────────────────────────────────────────────
create table if not exists chats (
  id bigserial primary key,
  event_id bigint references events(id) on delete cascade,
  type text default 'group',
  last_msg text,
  created_at timestamptz default now()
);

create table if not exists chat_members (
  chat_id bigint references chats(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  primary key (chat_id, profile_id)
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
create table if not exists messages (
  id bigserial primary key,
  chat_id bigint references chats(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  text text not null,
  created_at timestamptz default now()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
create table if not exists notifications (
  id bigserial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  type text,
  title text,
  body text,
  emoji text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ─── DISABLE RLS (for development) ───────────────────────────────────────────
alter table profiles disable row level security;
alter table events disable row level security;
alter table join_requests disable row level security;
alter table chats disable row level security;
alter table chat_members disable row level security;
alter table messages disable row level security;
alter table notifications disable row level security;
