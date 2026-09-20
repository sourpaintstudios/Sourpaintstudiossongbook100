create table if not exists songbook_blob (
  id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);
