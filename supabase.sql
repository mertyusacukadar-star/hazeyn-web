-- Supabase SQL Editor içinde çalıştır.
create table if not exists public.hazeyn_data (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Veriler Vercel API içindeki SERVICE_ROLE_KEY ile yazılır/okunur.
-- Bu yüzden tabloya herkese açık yazma yetkisi vermiyoruz.
alter table public.hazeyn_data enable row level security;

-- Public site veriyi Vercel API üzerinden alacağı için burada public policy şart değil.
-- İstersen Supabase panelinden Storage > Buckets > hazeyn bucket'ını public yapabilirsin.

insert into public.hazeyn_data (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
