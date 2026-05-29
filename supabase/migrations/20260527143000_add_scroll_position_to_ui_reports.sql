alter table public.ui_reports
add column scroll_y integer not null default 0,
add column document_y integer not null default 0;

update public.ui_reports
set document_y = greatest(0, round(y_ratio * viewport_height));

alter table public.ui_reports
alter column scroll_y drop default,
alter column document_y drop default;
