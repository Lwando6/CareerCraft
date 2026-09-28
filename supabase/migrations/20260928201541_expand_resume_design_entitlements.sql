-- Extend the saved resume-layout allowlists for the new two-column designs.

drop policy if exists "Users create entitled resumes" on public.resumes;
drop policy if exists "Users update entitled resumes" on public.resumes;

create policy "Users create entitled resumes"
on public.resumes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    (
      template_slug = 'corporate-accountant'
      and coalesce(content ->> 'design', 'classic') in ('classic', 'minimal')
      and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
      and coalesce(content ->> 'customTitle', '') = ''
      and coalesce(content ->> 'customContent', '') = ''
      and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'starter'
        and coalesce(content ->> 'design', 'classic') in ('classic', 'minimal', 'executive', 'skyline')
        and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
        and coalesce(content ->> 'customTitle', '') = ''
        and coalesce(content ->> 'customContent', '') = ''
        and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'pro'
        and coalesce(content ->> 'design', 'classic') in ('classic', 'minimal', 'executive', 'skyline', 'creative', 'midnight')
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
      and coalesce(content ->> 'design', 'classic') in ('classic', 'minimal')
      and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
      and coalesce(content ->> 'customTitle', '') = ''
      and coalesce(content ->> 'customContent', '') = ''
      and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'starter'
        and coalesce(content ->> 'design', 'classic') in ('classic', 'minimal', 'executive', 'skyline')
        and coalesce(jsonb_array_length(coalesce(content -> 'projects', '[]'::jsonb)), 0) = 0
        and coalesce(content ->> 'customTitle', '') = ''
        and coalesce(content ->> 'customContent', '') = ''
        and coalesce(content ->> 'theme', 'navy') = 'navy'
    )
    or exists (
      select 1 from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
        and s.plan_slug = 'pro'
        and coalesce(content ->> 'design', 'classic') in ('classic', 'minimal', 'executive', 'skyline', 'creative', 'midnight')
    )
  )
);
