create extension if not exists "pgcrypto";

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'published' check (status in ('published', 'draft')),
  is_claimed boolean not null default false,
  website text not null,
  category text not null,
  description text,
  logo_url text,
  favicon_url text,
  og_image_url text,
  cover_image_url text,
  website_screenshot_url text,
  average_rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table companies add column if not exists logo_url text;
alter table companies add column if not exists status text not null default 'published' check (status in ('published', 'draft'));
alter table companies add column if not exists is_claimed boolean not null default false;
alter table companies add column if not exists favicon_url text;
alter table companies add column if not exists og_image_url text;
alter table companies add column if not exists cover_image_url text;
alter table companies add column if not exists website_screenshot_url text;

insert into storage.buckets (id, name, public)
values ('brand-screenshots', 'brand-screenshots', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('brand-logos', 'brand-logos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do update set public = true;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  pending_brand_name text,
  pending_brand_slug text,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  content text not null,
  reviewer_name text not null,
  reviewer_email text not null,
  order_number text,
  proof_image_url text,
  review_image_urls text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_verified boolean not null default false,
  submitted_email_sent_at timestamptz,
  approved_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table reviews add column if not exists order_number text;
alter table reviews add column if not exists proof_image_url text;
alter table reviews add column if not exists review_image_urls text[] default '{}';
alter table reviews add column if not exists is_verified boolean not null default false;
alter table reviews add column if not exists status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'));
alter table reviews add column if not exists pending_brand_name text;
alter table reviews add column if not exists pending_brand_slug text;
alter table reviews add column if not exists submitted_email_sent_at timestamptz;
alter table reviews add column if not exists approved_email_sent_at timestamptz;
alter table reviews alter column company_id drop not null;

create table if not exists company_replies (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  reply text not null,
  created_at timestamptz not null default now()
);

create table if not exists business_claims (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  brand_name text not null,
  contact_name text not null,
  contact_email text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_company_status_idx on reviews(company_id, status);
create index if not exists reviews_status_created_idx on reviews(status, created_at);

alter table companies enable row level security;
alter table reviews enable row level security;
alter table company_replies enable row level security;
alter table business_claims enable row level security;

drop policy if exists "Public can read companies" on companies;
create policy "Public can read companies" on companies
  for select using (true);

drop policy if exists "MVP admin can import companies" on companies;
create policy "MVP admin can import companies" on companies
  for insert with check (true);

drop policy if exists "MVP admin can update companies" on companies;
create policy "MVP admin can update companies" on companies
  for update using (true)
  with check (true);

drop policy if exists "Public can read approved reviews" on reviews;
create policy "Public can read approved reviews" on reviews
  for select using (status = 'approved');

drop policy if exists "MVP admin can read pending reviews" on reviews;
create policy "MVP admin can read pending reviews" on reviews
  for select using (status = 'pending');

drop policy if exists "Public can submit pending reviews" on reviews;
create policy "Public can submit pending reviews" on reviews
  for insert with check (
    status = 'pending'
    and is_verified = false
  );

drop policy if exists "MVP admin can import reviews" on reviews;
create policy "MVP admin can import reviews" on reviews
  for insert with check (status in ('pending', 'approved', 'rejected'));

drop policy if exists "MVP admin can moderate pending reviews" on reviews;
create policy "MVP admin can moderate pending reviews" on reviews
  for update using (status = 'pending')
  with check (
    status in ('pending', 'approved', 'rejected')
    and is_verified in (true, false)
  );

drop policy if exists "Public can read company replies" on company_replies;
create policy "Public can read company replies" on company_replies
  for select using (
    exists (
      select 1 from reviews
      where reviews.id = company_replies.review_id
      and reviews.status = 'approved'
    )
  );

drop policy if exists "Public can upload review images" on storage.objects;
create policy "Public can upload review images" on storage.objects
  for insert with check (bucket_id = 'review-images');

drop policy if exists "Public can read review images" on storage.objects;
create policy "Public can read review images" on storage.objects
  for select using (bucket_id = 'review-images');

create or replace function refresh_company_rating()
returns trigger as $$
declare
  affected_company_ids uuid[];
  affected_company_id uuid;
begin
  affected_company_ids := array_remove(array[
    case when tg_op in ('INSERT', 'UPDATE') then new.company_id else null end,
    case when tg_op in ('UPDATE', 'DELETE') then old.company_id else null end
  ], null);

  foreach affected_company_id in array affected_company_ids loop
  update companies
  set
    average_rating = coalesce((
      select round(avg(rating)::numeric, 1)
      from reviews
      where company_id = affected_company_id
      and status = 'approved'
    ), 0),
    review_count = (
      select count(*)
      from reviews
      where company_id = affected_company_id
      and status = 'approved'
    )
  where id = affected_company_id;
  end loop;

  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists reviews_refresh_company_rating on reviews;
create trigger reviews_refresh_company_rating
after insert or update or delete on reviews
for each row execute function refresh_company_rating();

update companies
set
  average_rating = coalesce((
    select round(avg(rating)::numeric, 1)
    from reviews
    where reviews.company_id = companies.id
    and reviews.status = 'approved'
  ), 0),
  review_count = (
    select count(*)
    from reviews
    where reviews.company_id = companies.id
    and reviews.status = 'approved'
  );

insert into companies (name, slug, website, category, description, average_rating, review_count)
values
  ('Oak & Nest', 'oak-and-nest', 'https://example.com', 'Living room furniture', 'Solid wood living room and dining furniture for homes worldwide.', 0, 0),
  ('Sofa Street', 'sofa-street', 'https://example.com', 'Sofas', 'Made-to-order sofas with nationwide delivery.', 0, 0),
  ('Bedroom Foundry', 'bedroom-foundry', 'https://example.com', 'Bedroom furniture', 'Wardrobes, beds and storage pieces with assembly options.', 0, 0),
  ('Garden Room Co.', 'garden-room-co', 'https://example.com', 'Outdoor furniture', 'Outdoor dining sets, loungers and garden storage.', 0, 0)
on conflict (slug) do nothing;

insert into companies (name, slug, website, category, description, average_rating, review_count)
values
  ('Weilai Concept', 'weilai-concept', 'https://www.weilaiconcept.com', 'Furniture brand', 'Furniture brand offering contemporary furniture and home pieces.', 0, 0),
  ('Rit Concept', 'rit-concept', 'https://www.ritconcept.com', 'Furniture brand', 'Furniture brand offering modern furniture and home interiors.', 0, 0),
  ('DC Concept', 'dc-concept', 'https://www.dcconcept.co.uk', 'Furniture brand', 'Furniture brand offering furniture and interior pieces.', 0, 0),
  ('Aviator Furniture', 'aviator-furniture', 'https://www.aviatormade.com', 'Aluminium furniture', 'Furniture brand focused on aviation-inspired aluminium furniture.', 0, 0),
  ('LE DI VITA', 'le-di-vita', 'https://www.ledivita.com', 'Home decor', 'Home and interior decor brand.', 0, 0)
on conflict (slug) do update
set
  name = excluded.name,
  website = excluded.website,
  category = excluded.category,
  description = excluded.description;
