(function(){
'use strict';
const countryCodes=("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW").split(" ");
const displayNames=new Intl.DisplayNames(['en'],{type:'region'});
const currencyByCountry={NG:'NGN',GH:'GHS',KE:'KES',ZA:'ZAR',UG:'UGX',RW:'RWF',TZ:'TZS',EG:'EGP',CM:'XAF',CI:'XOF',SN:'XOF',ML:'XOF',BF:'XOF',NE:'XOF',TG:'XOF',BJ:'XOF',GW:'XOF',GB:'GBP',US:'USD',CA:'CAD',MW:'MWK',AU:'USD',NZ:'USD'};
const euroCountries=new Set('AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK'.split(' '));
euroCountries.forEach(c=>currencyByCountry[c]='EUR');
const paymentMethods={NGN:'card, ussd, banktransfer, account, internetbanking, nqr, enaira, opay',GHS:'card, ghanamobilemoney',KES:'card, mpesa',ZAR:'card, account',UGX:'card, mobilemoneyuganda',RWF:'card, mobilemoneyrwanda',TZS:'card, mobilemoneytanzania',EGP:'card, fawrypay',XAF:'card, mobilemoneyxaf',XOF:'card, mobilemoneyxof',MWK:'card, mobilemoneymalawi',USD:'card, account',GBP:'card, account',EUR:'card, account',CAD:'card',INR:'card',COP:'card',SLL:'card',ZMW:'card'};
const names=countryCodes.map(code=>({code,name:displayNames.of(code)||code,currency:currencyByCountry[code]||'USD'})).sort((a,b)=>a.name.localeCompare(b.name));
let selected=null;
function loadSaved(){try{return JSON.parse(localStorage.getItem('artistic_country_currency_v1')||'null')}catch(e){return null}}
function apply(country,save=true){
 selected=country;
 window.ArtisticCountry={code:country.code,name:country.name,currency:country.currency,paymentOptions:paymentMethods[country.currency]||'card, account'};
 const label=document.getElementById('countryPickerLabel');if(label)label.textContent=country.name;
 const c=document.getElementById('checkoutCountryLabel');if(c)c.textContent=country.name;
 const cur=document.getElementById('checkoutCurrencyLabel');if(cur)cur.textContent=country.currency;
 if(save){try{localStorage.setItem('artistic_country_currency_v1',JSON.stringify(country))}catch(e){}}
}
function render(q=''){
 const list=document.getElementById('countryList');if(!list)return;
 const query=q.trim().toLowerCase();
 const matches=names.filter(x=>!query||(x.name+' '+x.code+' '+x.currency).toLowerCase().includes(query));
 list.innerHTML=matches.map(x=>'<button type="button" class="country-option" data-country="'+x.code+'"><span>'+x.name+'</span><small>'+x.currency+'</small></button>').join('')||'<p class="lead">No countries found.</p>';
}
async function detect(){
 const saved=loadSaved();
 if(saved&&saved.code&&saved.currency){apply(saved,false);return;}
 let code='';
 try{const res=await fetch('https://ipapi.co/json/',{headers:{Accept:'application/json'}});if(res.ok){const data=await res.json();code=String(data.country_code||'').toUpperCase()}}catch(e){}
 if(!names.some(x=>x.code===code)){const locale=Intl.DateTimeFormat().resolvedOptions().locale||'';const m=locale.match(/-([A-Z]{2})(?:-|$)/);code=m?m[1]:'US'}
 apply(names.find(x=>x.code===code)||names.find(x=>x.code==='US'),true);
}
document.addEventListener('DOMContentLoaded',()=>{
 const picker=document.getElementById('countryPickerBtn'),search=document.getElementById('countrySearch'),list=document.getElementById('countryList');
 picker?.addEventListener('click',()=>{render(search?.value||'');document.getElementById('countryModal')?.classList.add('open');document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';search?.focus()});
 search?.addEventListener('input',()=>render(search.value));
 list?.addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(!b)return;const chosen=names.find(x=>x.code===b.dataset.country);if(chosen)apply(chosen,true);document.getElementById('countryModal')?.classList.remove('open');if(!document.querySelector('.overlay.open')){document.documentElement.style.overflow='';document.body.style.overflow=''}});
 document.querySelectorAll('[data-close="countryModal"]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('countryModal')?.classList.remove('open');if(!document.querySelector('.overlay.open')){document.documentElement.style.overflow='';document.body.style.overflow=''}}));
});
detect();
})();