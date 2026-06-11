-- 枣子坡校友说：无审核机制全量重置
-- 警告：执行后会删除 public schema 中现有数据。

drop schema if exists public cascade;
create schema public;

grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated, service_role;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text not null default 'alumni' check (role in ('user','alumni','admin','super_admin')),
  status text not null default 'active' check (status in ('active','banned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alumni_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  display_name text not null default '新枣友',
  graduation_year integer not null default extract(year from now())::integer,
  class_name text,
  university text not null default '待完善',
  college text,
  major text not null default '待完善',
  city text not null default '待完善',
  country text not null default '中国',
  stage text not null default '待完善',
  direction text,
  tags text[] not null default '{}',
  intro text not null default '这位枣友正在完善自己的名片。',
  gaokao_year integer,
  gaokao_province text,
  gaokao_type text,
  gaokao_score integer,
  gaokao_rank integer,
  show_score boolean not null default false,
  show_rank boolean not null default false,
  admitted_university text,
  admitted_major text,
  study_advice text,
  exam_advice text,
  application_advice text,
  major_advice text,
  message_to_students text,
  contact text,
  show_contact boolean not null default false,
  status text not null default 'published' check (status in ('published','hidden','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  alumni_profile_id uuid references public.alumni_profiles(id) on delete set null,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null,
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('published','hidden','deleted')),
  like_count integer not null default 0 check (like_count >= 0),
  favorite_count integer not null default 0 check (favorite_count >= 0),
  view_count integer not null default 0 check (view_count >= 0),
  read_time text not null default '5 分钟',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.article_likes (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(article_id, user_id)
);

create table public.article_favorites (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(article_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('article','alumni_profile','user')),
  target_id uuid not null,
  reason text not null,
  detail text,
  status text not null default 'pending' check (status in ('pending','resolved','rejected')),
  handled_by uuid references public.profiles(id),
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action_type text not null,
  target_type text not null,
  target_id uuid not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index alumni_profiles_status_idx on public.alumni_profiles(status);
create index articles_status_published_idx on public.articles(status, published_at desc);
create index reports_status_idx on public.reports(status);

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare new_name text;
begin
  new_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), '新枣友');
  insert into public.profiles (id, email, display_name, role, status)
  values (new.id, new.email, new_name, 'alumni', 'active');
  insert into public.alumni_profiles (user_id, display_name, status)
  values (new.id, new_name, 'published');
  return new;
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = user_id and role in ('admin','super_admin') and status = 'active');
$$;

create or replace function public.is_active_user(user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = user_id and status = 'active');
$$;

create or replace function public.admin_set_user_status(target_user_id uuid, next_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin(auth.uid()) then raise exception 'Admin permission required'; end if;
  if next_status not in ('active','banned') then raise exception 'Invalid status'; end if;
  update public.profiles set status = next_status where id = target_user_id;
end;
$$;

create or replace function public.update_article_counter()
returns trigger language plpgsql security definer set search_path = public as $$
declare target uuid; delta integer;
begin
  target := coalesce(new.article_id, old.article_id);
  delta := case when TG_OP = 'INSERT' then 1 else -1 end;
  if TG_TABLE_NAME = 'article_likes' then
    update public.articles set like_count = greatest(0, like_count + delta) where id = target;
  else
    update public.articles set favorite_count = greatest(0, favorite_count + delta) where id = target;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger alumni_updated_at before update on public.alumni_profiles for each row execute function public.update_updated_at_column();
create trigger articles_updated_at before update on public.articles for each row execute function public.update_updated_at_column();
create trigger likes_counter after insert or delete on public.article_likes for each row execute function public.update_article_counter();
create trigger favorites_counter after insert or delete on public.article_favorites for each row execute function public.update_article_counter();

-- 回填已经存在的 Auth 用户，执行重置后旧账号可直接继续登录。
insert into public.profiles (id, email, display_name, role, status)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1), '新枣友'),
  'alumni',
  'active'
from auth.users
on conflict (id) do nothing;

insert into public.alumni_profiles (user_id, display_name, status)
select id, coalesce(display_name, split_part(email, '@', 1), '新枣友'), 'published'
from public.profiles
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.alumni_profiles enable row level security;
alter table public.articles enable row level security;
alter table public.article_likes enable row level security;
alter table public.article_favorites enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;
alter table public.notifications enable row level security;

create policy "authenticated reads profiles" on public.profiles for select to authenticated using (true);
create policy "owner updates own non-admin profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and role in ('user','alumni'));
create policy "admins manage profiles" on public.profiles for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "public reads published alumni" on public.alumni_profiles for select
  using (status = 'published' or user_id = auth.uid() or public.is_admin(auth.uid()));
create policy "owner inserts own alumni profile" on public.alumni_profiles for insert to authenticated
  with check (user_id = auth.uid() and status = 'published');
create policy "owner updates own alumni profile" on public.alumni_profiles for update to authenticated
  using ((user_id = auth.uid() and public.is_active_user(auth.uid())) or public.is_admin(auth.uid()))
  with check ((user_id = auth.uid() and public.is_active_user(auth.uid())) or public.is_admin(auth.uid()));
create policy "admins delete alumni profiles" on public.alumni_profiles for delete to authenticated
  using (public.is_admin(auth.uid()));

create policy "public reads published articles" on public.articles for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin(auth.uid()));
create policy "users publish own articles" on public.articles for insert to authenticated
  with check (author_id = auth.uid() and status = 'published' and public.is_active_user(auth.uid()));
create policy "owners update own articles" on public.articles for update to authenticated
  using ((author_id = auth.uid() and public.is_active_user(auth.uid())) or public.is_admin(auth.uid()))
  with check ((author_id = auth.uid() and public.is_active_user(auth.uid())) or public.is_admin(auth.uid()));
create policy "owners delete own articles" on public.articles for delete to authenticated
  using (author_id = auth.uid() or public.is_admin(auth.uid()));

create policy "owner reads likes" on public.article_likes for select to authenticated using (user_id = auth.uid());
create policy "owner adds likes" on public.article_likes for insert to authenticated
  with check (user_id = auth.uid() and exists(select 1 from public.articles where id = article_id and status = 'published'));
create policy "owner removes likes" on public.article_likes for delete to authenticated using (user_id = auth.uid());
create policy "owner reads favorites" on public.article_favorites for select to authenticated using (user_id = auth.uid());
create policy "owner adds favorites" on public.article_favorites for insert to authenticated
  with check (user_id = auth.uid() and exists(select 1 from public.articles where id = article_id and status = 'published'));
create policy "owner removes favorites" on public.article_favorites for delete to authenticated using (user_id = auth.uid());

create policy "owner creates reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "owner or admin reads reports" on public.reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin(auth.uid()));
create policy "admin manages reports" on public.reports for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "admin reads actions" on public.admin_actions for select to authenticated using (public.is_admin(auth.uid()));
create policy "admin creates actions" on public.admin_actions for insert to authenticated
  with check (public.is_admin(auth.uid()) and admin_id = auth.uid());
create policy "owner reads notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "admin creates notifications" on public.notifications for insert to authenticated with check (public.is_admin(auth.uid()));

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all tables in schema public to postgres;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant all on all sequences in schema public to postgres;
grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.is_active_user(uuid) to authenticated;
grant execute on function public.admin_set_user_status(uuid, text) to authenticated;
revoke insert, delete, update on public.profiles from authenticated;
grant update(display_name, avatar_url) on public.profiles to authenticated;

-- 管理员初始化：
-- update public.profiles set role='super_admin', status='active' where email='jalex1049329707@gmail.com';
