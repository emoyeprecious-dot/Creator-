module.exports = async function handler(req, res) {
  const slug = String(req.query?.slug || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9.-]{0,79}$/.test(slug)) { res.statusCode=400; return res.end("Invalid creator link."); }
  const supabaseUrl=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_PROJECT_URL||"";
  const anonKey=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
  let profile=null;
  if(supabaseUrl&&anonKey){try{
    const query=new URL("/rest/v1/creator_profiles",supabaseUrl);
    query.searchParams.set("select","display_name,slug,profile_image_path,is_published");
    query.searchParams.set("slug","eq."+slug);query.searchParams.set("is_published","eq.true");query.searchParams.set("limit","1");
    const response=await fetch(query,{headers:{apikey:anonKey,Authorization:"Bearer "+anonKey}});
    if(response.ok)profile=(await response.json())[0]||null;
  }catch(_){}}
  const name=String(profile?.display_name||slug).slice(0,80);
  const icon=profile?.profile_image_path?"/api/creator-icon?slug="+encodeURIComponent(slug):"/app-icon-512.png";
  const startUrl="/creator/"+encodeURIComponent(slug);
  const manifest={id:startUrl,name,short_name:name.slice(0,24),description:"Creator profile and published work.",start_url:startUrl,scope:startUrl,display:"standalone",display_override:["standalone","minimal-ui"],orientation:"any",background_color:"#111111",theme_color:"#111111",icons:[{src:icon,sizes:"192x192 512x512",purpose:"any"}]};
  res.setHeader("Content-Type","application/manifest+json; charset=utf-8");
  res.setHeader("Cache-Control","public, max-age=60, s-maxage=60, stale-while-revalidate=300");
  res.statusCode=200;return res.end(JSON.stringify(manifest));
};
