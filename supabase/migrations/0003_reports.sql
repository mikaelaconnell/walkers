create table reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table reports enable row level security;

create policy reports_insert on reports for insert with check (user_id = auth.uid());
create policy reports_select_owner on reports for select using (is_owner());
