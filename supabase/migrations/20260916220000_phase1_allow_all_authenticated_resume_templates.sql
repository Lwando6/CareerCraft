drop policy if exists "Users create entitled resumes" on public.resumes;
drop policy if exists "Users update entitled resumes" on public.resumes;
drop policy if exists "Users create own resumes" on public.resumes;
drop policy if exists "Users update own resumes" on public.resumes;

create policy "Users create own resumes"
on public.resumes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update own resumes"
on public.resumes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.resumes to authenticated;

create index if not exists resumes_user_id_updated_at_idx
on public.resumes (user_id, updated_at desc);
