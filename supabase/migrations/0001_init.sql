create type membership_status as enum ('pending', 'approved', 'declined');
create type dog_size as enum ('small', 'medium', 'large');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  instagram_handle text not null,
  has_dog boolean not null default false,
  dog_name text,
  dog_breed text,
  dog_size dog_size,
  why text,
  membership_status membership_status not null default 'pending',
  role text not null default 'member',
  created_at timestamptz not null default now()
);

create table walks (
  id uuid primary key default gen_random_uuid(),
  walk_number int not null,
  name text not null,
  walk_date date not null,
  start_time text not null default '9:30 am',
  pace text not null default 'easy',
  distance_miles numeric not null default 2,
  reveal_at timestamptz not null,
  coffee_stop_name text,
  coffee_stop_address text,
  coffee_stop_note text,
  headcount int not null default 0,
  dog_count int not null default 0,
  created_at timestamptz not null default now()
);

create table walk_meet_points (
  walk_id uuid primary key references walks(id) on delete cascade,
  meet_point text not null,
  meet_note text
);

create table rsvps (
  walk_id uuid references walks(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (walk_id, user_id)
);

create table recap_photos (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references walks(id) on delete cascade,
  path text not null,
  caption text,
  span text not null default 'half' check (span in ('full', 'half')),
  sort int not null default 0
);

create table recap_notes (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references walks(id) on delete cascade,
  author_name text not null,
  author_handle text not null,
  quote text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents int not null,
  sizes text[] not null default '{}',
  photo_path text,
  club_only boolean not null default false,
  active boolean not null default true,
  sort int not null default 0
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  email text,
  product_name text,
  size text,
  amount_total int,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create or replace function public.is_owner() returns boolean
language sql security definer stable set search_path = public as
$$ select exists(select 1 from profiles where id = auth.uid() and role = 'owner') $$;

create or replace function public.is_approved() returns boolean
language sql security definer stable set search_path = public as
$$ select exists(select 1 from profiles where id = auth.uid() and membership_status = 'approved') $$;

create or replace function public.get_meet_point(p_walk_id uuid)
returns table (meet_point text, meet_note text)
language sql security definer stable set search_path = public as
$$
  select m.meet_point, m.meet_note
  from walk_meet_points m
  join walks w on w.id = m.walk_id
  where m.walk_id = p_walk_id
    and is_approved()
    and now() >= w.reveal_at
$$;

create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as
$$
begin
  if not is_owner() then
    new.membership_status := old.membership_status;
    new.role := old.role;
  end if;
  return new;
end
$$;
create trigger protect_profile_fields before update on profiles
for each row execute function protect_profile_fields();

alter table profiles enable row level security;
alter table walks enable row level security;
alter table walk_meet_points enable row level security;
alter table rsvps enable row level security;
alter table recap_photos enable row level security;
alter table recap_notes enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

create policy profiles_select on profiles for select using (id = auth.uid() or is_owner());
create policy profiles_insert on profiles for insert with check (id = auth.uid());
create policy profiles_update on profiles for update using (id = auth.uid() or is_owner());

create policy walks_select on walks for select using (true);
create policy walks_write on walks for all using (is_owner()) with check (is_owner());

create policy meet_points_owner on walk_meet_points for all using (is_owner()) with check (is_owner());

create policy rsvps_select on rsvps for select using (user_id = auth.uid() or is_owner());
create policy rsvps_insert on rsvps for insert with check (user_id = auth.uid() and is_approved());
create policy rsvps_delete on rsvps for delete using (user_id = auth.uid());

create policy recap_photos_select on recap_photos for select using (is_approved() or is_owner());
create policy recap_photos_write on recap_photos for all using (is_owner()) with check (is_owner());
create policy recap_notes_select on recap_notes for select using (is_approved() or is_owner());
create policy recap_notes_write on recap_notes for all using (is_owner()) with check (is_owner());

create policy products_select on products for select using (active = true or is_owner());
create policy products_write on products for all using (is_owner()) with check (is_owner());

create policy orders_owner_select on orders for select using (is_owner());

insert into storage.buckets (id, name, public) values ('products', 'products', true), ('recaps', 'recaps', true);

-- Seed data for development
insert into walks (walk_number, name, walk_date, start_time, reveal_at, coffee_stop_name, coffee_stop_address, coffee_stop_note, headcount, dog_count)
values (7, 'hudson river loop', current_date + 5, '9:30 am', now() + interval '4 days', 'Sey', 'Bedford St', 'Dogs welcome on the bench outside. 10% off with the club.', 18, 11);

insert into walk_meet_points (walk_id, meet_point, meet_note)
select id, 'Pier 45 lawn: Christopher St and West St', 'Look for the cream tote. We leave at 9:40 sharp.' from walks where walk_number = 7;

insert into products (name, description, price_cents, sizes, club_only, sort) values
  ('club crewneck', 'Blue on cream. Heavy fleece, single ink print.', 8800, '{s,m,l,xl}', false, 1),
  ('walkers cap', 'Cream on blue. Unstructured, low crown.', 4200, '{}', false, 2),
  ('saturday tote', 'Cream on blue. Carries the coffee order.', 3800, '{}', false, 3),
  ('good dog bandana', 'Blue on cream. For the good ones, which is all of them.', 2800, '{s,m,l}', false, 4),
  ('walk box crewneck', 'The one from the box.', 0, '{}', true, 5),
  ('walk box bandana', 'The one from the box.', 0, '{}', true, 6);
