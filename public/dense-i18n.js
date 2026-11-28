(function(){
'use strict';
const ENDPOINT='https://mevzzvpddflbduavwggo.supabase.co/functions/v1/translate';
const SPLIT='\n⟦DENSE_TRANSLATE_SPLIT_91A7⟧\n';
const textState=new WeakMap(),attrState=new WeakMap();
const cache=new Map();
let activeLanguage='en',working=false,scheduled=false,observer=null;
const skipTags=new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','INPUT','SELECT','OPTION','CODE','PRE','SVG','PATH']);
function config(){return window.creatorSupabase?.config||window.creatorSupabaseConfig||{};}
function cacheKey(lang,text){return lang+'|'+text;}
function cached(lang,text){const k=cacheKey(lang,text);if(cache.has(k))return cache.get(k);try{const v=localStorage.getItem('dense_i18n_'+encodeURIComponent(k));if(v){cache.set(k,v);return v}}catch(e){}return null;}
function remember(lang,source,value){const k=cacheKey(lang,source);cache.set(k,value);try{localStorage.setItem('dense_i18n_'+encodeURIComponent(k),value)}catch(e){}}
async function translateBatch(values,target){
 const joined=values.join(SPLIT),cfg=config();
 if(!cfg.url||!cfg.publishableKey)throw new Error('Translation connection is not ready');
 const response=await fetch(cfg.url.replace(/\/$/,'')+'/functions/v1/translate',{
  method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.publishableKey},
  body:JSON.stringify({text:joined,source:'en',target})
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok||typeof data.translatedText!=='string')throw new Error(data.error||'Translation unavailable');
 const parts=data.translatedText.split(SPLIT);
 if(parts.length!==values.length)throw new Error('Translation batch could not be safely separated');
 return parts;
}
function collectText(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const found=[];let node;
 while((node=walker.nextNode())){
  const parent=node.parentElement;if(!parent||skipTags.has(parent.tagName)||parent.closest('[translate="no"],.notranslate,[contenteditable="true"]'))continue;
  const value=(textState.get(node)?.original??node.nodeValue??'').trim();
  if(!value||value.length>260||!/[\p{L}\p{N}]/u.test(value))continue;
  const state=textState.get(node);if(state?.target===activeLanguage)continue;
  found.push({node,source:value,original:state?.original??node.nodeValue});
 }
 return found;
}
function collectAttributes(){
 const attrs=['placeholder','aria-label','title','alt'];
 const found=[];
 document.querySelectorAll('input,button,a,img,textarea,[role="button"]').forEach(el=>{
  if(el.closest('[translate="no"],.notranslate'))return;
  attrs.forEach(name=>{const value=el.getAttribute(name);if(!value||value.length>180)return;let state=attrState.get(el);if(!state){state={};attrState.set(el,state)}const original=state[name]?.original??value;if(state[name]?.target===activeLanguage)return;found.push({el,name,source:original,state});});
 });
 return found;
}
async function translateTextNodes(){
 const nodes=collectText(),groups=[];let pending=[],pendingLength=0;
 for(const item of nodes){if(pending.length&&(pending.length>=7||pendingLength+item.source.length+SPLIT.length>4300)){groups.push(pending);pending=[];pendingLength=0;}pending.push(item);pendingLength+=item.source.length+SPLIT.length;}
 if(pending.length)groups.push(pending);
 for(const group of groups){
  const missing=[],missingNodes=[];
  group.forEach(item=>{const hit=cached(activeLanguage,item.source);if(hit!==null){item.node.nodeValue=item.original.replace(item.original.trim(),hit);textState.set(item.node,{original:item.original,target:activeLanguage});}else{missing.push(item.source);missingNodes.push(item)}});
  if(!missing.length)continue;
  try{const translated=await translateBatch(missing,activeLanguage);translated.forEach((value,index)=>{const item=missingNodes[index];remember(activeLanguage,item.source,value);item.node.nodeValue=item.original.replace(item.original.trim(),value);textState.set(item.node,{original:item.original,target:activeLanguage});});}
  catch(error){console.warn('[Dense translation] Batch skipped:',error.message);for(const item of missingNodes){try{const single=await translateBatch([item.source],activeLanguage);remember(activeLanguage,item.source,single[0]);item.node.nodeValue=item.original.replace(item.original.trim(),single[0]);textState.set(item.node,{original:item.original,target:activeLanguage});}catch(e){return;}}}
 }
}
async function translateAttrs(){
 const items=collectAttributes();
 for(const item of items){const hit=cached(activeLanguage,item.source);if(hit!==null){item.el.setAttribute(item.name,hit);item.state[item.name]={original:item.source,target:activeLanguage};}}
 const pending=items.filter(item=>item.state[item.name]?.target!==activeLanguage);
 for(let i=0;i<pending.length;i+=7){const group=pending.slice(i,i+7);try{const translated=await translateBatch(group.map(x=>x.source),activeLanguage);translated.forEach((value,index)=>{const item=group[index];remember(activeLanguage,item.source,value);item.el.setAttribute(item.name,value);item.state[item.name]={original:item.source,target:activeLanguage};});}catch(e){break;}}
}
async function applyLanguage(code){
 const target=String(code||'en').toLowerCase();if(!/^[a-z]{2,3}$/.test(target))return;
 activeLanguage=target;document.documentElement.lang=target;document.documentElement.dir=['ar','he','fa','ur'].includes(target)?'rtl':'ltr';
 document.querySelectorAll('[data-dense-translated]').forEach(el=>el.removeAttribute('data-dense-translated'));
 if(target==='en'){restoreOriginals();return;}
 if(working)return;working=true;
 try{await translateTextNodes();await translateAttrs();}finally{working=false;}
}
function restoreOriginals(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){const state=textState.get(node);if(state){node.nodeValue=state.original;textState.set(node,{original:state.original,target:'en'});}}
 document.querySelectorAll('input,button,a,img,textarea,[role="button"]').forEach(el=>{const state=attrState.get(el);if(state)Object.entries(state).forEach(([name,value])=>{if(value?.original)el.setAttribute(name,value.original);state[name]={original:value.original,target:'en'};});});
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(activeLanguage!=='en')applyLanguage(activeLanguage);});}
window.addEventListener('dense-language-change',event=>applyLanguage(event.detail?.code||'en'));
document.addEventListener('DOMContentLoaded',()=>{
 observer=new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length))schedule();});
 observer.observe(document.body,{childList:true,subtree:true});
 const language=window.DenseLanguage?.code||'en';if(language!=='en')applyLanguage(language);
});
if(document.readyState==='interactive'||document.readyState==='complete'){const language=window.DenseLanguage?.code||'en';if(language!=='en')applyLanguage(language);}
})();