(function(){
'use strict';
const script=document.currentScript;
const storageKey=script?.dataset.storageKey||'artistic_country_currency_v1';
const countryCodes=("AD AE AF AG AI AL AM AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW").split(" ");
const displayNames=new Intl.DisplayNames(['en'],{type:'region'});
const currencyByCountry={DZ:'DZD',AO:'AOA',BJ:'XOF',BW:'BWP',BF:'XOF',BI:'BIF',CV:'CVE',CM:'XAF',CF:'XAF',TD:'XAF',KM:'KMF',CD:'CDF',CG:'XAF',CI:'XOF',DJ:'DJF',EG:'EGP',GQ:'XAF',ER:'ERN',SZ:'SZL',ET:'ETB',GA:'XAF',GM:'GMD',GH:'GHS',GN:'GNF',GW:'XOF',KE:'KES',LS:'LSL',LR:'LRD',LY:'LYD',MG:'MGA',MW:'MWK',ML:'XOF',MR:'MRU',MU:'MUR',MA:'MAD',MZ:'MZN',NA:'NAD',NE:'XOF',NG:'NGN',RW:'RWF',ST:'STN',SN:'XOF',SC:'SCR',SL:'SLE',SO:'SOS',ZA:'ZAR',SS:'SSP',SD:'SDG',TZ:'TZS',TG:'XOF',TN:'TND',UG:'UGX',ZM:'ZMW',ZW:'USD',US:'USD',GB:'GBP',CA:'CAD',AU:'AUD',NZ:'NZD',IN:'INR',CN:'CNY',JP:'JPY',KR:'KRW',AE:'AED',SA:'SAR',BR:'BRL',MX:'MXN',SG:'SGD',CH:'CHF',TR:'TRY',RU:'RUB',HK:'HKD',ID:'IDR',MY:'MYR',TH:'THB',PH:'PHP',PK:'PKR',BD:'BDT',IL:'ILS',NO:'NOK',SE:'SEK',DK:'DKK',PL:'PLN',CZ:'CZK',HU:'HUF',RO:'RON',BG:'BGN',IS:'ISK',AF:'AFN',AL:'ALL',AR:'ARS',AZ:'AZN',AM:'AMD',AW:'AWG',BS:'BSD',BH:'BHD',BD:'BDT',BB:'BBD',BZ:'BZD',BM:'BMD',BO:'BOB',BA:'BAM',BN:'BND',BG:'BGN',KH:'KHR',KY:'KYD',CL:'CLP',CO:'COP',CR:'CRC',CU:'CUP',CW:'ANG',DO:'DOP',SV:'USD',EC:'USD',FK:'FKP',FJ:'FJD',GE:'GEL',GI:'GIP',GT:'GTQ',GY:'GYD',HT:'HTG',HN:'HNL',IR:'IRR',IQ:'IQD',JM:'JMD',JO:'JOD',KZ:'KZT',KW:'KWD',KG:'KGS',LA:'LAK',LB:'LBP',MO:'MOP',MV:'MVR',MN:'MNT',MM:'MMK',NP:'NPR',NI:'NIO',OM:'OMR',PK:'PKR',PS:'ILS',PA:'PAB',PG:'PGK',PY:'PYG',PE:'PEN',QA:'QAR',MK:'MKD',MD:'MDL',RS:'RSD',BY:'BYN',TJ:'TJS',TW:'TWD',TT:'TTD',TM:'TMT',UA:'UAH',UY:'UYU',UZ:'UZS',VE:'VES',VN:'VND',YE:'YER',ZM:'ZMW',ZW:'USD',AO:'AOA',NE:'XOF',SD:'SDG',SS:'SSP'};
const euroCountries=new Set('AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK'.split(' '));
euroCountries.forEach(c=>currencyByCountry[c]='EUR');
const paymentCurrencies=new Set(['USD','GBP','EUR','NGN','GHS','KES','ZAR','UGX','RWF','TZS','EGP','XAF','XOF','MWK']);
const paymentMethods={NGN:'card, ussd, banktransfer, account, internetbanking, nqr, enaira, opay',GHS:'card, ghanamobilemoney',KES:'card, mpesa',ZAR:'card, account',UGX:'card, mobilemoneyuganda',RWF:'card, mobilemoneyrwanda',TZS:'card, mobilemoneytanzania',EGP:'card, fawrypay',XAF:'card, mobilemoneyxaf',XOF:'card, mobilemoneyxof',MWK:'card, mobilemoneymalawi',USD:'card, account',GBP:'card, account',EUR:'card, account'};
const names=countryCodes.map(code=>({code,name:displayNames.of(code)||code,currency:currencyByCountry[code]||'USD',paymentCurrency:paymentCurrencies.has(currencyByCountry[code]||'USD')?(currencyByCountry[code]||'USD'):'USD'})).sort((a,b)=>a.name.localeCompare(b.name));
const africanCodes=new Set('DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'.split(' '));
let selected=null;
let fixedRates={USD:1,NGN:1400};
let fixedRatesPromise=null;
function countryForCode(code){return names.find(x=>x.code===String(code||'').toUpperCase())||null;}
function loadSaved(){try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch(e){return null}}
function format(amount,currency){try{return new Intl.NumberFormat('en',{style:'currency',currency:String(currency||'USD').toUpperCase(),maximumFractionDigits:2}).format(Number(amount||0))}catch(e){return String(currency||'USD')+' '+Number(amount||0).toLocaleString()}}
function apply(country,save=true){
 if(!country)return;
 selected=country;
 window.ArtisticCountry={code:country.code,name:country.name,currency:country.currency,paymentCurrency:country.paymentCurrency,paymentOptions:paymentMethods[country.paymentCurrency]||'card, account',region:africanCodes.has(country.code)?'africa':'international'};
 const label=document.getElementById('countryPickerLabel');if(label)label.textContent=country.name+' · '+country.currency;
 const c=document.getElementById('checkoutCountryLabel');if(c)c.textContent=country.name;
 const cur=document.getElementById('checkoutCurrencyLabel');if(cur)cur.textContent=country.paymentCurrency;
 const adminSelect=document.getElementById('adminCountrySelect');if(adminSelect&&adminSelect.value!==country.code)adminSelect.value=country.code;
 const creatorSelect=document.querySelector('#profileForm select[name="countryCode"]');if(creatorSelect&&!creatorSelect.value)creatorSelect.value=country.code;
 if(save){try{localStorage.setItem(storageKey,JSON.stringify(country))}catch(e){}}
 window.dispatchEvent(new CustomEvent('artistic-country-change',{detail:window.ArtisticCountry}));
}
async function detect(){
 const saved=loadSaved();
 if(saved&&saved.code&&saved.currency){apply(countryForCode(saved.code)||saved,true);return;}
 let code='';
 try{const res=await fetch('https://ipapi.co/json/',{headers:{Accept:'application/json'}});if(res.ok){const data=await res.json();code=String(data.country_code||'').toUpperCase()}}catch(e){}
 if(!countryForCode(code)){try{const res=await fetch('https://ipwho.is/',{headers:{Accept:'application/json'}});if(res.ok){const data=await res.json();if(data.success)code=String(data.country_code||'').toUpperCase();}}catch(e){}}
 if(!countryForCode(code)){const locale=Intl.DateTimeFormat().resolvedOptions().locale||'';const m=locale.match(/-([A-Z]{2})(?:-|$)/);code=m?m[1]:'US'}
 apply(countryForCode(code)||countryForCode('US'),true);
}
async function ratesFor(){
 if(fixedRatesPromise)return fixedRatesPromise;
 fixedRatesPromise=(async()=>{
  const ready=window.creatorSupabaseReady;
  if(!ready)throw new Error('Currency settings are not available yet.');
  await ready;
  const config=window.creatorSupabase?.config;
  if(!config?.url||!config?.publishableKey)throw new Error('Currency settings are unavailable.');
  const response=await fetch(config.url.replace(/\\/$/,'')+'/functions/v1/flutterwave-payments',{
   method:'POST',headers:{'Content-Type':'application/json','apikey':config.publishableKey},
   body:JSON.stringify({action:'get-currency-rates'})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.ok||!data.rates)throw new Error(data.error||'Admin currency rates could not be loaded.');
  const next={USD:1};
  Object.entries(data.rates).forEach(([code,rate])=>{const value=Number(rate);if(Number.isFinite(value)&&value>0)next[String(code).toUpperCase()]=value;});
  fixedRates=next;
  return fixedRates;
 })().catch(error=>{fixedRatesPromise=null;throw error;});
 return fixedRatesPromise;
}
async function convertAmount(amount,from,to){
 const source=String(from||'USD').toUpperCase(),target=String(to||selected?.currency||'USD').toUpperCase(),value=Number(amount||0);
 if(!Number.isFinite(value))throw new Error('Invalid amount');
 if(source===target)return Math.round((value+Number.EPSILON)*100)/100;
 const table=await ratesFor(),sourceRate=Number(table[source]),targetRate=Number(table[target]);
 if(!Number.isFinite(sourceRate)||sourceRate<=0||!Number.isFinite(targetRate)||targetRate<=0)throw new Error('Admin has not configured a fixed exchange rate for '+(!sourceRate?source:target)+'.');
 return Math.round((value/sourceRate*targetRate+Number.EPSILON)*100)/100;
}
async function prepareCurrencies(currencies){
 const target=selected?.currency||'USD';
 await ratesFor();
 return target;
}
function formatLocal(amount,sourceCurrency){
 const target=selected?.currency||'USD',source=String(sourceCurrency||target).toUpperCase(),value=Number(amount||0);
 if(source===target)return format(value,target);
 const sourceRate=Number(fixedRates[source]),targetRate=Number(fixedRates[target]);
 if(Number.isFinite(sourceRate)&&sourceRate>0&&Number.isFinite(targetRate)&&targetRate>0)return format(value/sourceRate*targetRate,target);
 return format(value,source)+' · conversion unavailable';
}
function populateSelect(select,selectedCode){
 if(!select)return;
 const current=selectedCode||select.value;
 const groups={Africa:[],International:[]};
 names.forEach(x=>groups[africanCodes.has(x.code)?'Africa':'International'].push(x));
 select.innerHTML='<option value="">Choose country</option>'+Object.entries(groups).map(([label,items])=>'<optgroup label="'+label+'">'+items.map(x=>'<option value="'+x.code+'">'+x.name+' · '+x.currency+'</option>').join('')+'</optgroup>').join('');
 if(current&&countryForCode(current))select.value=current;
}
window.ArtisticCountryTools={countries:names,currencyForCountry:code=>countryForCode(code)?.currency||'USD',paymentCurrencyForCountry:code=>countryForCode(code)?.paymentCurrency||'USD',countryForCode,applyCountry:(code,save)=>apply(countryForCode(code),save!==false),detect,convertAmount,prepareCurrencies,formatLocal,populateSelect};
window.dispatchEvent(new Event('artistic-country-tools-ready'));
document.addEventListener('DOMContentLoaded',()=>{
 const picker=document.getElementById('countryPickerBtn'),search=document.getElementById('countrySearch'),list=document.getElementById('countryList');
 picker?.addEventListener('click',()=>{render(search?.value||'');document.getElementById('countryModal')?.classList.add('open');document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';search?.focus()});
 function render(q){const host=document.getElementById('countryList');if(!host)return;const query=String(q||'').trim().toLowerCase(),matches=names.filter(x=>!query||(x.name+' '+x.code+' '+x.currency).toLowerCase().includes(query));host.innerHTML=matches.map(x=>'<button type="button" class="country-option" data-country="'+x.code+'"><span>'+x.name+'</span><small>'+x.currency+'</small></button>').join('')||'<p class="lead">No countries found.</p>';}
 search?.addEventListener('input',()=>render(search.value));
 list?.addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(!b)return;const chosen=countryForCode(b.dataset.country);if(chosen)apply(chosen,true);document.getElementById('countryModal')?.classList.remove('open');if(!document.querySelector('.overlay.open')){document.documentElement.style.overflow='';document.body.style.overflow=''}});
 document.querySelectorAll('[data-close="countryModal"]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('countryModal')?.classList.remove('open');if(!document.querySelector('.overlay.open')){document.documentElement.style.overflow='';document.body.style.overflow=''}}));
});
detect();
})();