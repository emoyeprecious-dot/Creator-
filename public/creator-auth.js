(function(){
  const state={client:null};
  window.creatorAuth=state;
  window.creatorAuthReady=(async()=>{
    const client=await window.creatorSupabaseFor('creator');
    state.client=client;
    state.getUser=async()=>{const {data,error}=await client.auth.getUser();if(error)throw error;return data.user;};
    state.signOut=async()=>{const {error}=await client.auth.signOut();if(error)throw error;};
    state.requireCreator=async()=>{
      const user=await state.getUser();
      if(!user){location.href='/creator-signup.html?mode=signin';return null;}
      const {data,error}=await client.from('profiles').select('account_type,display_name').eq('id',user.id).maybeSingle();
      if(error)throw error;
      if(!data||data.account_type!=='creator'){await client.auth.signOut();throw new Error('This account does not have creator access.');}
      return {user,profile:data};
    };
    return state;
  })();
})();