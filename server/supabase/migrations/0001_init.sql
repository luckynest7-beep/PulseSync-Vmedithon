create table if not exists profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Patient',
  age integer,
  gender text,
  medical_id text,
  glucose_unit text not null default 'mg/dL',
  reminder_time text
);

create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('bp', 'glucose')),
  systolic integer,
  diastolic integer,
  pulse integer,
  glucose integer,
  source text not null check (source in ('camera', 'voice', 'manual')),
  flag text check (flag in ('high', 'low')),
  taken_at timestamptz not null,
  created_at timestamptz not null default now(),
  notes text
);

create index if not exists readings_user_id_taken_at_idx on readings (user_id, taken_at desc);

alter table profiles enable row level security;
alter table readings enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = user_id);
create policy "profiles_upsert_own" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = user_id);

create policy "readings_select_own" on readings for select using (auth.uid() = user_id);
create policy "readings_insert_own" on readings for insert with check (auth.uid() = user_id);
create policy "readings_delete_own" on readings for delete using (auth.uid() = user_id);
