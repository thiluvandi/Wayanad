-- Run this in your Supabase SQL Editor to set up the expenses table

create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  paid_by     text not null check (paid_by in ('Nayan','Navin','Aditya','Gaurav','Gangadhar','Sachin')),
  amount      numeric(10,2) not null check (amount > 0),
  description text not null,
  location    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable Row Level Security (open read/write for the anon key — suitable for a private trip app)
alter table expenses enable row level security;

create policy "Allow all for anon" on expenses
  for all
  using (true)
  with check (true);
