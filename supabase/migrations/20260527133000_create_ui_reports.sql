create table public.ui_reports (
  id uuid primary key default gen_random_uuid(),
  pathname text not null,
  message text not null,
  x_ratio double precision not null,
  y_ratio double precision not null,
  viewport_width integer not null,
  viewport_height integer not null,
  design_width integer not null default 1920,
  design_height integer not null default 1080,
  created_at timestamptz not null default now(),
  constraint ui_reports_pathname_check check (char_length(trim(pathname)) > 0),
  constraint ui_reports_message_check check (char_length(trim(message)) > 0),
  constraint ui_reports_x_ratio_check check (x_ratio >= 0 and x_ratio <= 1),
  constraint ui_reports_y_ratio_check check (y_ratio >= 0 and y_ratio <= 1)
);

create index ui_reports_pathname_created_idx on public.ui_reports (pathname, created_at desc);

alter table public.ui_reports enable row level security;

create policy "Anyone can read ui reports"
on public.ui_reports for select
using (true);

create policy "Anyone can submit ui reports"
on public.ui_reports for insert
with check (
  char_length(trim(pathname)) > 0
  and char_length(trim(message)) > 0
  and x_ratio >= 0
  and x_ratio <= 1
  and y_ratio >= 0
  and y_ratio <= 1
);
