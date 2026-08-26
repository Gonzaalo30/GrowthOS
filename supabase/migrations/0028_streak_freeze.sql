-- Congelador de racha: hasta 2 comodines al mes que protegen la racha si se
-- pierde exactamente 1 día de actividad, en vez de romperla a la primera
-- (un mal día real no debería castigar duro una racha larga). No cubre
-- ausencias de 2+ días seguidos — para eso sigue reiniciándose a 1, igual
-- que antes.
alter table public.businesses
  add column streak_freezes_used int not null default 0,
  add column streak_freeze_month date not null default date_trunc('month', current_date)::date;

create or replace function public.register_business_activity(p_business_id uuid)
returns boolean
language plpgsql
security invoker
as $$
declare
  v_last date;
  v_today date := current_date;
  v_current_month date := date_trunc('month', current_date)::date;
  v_freeze_month date;
  v_freezes_used int;
  v_max_freezes constant int := 2;
begin
  select last_activity_date, streak_freeze_month, streak_freezes_used
    into v_last, v_freeze_month, v_freezes_used
  from public.businesses where id = p_business_id;

  -- Los comodines se renuevan cada mes natural.
  if v_freeze_month is distinct from v_current_month then
    v_freezes_used := 0;
  end if;

  if v_last = v_today then
    if v_freeze_month is distinct from v_current_month then
      update public.businesses
        set streak_freeze_month = v_current_month, streak_freezes_used = 0
        where id = p_business_id;
    end if;
    return false;
  elsif v_last = v_today - 1 then
    update public.businesses
      set streak_count = streak_count + 1,
          last_activity_date = v_today,
          longest_streak = greatest(longest_streak, streak_count + 1),
          streak_freeze_month = v_current_month,
          streak_freezes_used = v_freezes_used
      where id = p_business_id;
    return false;
  elsif v_last = v_today - 2 and v_freezes_used < v_max_freezes then
    -- Justo 1 día perdido y todavía quedan comodines este mes: se protege la
    -- racha en vez de reiniciarla.
    update public.businesses
      set streak_count = streak_count + 1,
          last_activity_date = v_today,
          longest_streak = greatest(longest_streak, streak_count + 1),
          streak_freeze_month = v_current_month,
          streak_freezes_used = v_freezes_used + 1
      where id = p_business_id;
    return true;
  else
    update public.businesses
      set streak_count = 1,
          last_activity_date = v_today,
          longest_streak = greatest(longest_streak, 1),
          streak_freeze_month = v_current_month,
          streak_freezes_used = v_freezes_used
      where id = p_business_id;
    return false;
  end if;
end;
$$;
