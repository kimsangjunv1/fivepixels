alter table public.ui_reports
add column status text not null default 'open',
add column field_values jsonb not null default '{}'::jsonb,
add column replies jsonb not null default '[]'::jsonb;

alter table public.ui_reports
add constraint ui_reports_status_check check (status in ('open', 'resolved', 'archived')),
add constraint ui_reports_field_values_type_check check (jsonb_typeof(field_values) = 'object'),
add constraint ui_reports_replies_type_check check (jsonb_typeof(replies) = 'array');

create index ui_reports_pathname_status_created_idx on public.ui_reports (pathname, status, created_at desc);
