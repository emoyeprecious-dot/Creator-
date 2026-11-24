(async function(){
 try{
  const auth=await window.creatorAuthReady;
  const result=await auth.requireCreator();
  if(!result)return;
  const {data:creator,error}=await auth.client.from('creator_profiles').select('slug,display_name').eq('user_id',result.user.id).maybeSingle();
  if(error)throw error;
  if(!creator)throw new Error('Your creator profile is not ready yet. Please contact support.');
  const email=String(result.user.email||'').trim().toLowerCase();
  const emailHandle=email.split('@')[0].toLowerCase().replace(/[^a-z0-9.-]+/g,'-').replace(/^[.-]+|[.-]+$/g,'');
  const displayName=String(creator.display_name||result.profile.display_name||'').trim();
  const normalizedName=displayName.toLowerCase().normalize('NFKD').replace(/[^a-z0-9.-]+/g,'-').replace(/^[.-]+|[.-]+$/g,'');
  let slug=String(creator.slug||'').trim().toLowerCase();
  const emailAsSlug=!!emailHandle&&(slug===emailHandle||slug===email.replace(/[^a-z0-9.-]+/g,'-').replace(/^[.-]+|[.-]+$/g,''));
  if(!slug||emailAsSlug){
   const base=normalizedName&&normalizedName!==emailHandle?normalizedName.slice(0,50):'creator-'+result.user.id.slice(0,8);
   let candidate=base,n=1;
   while(true){const {data:match,error:matchError}=await auth.client.from('creator_profiles').select('user_id').eq('slug',candidate).neq('user_id',result.user.id).maybeSingle();if(matchError)throw matchError;if(!match)break;candidate=base+'-'+(++n);}
   const safeName=displayName&&normalizedName!==emailHandle?displayName:'Creator';
   const {error:updateError}=await auth.client.from('creator_profiles').update({slug:candidate,display_name:safeName}).eq('user_id',result.user.id);if(updateError)throw updateError;
   slug=candidate;
  }
  localStorage.setItem('frameform_creator_session',JSON.stringify({slug,userId:result.user.id}));
  const key='frameform_creator_mvp_v1__'+slug;
  let old={};try{old=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}
  const safeName=displayName&&normalizedName!==emailHandle?displayName:'Creator';
  const account={...(old.account||{}),name:safeName,userId:result.user.id};delete account.email;
  localStorage.setItem(key,JSON.stringify({...old,profile:{...(old.profile||{}),name:safeName,slug},account}));
  const requested=new URLSearchParams(location.search).get('creator');
  if(requested!==slug)history.replaceState({},'',location.pathname+'?creator='+encodeURIComponent(slug));
 }catch(error){console.error('[Creator auth]',error);alert(error.message||'Please sign in to continue.');location.href='/creator-signup.html?mode=signin';}
})();