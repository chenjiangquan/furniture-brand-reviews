alter table business_claims
  add column if not exists approved_at timestamptz,
  add column if not exists widget_followup_status text,
  add column if not exists widget_followup_claimed_at timestamptz,
  add column if not exists widget_followup_sent_at timestamptz;

alter table business_claims
  add constraint business_claims_widget_followup_status_check
  check (widget_followup_status is null or widget_followup_status in ('pending', 'sending', 'sent', 'failed'));

create or replace function claim_due_business_widget_followups(p_limit integer default 25)
returns table (id uuid, brand_name text, contact_name text, contact_email text)
language sql
security definer
set search_path = public
as $$
  with candidates as (
    select claims.id
    from business_claims as claims
    where claims.status = 'approved'
      and claims.approved_at <= now() - interval '24 hours'
      and (
        claims.widget_followup_status in ('pending', 'failed')
        or (
          claims.widget_followup_status = 'sending'
          and claims.widget_followup_claimed_at < now() - interval '2 hours'
        )
      )
    order by claims.approved_at
    limit least(greatest(coalesce(p_limit, 25), 1), 100)
    for update skip locked
  ), claimed as (
    update business_claims as claims
    set widget_followup_status = 'sending',
        widget_followup_claimed_at = now()
    from candidates
    where claims.id = candidates.id
    returning claims.id, claims.brand_name, claims.contact_name, claims.contact_email
  )
  select claimed.id, claimed.brand_name, claimed.contact_name, claimed.contact_email
  from claimed;
$$;

revoke all on function claim_due_business_widget_followups(integer) from public, anon, authenticated;
grant execute on function claim_due_business_widget_followups(integer) to service_role;
