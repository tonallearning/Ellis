-- Supabase default privileges granted service_role more than the workbench
-- needs when the first migration was applied. Narrow the live table.
revoke all on public.ellis_private_workbench from service_role;
grant select, insert, update on public.ellis_private_workbench to service_role;
