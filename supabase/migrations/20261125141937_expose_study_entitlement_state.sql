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
  lighting_set_diagram text, has_access boolean
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
        and ((e.entitlement_type = 'one_time' and e.creation_id = c.id) or e.entitlement_type = 'subscription')
    ) then pp.prompt else null end,
    c.access_type, c.price, c.currency, c.category_id, c.custom_category,
    c.is_featured, c.published_at, c.likes_count, c.created_at, c.updated_at,
    c.study_type, c.story_emotion, c.dramatic_function, c.composition_movement,
    c.camera_optics, c.contrasting_choice, c.lighting_set_diagram,
    (c.access_type = 'free' or exists (
      select 1 from public.content_entitlements e
      where e.user_id = auth.uid() and e.creator_id = c.creator_id and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
        and ((e.entitlement_type = 'one_time' and e.creation_id = c.id) or e.entitlement_type = 'subscription')
    ))
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
