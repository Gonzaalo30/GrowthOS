-- Racha máxima histórica: sin esto, un logro de "racha de 7 días" se
-- desbloquearía y luego desaparecería en cuanto se rompiera la racha actual,
-- lo cual es deshonesto (sí lo conseguiste, aunque hoy tu racha sea 0).
alter table public.businesses add column longest_streak int not null default 0;
update public.businesses set longest_streak = streak_count;

create or replace function public.register_business_activity(p_business_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_last date;
  v_today date := current_date;
begin
  select last_activity_date into v_last
  from public.businesses where id = p_business_id;

  if v_last = v_today then
    return;
  elsif v_last = v_today - 1 then
    update public.businesses
      set streak_count = streak_count + 1,
          last_activity_date = v_today,
          longest_streak = greatest(longest_streak, streak_count + 1)
      where id = p_business_id;
  else
    update public.businesses
      set streak_count = 1,
          last_activity_date = v_today,
          longest_streak = greatest(longest_streak, 1)
      where id = p_business_id;
  end if;
end;
$$;
