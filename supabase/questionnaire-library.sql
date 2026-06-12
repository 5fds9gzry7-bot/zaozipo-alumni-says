-- 枣子坡校友说 v1.1 数据库初始化模板
-- ADMIN_IMPORT_SECRET=zaozipo-admin-2026-Jalex-XuPu
-- 警告：此脚本会重建 public schema。执行前请备份现有数据。

drop schema if exists public cascade;
create schema public;
create extension if not exists pgcrypto;

grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

create table public.alumni_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  graduation_year integer not null,
  class_name text not null default '',
  university text not null,
  school text not null default '',
  major text not null,
  city text not null default '',
  country text not null default '中国',
  education_level text not null default '',
  research_direction text not null default '',
  tags text[] not null default '{}',
  short_intro text not null default '',
  bio text not null default '',
  gaokao_year integer,
  gaokao_province text not null default '',
  gaokao_type text not null default '',
  gaokao_score integer,
  gaokao_rank integer,
  admitted_university text not null default '',
  admitted_major text not null default '',
  show_score boolean not null default false,
  show_rank boolean not null default false,
  contact text not null default '',
  show_contact boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(name, graduation_year, university)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  alumni_id uuid not null references public.alumni_profiles(id) on delete cascade,
  title text not null,
  category text not null,
  summary text not null default '',
  content text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.imports (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  total_profiles integer not null default 0,
  total_articles integer not null default 0,
  skipped_duplicates integer not null default 0,
  skipped_invalid integer not null default 0,
  imported_at timestamptz not null default now(),
  operator text
);

create index alumni_profiles_published_idx on public.alumni_profiles(published, graduation_year desc);
create index articles_published_idx on public.articles(published, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger alumni_profiles_touch before update on public.alumni_profiles for each row execute function public.touch_updated_at();
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();

alter table public.alumni_profiles enable row level security;
alter table public.articles enable row level security;
alter table public.imports enable row level security;

create policy "public reads published alumni" on public.alumni_profiles for select to anon, authenticated using (published = true);
create policy "public reads published articles" on public.articles for select to anon, authenticated using (published = true);

grant select on public.alumni_profiles, public.articles to anon, authenticated;
revoke all on public.imports from anon, authenticated;
revoke insert, update, delete on public.alumni_profiles, public.articles from anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
