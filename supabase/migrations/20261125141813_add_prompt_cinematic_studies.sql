alter table public.creations
  add column if not exists study_type text not null default 'prompt',
  add column if not exists story_emotion text not null default '',
  add column if not exists dramatic_function text not null default '',
  add column if not exists composition_movement text not null default '',
  add column if not exists camera_optics text not null default '',
  add column if not exists contrasting_choice text not null default '',
  add column if not exists lighting_set_diagram text not null default '';

alter table public.creations drop constraint if exists creations_study_type_check;
alter table public.creations add constraint creations_study_type_check check (study_type in ('prompt','cinematic'));

drop view if exists public.public_creator_creations;
drop function if exists private.get_public_creator_creations();

create function private.get_public_creator_creations()
returns table(
  id uuid, creator_id uuid, creator_slug text, title text, slug text,
  description text, narratives text, when_to_use text, film_grammar text,
  parameters_lens_profile text, compare_similar_shot text, cinematic_reference text,
  prompt text, access_type text, price numeric, currency text, category_id uuid,
  custom_category text, is_featured boolean, published_at timestamptz,
  likes_count integer, created_at timestamptz, updated_at timestamptz,
  study_type text, story_emotion text, dramatic_function text,
  composition_movement text, camera_optics text, contrasting_choice text,
  lighting_set_diagram text
)
language sql stable security definer
set search_path to 'pg_catalog','public','auth'
as $function$
  select c.id, c.creator_id, cp.slug, c.title, c.slug, c.description, c.narratives,
    c.when_to_use, c.film_grammar, c.parameters_lens_profile, c.compare_similar_shot,
    c.cinematic_reference,
    case when c.access_type = 'free' or exists (
      select 1 from public.content_entitlements e
      where e.user_id = auth.uid() and e.creator_id = c.creator_id and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
        and ((e.entitlement_type = 'one_time' and e.creation_id = c.id)
          or e.entitlement_type = 'subscription')
    ) then pp.prompt else null end,
    c.access_type, c.price, c.currency, c.category_id, c.custom_category,
    c.is_featured, c.published_at, c.likes_count, c.created_at, c.updated_at,
    c.study_type, c.story_emotion, c.dramatic_function, c.composition_movement,
    c.camera_optics, c.contrasting_choice, c.lighting_set_diagram
  from public.creations c
  join public.creator_profiles cp on cp.user_id = c.creator_id
  left join public.creation_public_prompts pp on pp.creation_id = c.id and pp.creator_id = c.creator_id
  where c.is_published = true and c.admin_hidden = false and cp.is_published = true;
$function$;

create view public.public_creator_creations with (security_invoker=true)
as select * from private.get_public_creator_creations();
grant usage on schema private to anon, authenticated;
grant execute on function private.get_public_creator_creations() to anon, authenticated;
grant select on public.public_creator_creations to anon, authenticated;

create or replace function private.is_public_creator_media(p_bucket_id text, p_object_path text)
returns boolean language sql stable security definer set search_path to ''
as $function$
  select exists (
    select 1 from public.creation_media cm
    join public.creations c on c.id = cm.creation_id and c.creator_id = cm.creator_id
    join public.creator_profiles cp on cp.user_id = c.creator_id
    where cm.bucket_id = p_bucket_id and cm.object_path = p_object_path
      and c.is_published = true and c.admin_hidden = false and cp.is_published = true
      and (
        cm.role = 'reference'
        or (cm.role = 'attachment' and (
          c.access_type = 'free'
          or exists (
            select 1 from public.content_entitlements e
            where e.user_id = auth.uid() and e.creator_id = c.creator_id and e.status = 'active'
              and (e.expires_at is null or e.expires_at > now())
              and ((e.entitlement_type = 'one_time' and e.creation_id = c.id)
                or e.entitlement_type = 'subscription')
          )
        ))
      )
  );
$function$;

drop policy if exists creation_media_public_published_read on public.creation_media;
create policy creation_media_public_published_read
on public.creation_media for select to anon, authenticated
using (role in ('reference','attachment') and private.is_public_creator_media(bucket_id, object_path));
