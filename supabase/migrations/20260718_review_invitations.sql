create table if not exists public.review_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete set null,
  business_email text not null,
  customer_email text not null,
  customer_name text,
  token_hash text not null unique,
  status text not null default 'pending' check (status in ('pending', 'used', 'cancelled', 'expired')),
  source_type text not null default 'business_invitation',
  expires_at timestamptz not null default (now() + interval '30 days'),
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists review_invitations_company_id_idx on public.review_invitations(company_id);
create index if not exists review_invitations_customer_email_idx on public.review_invitations(lower(customer_email));
create index if not exists review_invitations_status_idx on public.review_invitations(status);

alter table public.review_invitations enable row level security;
