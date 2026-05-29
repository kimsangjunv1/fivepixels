alter table public.ui_reports
add column report_id text,
add column report_type text not null default 'item';

update public.ui_reports
set report_id = concat('legacy-', id::text)
where report_id is null or trim(report_id) = '';

alter table public.ui_reports
alter column report_id set not null,
alter column report_id drop default;

alter table public.ui_reports
add constraint ui_reports_report_id_check check (char_length(trim(report_id)) > 0),
add constraint ui_reports_report_type_check check (report_type in ('group', 'item'));

create index ui_reports_pathname_type_idx on public.ui_reports (pathname, report_type, created_at desc);
