module.exports = async function handler(req, res) {
  const slug=String(req.query?.slug||"").trim().toLowerCase();
  const fallback=()=>{res.writeHead(302,{Location:"/app-icon.svg","Cache-Control":"public, max-age=60"});return res.end();};
  if(!/^[a-z0-9][a-z0-9.-]{0,79}$/.test(slug))return fallback();
  const supabaseUrl=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_PROJECT_URL||"";
  const anonKey=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"";
  if(!supabaseUrl||!anonKey)return fallback();
  try{
    const query=new URL("/rest/v1/creator_profiles",supabaseUrl);
    query.searchParams.set("select","profile_image_path,is_published");query.searchParams.set("slug","eq."+slug);query.searchParams.set("is_published","eq.true");query.searchParams.set("limit","1");
    const profileResponse=await fetch(query,{headers:{apikey:anonKey,Authorization:"Bearer "+anonKey}});
    if(!profileResponse.ok)throw new Error("Profile lookup failed");
    const profile=(await profileResponse.json())[0];const path=String(profile?.profile_image_path||"");
    if(!path||/^https?:\/\//i.test(path)||path.split("/").some(part=>part===".."))throw new Error("No uploaded profile icon");
    const encodedPath=path.split("/").map(encodeURIComponent).join("/");
    const imageUrl=supabaseUrl.replace(/\/$/,"")+"/storage/v1/object/public/creator-profiles/"+encodedPath;
    const imageResponse=await fetch(imageUrl);if(!imageResponse.ok)throw new Error("Profile icon unavailable");
    const contentType=imageResponse.headers.get("content-type")||"image/jpeg";
    if(!/^image\/(png|jpeg|webp|gif|svg\+xml)$/i.test(contentType))throw new Error("Unsupported profile icon");
    const bytes=Buffer.from(await imageResponse.arrayBuffer());if(!bytes.length||bytes.length>5*1024*1024)throw new Error("Invalid profile icon size");
    res.setHeader("Content-Type",contentType);res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Cache-Control","public, max-age=300, s-maxage=300, stale-while-revalidate=900");
    res.statusCode=200;return res.end(bytes);
  }catch(_){return fallback();}
};
