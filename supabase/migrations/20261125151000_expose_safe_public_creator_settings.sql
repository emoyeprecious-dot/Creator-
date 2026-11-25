create or replace function private.get_public_creator_studio_settings()
returns table(creator_id uuid,categories jsonb,ads jsonb,extras jsonb,invites jsonb)
language sql stable security definer set search_path to 'pg_catalog','public'
as $function$
 select s.creator_id,coalesce(s.settings->'categories','[]'::jsonb),
 coalesce((select jsonb_agg(ad order by (ad->>'start') nulls last) from jsonb_array_elements(case when jsonb_typeof(s.settings->'ads')='array' then s.settings->'ads' else '[]'::jsonb end) as ad where ad->>'status' in ('active','scheduled')),'[]'::jsonb),
 coalesce(s.settings->'extras','{}'::jsonb),coalesce(s.settings->'invites','[]'::jsonb)
 from public.creator_studio_settings s join public.creator_profiles cp on cp.user_id=s.creator_id where cp.is_published=true;
$function$;
drop view if exists public.public_creator_studio_settings;
create view public.public_creator_studio_settings with (security_invoker=true) as select * from private.get_public_creator_studio_settings();
grant usage on schema private to anon,authenticated;
grant execute on function private.get_public_creator_studio_settings() to anon,authenticated;
grant select on public.public_creator_studio_settings to anon,authenticated;