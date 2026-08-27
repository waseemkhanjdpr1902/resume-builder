create table if not exists public.academy_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null check (char_length(course_slug) between 2 and 120),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

create table if not exists public.academy_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null check (char_length(course_slug) between 2 and 120),
  lesson_slug text not null check (char_length(lesson_slug) between 2 and 120),
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, course_slug, lesson_slug)
);

create index if not exists academy_enrollments_user_idx on public.academy_enrollments(user_id);
create index if not exists academy_progress_user_course_idx on public.academy_lesson_progress(user_id, course_slug);

alter table public.academy_enrollments enable row level security;
alter table public.academy_lesson_progress enable row level security;

create policy "Academy enrolments are owned by the learner" on public.academy_enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Academy progress is owned by the learner" on public.academy_lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.academy_enrollments to authenticated;
grant select, insert, update, delete on public.academy_lesson_progress to authenticated;
