(async function(){
 try{
  const auth=await window.creatorAuthReady;
  const result=await auth.requireCreator();
  if(!result)return;
  const {data:creator,error}=await auth.client.from('creator_profiles').select('slug,display_name').eq('user_id',result.user.id).maybeSingle();
  if(error)throw error;
  const slug=creator?.slug||new URLSearchParams(location.search).get('creator')||'';
  if(!slug)throw new Error('Your creator profile is not ready yet. Please contact support.');
  localStorage.setItem('frameform_creator_session',JSON.stringify({slug,email:result.user.email,userId:result.user.id}));
  const key='frameform_creator_mvp_v1__'+slug;
  let old={};try{old=JSON.parse(localStorage.getItem(key)||'{}')}catch(e){}
  if(!old.account)localStorage.setItem(key,JSON.stringify({...old,profile:{...(old.profile||{}),name:creator?.display_name||result.profile.display_name||result.user.email.split('@')[0],slug},account:{name:creator?.display_name||result.profile.display_name,email:result.user.email,userId:result.user.id}}));
  const requested=new URLSearchParams(location.search).get('creator');
  if(requested&&requested!==slug)history.replaceState({},'',location.pathname+'?creator='+encodeURIComponent(slug));
 }catch(error){console.error('[Creator auth]',error);alert(error.message||'Please sign in to continue.');location.href='/creator-signup.html?mode=signin';}
})();