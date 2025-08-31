-- Supabase schema for Outta Web (users + sessions)
-- Run this in Supabase: SQL -> New Query -> paste -> Run

create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password text not null,
  verified boolean default true,
  reset_code text,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id text primary key,
  user_id integer not null references users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

-- Seed the two default accounts used by your app
insert into users (name, email, password, verified)
values
  ('Admin User', 'admin@outtaweb.com', 'admin123', true),
  ('Dante', 'dantedesignzofficial@gmail.com', 'yourpassword123', true)
on conflict (email) do nothing;

