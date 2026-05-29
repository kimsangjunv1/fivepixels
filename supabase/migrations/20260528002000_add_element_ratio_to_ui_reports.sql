alter table public.ui_reports
add column element_x_ratio double precision,
add column element_y_ratio double precision;

alter table public.ui_reports
add constraint ui_reports_element_x_ratio_check check (element_x_ratio is null or (element_x_ratio >= 0 and element_x_ratio <= 1)),
add constraint ui_reports_element_y_ratio_check check (element_y_ratio is null or (element_y_ratio >= 0 and element_y_ratio <= 1));
