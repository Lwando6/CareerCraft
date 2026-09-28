-- Paid access is derived only from verified subscription rows. Profile and
-- local-storage plan selections are intentionally excluded from authorization.

drop policy if exists "Users create own resumes" on public.resumes;
drop policy if exists "Users update own resumes" on public.resumes;

create policy "Users create entitled resumes"
on public.resumes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    (
      template_slug = 'corporate-accountant'
      and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
      and coalesce(content ->> 'customTitle', '') = ''
      and coalesce(content ->> 'customContent', '') = ''
      and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'starter'
        and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
        and coalesce(content ->> 'customTitle', '') = ''
        and coalesce(content ->> 'customContent', '') = ''
        and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'pro'
    )
  )
);

create policy "Users update entitled resumes"
on public.resumes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    (
      template_slug = 'corporate-accountant'
      and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
      and coalesce(content ->> 'customTitle', '') = ''
      and coalesce(content ->> 'customContent', '') = ''
      and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'starter'
        and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
        and coalesce(content ->> 'customTitle', '') = ''
        and coalesce(content ->> 'customContent', '') = ''
        and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'pro'
    )
  )
);

drop policy if exists "Users create own LinkedIn generations" on public.linkedin_generations;
drop policy if exists "Users update own LinkedIn generations" on public.linkedin_generations;

create policy "Pro users create own LinkedIn generations"
on public.linkedin_generations
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.plan_slug = 'pro'
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  )
);

create policy "Pro users update own LinkedIn generations"
on public.linkedin_generations
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.plan_slug = 'pro'
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.plan_slug = 'pro'
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  )
);
