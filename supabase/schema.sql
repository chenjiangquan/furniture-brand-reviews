create extension if not exists "pgcrypto";

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'published' check (status in ('published', 'draft')),
  is_claimed boolean not null default false,
  auto_reply_enabled boolean not null default false,
  auto_reply_template text,
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
  last_review_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table companies add column if not exists logo_url text;
alter table companies add column if not exists status text not null default 'published' check (status in ('published', 'draft'));
alter table companies add column if not exists is_claimed boolean not null default false;
alter table companies add column if not exists auto_reply_enabled boolean not null default false;
alter table companies add column if not exists auto_reply_template text;
alter table companies add column if not exists favicon_url text;
alter table companies add column if not exists og_image_url text;
alter table companies add column if not exists cover_image_url text;
alter table companies add column if not exists website_screenshot_url text;
alter table companies add column if not exists last_review_at timestamptz;
alter table companies add column if not exists updated_at timestamptz not null default now();

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
  pending_brand_website text,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  content text not null,
  reviewer_name text not null,
  reviewer_email text not null,
  order_number text,
  product_type text,
  order_month text,
  delivery_experience text,
  customer_service_experience text,
  would_buy_again text,
  proof_image_url text,
  review_image_urls text[] default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_verified boolean not null default false,
  useful_count integer not null default 0,
  submitted_email_sent_at timestamptz,
  approved_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table reviews add column if not exists order_number text;
alter table reviews add column if not exists product_type text;
alter table reviews add column if not exists order_month text;
alter table reviews add column if not exists delivery_experience text;
alter table reviews add column if not exists customer_service_experience text;
alter table reviews add column if not exists would_buy_again text;
alter table reviews add column if not exists proof_image_url text;
alter table reviews add column if not exists review_image_urls text[] default '{}';
alter table reviews add column if not exists is_verified boolean not null default false;
alter table reviews add column if not exists useful_count integer not null default 0;
alter table reviews add column if not exists status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'));
alter table reviews add column if not exists pending_brand_name text;
alter table reviews add column if not exists pending_brand_slug text;
alter table reviews add column if not exists pending_brand_website text;
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

create table if not exists business_login_tokens (
  id uuid primary key default gen_random_uuid(),
  contact_email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists review_flags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  reason text not null,
  details text,
  reported_by_email text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  seo_title text,
  seo_description text,
  cover_image_url text,
  cover_image_alt text,
  category text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  allow_index boolean not null default false,
  generated_by text,
  generation_topic text,
  generation_notes text,
  needs_review boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blogs add column if not exists excerpt text;
alter table blogs add column if not exists content text;
alter table blogs add column if not exists seo_title text;
alter table blogs add column if not exists seo_description text;
alter table blogs add column if not exists cover_image_url text;
alter table blogs add column if not exists cover_image_alt text;
alter table blogs add column if not exists category text;
alter table blogs add column if not exists status text not null default 'draft' check (status in ('draft', 'published'));
alter table blogs add column if not exists allow_index boolean not null default false;
alter table blogs add column if not exists generated_by text;
alter table blogs add column if not exists generation_topic text;
alter table blogs add column if not exists generation_notes text;
alter table blogs add column if not exists needs_review boolean not null default false;
alter table blogs add column if not exists published_at timestamptz;
alter table blogs add column if not exists created_at timestamptz not null default now();
alter table blogs add column if not exists updated_at timestamptz not null default now();

create table if not exists blog_auto_draft_logs (
  id uuid primary key default gen_random_uuid(),
  ran_at timestamptz not null default now(),
  status text not null check (status in ('success', 'failed', 'skipped')),
  topic_type text,
  topic_title text,
  slug text,
  message text
);

create index if not exists reviews_company_status_idx on reviews(company_id, status);
create index if not exists reviews_status_created_idx on reviews(status, created_at);
create index if not exists blogs_status_published_idx on blogs(status, published_at);
create index if not exists blog_auto_draft_logs_ran_at_idx on blog_auto_draft_logs(ran_at desc);
create index if not exists review_flags_status_created_idx on review_flags(status, created_at);
create index if not exists review_flags_review_idx on review_flags(review_id);
create index if not exists business_login_tokens_email_idx on business_login_tokens(contact_email, expires_at);

with duplicate_replies as (
  select id, row_number() over (partition by review_id order by created_at desc, id desc) as reply_rank
  from company_replies
)
delete from company_replies
where id in (select id from duplicate_replies where reply_rank > 1);

create unique index if not exists company_replies_review_id_key on company_replies(review_id);

alter table companies enable row level security;
alter table reviews enable row level security;
alter table company_replies enable row level security;
alter table business_claims enable row level security;
alter table blogs enable row level security;
alter table blog_auto_draft_logs enable row level security;
alter table review_flags enable row level security;
alter table business_login_tokens enable row level security;

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

drop policy if exists "Public can read published blogs" on blogs;
create policy "Public can read published blogs" on blogs
  for select using (status = 'published');

drop policy if exists "MVP admin can insert blog auto draft logs" on blog_auto_draft_logs;
create policy "MVP admin can insert blog auto draft logs" on blog_auto_draft_logs
  for insert with check (true);

drop policy if exists "MVP admin can read blog auto draft logs" on blog_auto_draft_logs;
create policy "MVP admin can read blog auto draft logs" on blog_auto_draft_logs
  for select using (true);

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

drop policy if exists "Public can submit business claims" on business_claims;
create policy "Public can submit business claims" on business_claims
  for insert with check (status = 'pending');

drop policy if exists "MVP admin can read business claims" on business_claims;
create policy "MVP admin can read business claims" on business_claims
  for select using (true);

drop policy if exists "MVP admin can update business claims" on business_claims;
create policy "MVP admin can update business claims" on business_claims
  for update using (true)
  with check (status in ('pending', 'approved', 'rejected'));

drop policy if exists "MVP admin can read review flags" on review_flags;
create policy "MVP admin can read review flags" on review_flags
  for select using (true);

drop policy if exists "Business users can submit review flags" on review_flags;
create policy "Business users can submit review flags" on review_flags
  for insert with check (status = 'pending');

drop policy if exists "MVP admin can update review flags" on review_flags;
create policy "MVP admin can update review flags" on review_flags
  for update using (true)
  with check (status in ('pending', 'reviewed', 'dismissed'));

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
    ),
    last_review_at = (
      select max(created_at)
      from reviews
      where company_id = affected_company_id
      and status = 'approved'
    ),
    updated_at = now()
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
  ),
  last_review_at = (
    select max(created_at)
    from reviews
    where reviews.company_id = companies.id
    and reviews.status = 'approved'
  ),
  updated_at = now();

create or replace view company_review_stats as
select
  companies.id as company_id,
  companies.slug,
  coalesce(round(avg(reviews.rating)::numeric, 1), 0) as average_rating,
  count(reviews.id)::integer as approved_review_count,
  count(*) filter (where reviews.rating = 5)::integer as five_star_count,
  count(*) filter (where reviews.rating = 4)::integer as four_star_count,
  count(*) filter (where reviews.rating = 3)::integer as three_star_count,
  count(*) filter (where reviews.rating = 2)::integer as two_star_count,
  count(*) filter (where reviews.rating = 1)::integer as one_star_count,
  max(reviews.created_at) as last_review_at
from companies
left join reviews
  on reviews.company_id = companies.id
  and reviews.status = 'approved'
group by companies.id, companies.slug;

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
