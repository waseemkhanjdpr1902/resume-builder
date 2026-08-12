create table if not exists public.download_usage (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  download_type text not null default 'free_cv' check (download_type in ('free_cv')),
  created_at timestamptz not null default now(),
  unique(owner_id, download_type)
);
alter table public.download_usage enable row level security;
drop policy if exists owner_read_download_usage on public.download_usage;
drop policy if exists owner_claim_download_usage on public.download_usage;
create policy owner_read_download_usage on public.download_usage for select to authenticated using(auth.uid()=owner_id);
create policy owner_claim_download_usage on public.download_usage for insert to authenticated with check(auth.uid()=owner_id);
