alter table public.alumni_profiles
  add column if not exists contact text not null default '',
  add column if not exists show_contact boolean not null default false;
