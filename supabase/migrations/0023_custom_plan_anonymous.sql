-- El plan Personalizado pasa a ser accesible también para quien todavía no
-- sabe qué necesita y ni siquiera tiene cuenta creada (antes exigía sesión
-- iniciada y un negocio ya dado de alta, lo que bloqueaba justo a quien más
-- necesita que le orienten). Mismo patrón que contact_messages.
alter table public.custom_plan_requests alter column business_id drop not null;
alter table public.custom_plan_requests add column name text;

create policy "custom_plan_requests: anyone can insert" on public.custom_plan_requests
  for insert with check (true);
