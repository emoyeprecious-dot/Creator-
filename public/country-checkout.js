(function(){
'use strict';
const script=document.currentScript;
const storageKey=script?.dataset.storageKey||'artistic_country_currency_v1';
const countryCodes=("AD AE AF AG AI AL AM AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW").split(" ");
const displayNames=new Intl.DisplayNames(['en'],{type:'region'});
const currencyByCountry={DZ:'DZD',AO:'AOA',BJ:'XOF',BW:'BWP',BF:'XOF',BI:'BIF',CV:'CVE',CM:'XAF',CF:'XAF',TD:'XAF',KM:'KMF',CD:'CDF',CG:'XAF',CI:'XOF',DJ:'DJF',EG:'EGP',GQ:'XAF',ER:'ERN',SZ:'SZL',ET:'ETB',GA:'XAF',GM:'GMD',GH:'GHS',GN:'GNF',GW:'XOF',KE:'KES',LS:'LSL',LR:'LRD',LY:'LYD',MG:'MGA',MW:'MWK',ML:'XOF',MR:'MRU',MU:'MUR',MA:'MAD',MZ:'MZN',NA:'NAD',NE:'XOF',NG:'NGN',RW:'RWF',ST:'STN',SN:'XOF',SC:'SCR',SL:'SLE',SO:'SOS',ZA:'ZAR',SS:'SSP',SD:'SDG',TZ:'TZS',TG:'XOF',TN:'TND',UG:'UGX',ZM:'ZMW',ZW:'USD',US:'USD',GB:'GBP',CA:'CAD',AU:'AUD',NZ:'NZD',IN:'INR',CN:'CNY',JP:'JPY',KR:'KRW',AE:'AED',SA:'SAR',BR:'BRL',MX:'MXN',SG:'SGD',CH:'CHF',TR:'TRY',RU:'RUB',HK:'HKD',ID:'IDR',MY:'MYR',TH:'THB',PH:'PHP',PK:'PKR',BD:'BDT',IL:'ILS',NO:'NOK',SE:'SEK',DK:'DKK',PL:'PLN',CZ:'CZK',HU:'HUF',RO:'RON',BG:'BGN',IS:'ISK',AD:'EUR',AI:'XCD',AG:'XCD',AS:'USD',AX:'EUR',BL:'EUR',BQ:'USD',BV:'NOK',CC:'AUD',CK:'NZD',CW:'ANG',CX:'AUD',DM:'XCD',DO:'DOP',FK:'FKP',FO:'DKK',GF:'EUR',GG:'GBP',GL:'DKK',GD:'XCD',GP:'EUR',GS:'GBP',GU:'USD',GY:'GYD',HM:'AUD',HT:'HTG',IO:'USD',JE:'GBP',KI:'AUD',KN:'XCD',KP:'KPW',KY:'KYD',LI:'CHF',MC:'EUR',MF:'EUR',MH:'USD',MK:'MKD',MP:'USD',MQ:'EUR',MS:'XCD',NC:'XPF',NF:'AUD',NR:'AUD',NU:'NZD',PN:'NZD',PR:'USD',PW:'USD',RE:'EUR',SB:'SBD',SH:'SHP',SJ:'NOK',SM:'EUR',SX:'ANG',TC:'USD',TF:'EUR',TL:'USD',TO:'TOP',TT:'TTD',TV:'AUD',UM:'USD',VA:'EUR',VC:'XCD',VG:'USD',VI:'USD',VU:'VUV',WF:'XPF',WS:'WST',YE:'YER',YT:'EUR',AQ:'USD',EH:'MAD',FM:'USD',IM:'GBP',LC:'XCD',LK:'LKR',ME:'EUR',PF:'XPF',PM:'EUR',SR:'SRD',SY:'SYP',TK:'NZD',BT:'BTN',AF:'AFN',AL:'ALL',AR:'ARS',AZ:'AZN',AM:'AMD',AW:'AWG',BS:'BSD',BH:'BHD',BD:'BDT',BB:'BBD',BZ:'BZD',BM:'BMD',BO:'BOB',BA:'BAM',BN:'BND',BG:'BGN',KH:'KHR',KY:'KYD',CL:'CLP',CO:'COP',CR:'CRC',CU:'CUP',CW:'ANG',DO:'DOP',SV:'USD',EC:'USD',FK:'FKP',FJ:'FJD',GE:'GEL',GI:'GIP',GT:'GTQ',GY:'GYD',HT:'HTG',HN:'HNL',IR:'IRR',IQ:'IQD',JM:'JMD',JO:'JOD',KZ:'KZT',KW:'KWD',KG:'KGS',LA:'LAK',LB:'LBP',MO:'MOP',MV:'MVR',MN:'MNT',MM:'MMK',NP:'NPR',NI:'NIO',OM:'OMR',PK:'PKR',PS:'ILS',PA:'PAB',PG:'PGK',PY:'PYG',PE:'PEN',QA:'QAR',MK:'MKD',MD:'MDL',RS:'RSD',BY:'BYN',TJ:'TJS',TW:'TWD',TT:'TTD',TM:'TMT',UA:'UAH',UY:'UYU',UZ:'UZS',VE:'VES',VN:'VND',YE:'YER',ZM:'ZMW',ZW:'USD',AO:'AOA',NE:'XOF',SD:'SDG',SS:'SSP'};
const euroCountries=new Set('AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK'.split(' '));
euroCountries.forEach(c=>currencyByCountry[c]='EUR');
const paymentCurrencies=new Set(['USD','GBP','EUR','NGN','GHS','KES','ZAR','UGX','RWF','TZS','EGP','XAF','XOF','MWK']);
const paymentMethods={NGN:'card, ussd, banktransfer, account, internetbanking, nqr, enaira, opay',GHS:'card, ghanamobilemoney',KES:'card, mpesa',ZAR:'card, account',UGX:'card, mobilemoneyuganda',RWF:'card, mobilemoneyrwanda',TZS:'card, mobilemoneytanzania',EGP:'card, fawrypay',XAF:'card, mobilemoneyxaf',XOF:'card, mobilemoneyxof',MWK:'card, mobilemoneymalawi',USD:'card, account',GBP:'card, account',EUR:'card, account'};
const names=countryCodes.map(code=>({code,name:displayNames.of(code)||code,currency:currencyByCountry[code]||'USD',paymentCurrency:paymentCurrencies.has(currencyByCountry[code]||'USD')?(currencyByCountry[code]||'USD'):'USD'})).sort((a,b)=>a.name.localeCompare(b.name));
const africanCodes=new Set('DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'.split(' '));
const countryLanguage={NG:'en',GH:'en',GM:'en',LR:'en',SL:'en',ZA:'en',KE:'en',UG:'en',TZ:'en',ZW:'en',ZM:'en',MW:'en',NA:'en',BW:'en',LS:'en',SZ:'en',SS:'en',SD:'ar',EG:'ar',DZ:'ar',MA:'ar',TN:'ar',LY:'ar',MR:'ar',DJ:'ar',SO:'ar',SA:'ar',AE:'ar',QA:'ar',KW:'ar',BH:'ar',OM:'ar',YE:'ar',IQ:'ar',JO:'ar',LB:'ar',PS:'ar',SY:'ar',CI:'fr',SN:'fr',BF:'fr',NE:'fr',ML:'fr',TG:'fr',BJ:'fr',GN:'fr',GW:'pt',CD:'fr',CG:'fr',CF:'fr',TD:'fr',CM:'fr',GA:'fr',GQ:'es',MG:'fr',RW:'en',BI:'fr',ET:'en',AO:'pt',MZ:'pt',CV:'pt',ST:'pt',BR:'pt',PT:'pt',CN:'zh',TW:'zh',HK:'zh',JP:'ja',KR:'ko',IN:'hi',PK:'en',BD:'en',ID:'id',MY:'en',TH:'en',VN:'en',RU:'ru',UA:'uk',TR:'tr',DE:'de',AT:'de',CH:'de',FR:'fr',BE:'fr',LU:'fr',ES:'es',MX:'es',AR:'es',CL:'es',CO:'es',PE:'es',IT:'it',NL:'nl',PL:'pl',CZ:'cs',SK:'sk',RO:'ro',BG:'bg',GR:'el',SE:'sv',NO:'nb',DK:'da',FI:'fi',HU:'hu',IL:'he'};
const languageOptions=[{code:'en',name:'English'},{code:'fr',name:'Français'},{code:'es',name:'Español'},{code:'ar',name:'العربية'},{code:'pt',name:'Português'},{code:'de',name:'Deutsch'},{code:'it',name:'Italiano'},{code:'nl',name:'Nederlands'},{code:'ru',name:'Русский'},{code:'uk',name:'Українська'},{code:'zh',name:'中文'},{code:'ja',name:'日本語'},{code:'ko',name:'한국어'},{code:'hi',name:'हिन्दी'},{code:'id',name:'Bahasa Indonesia'},{code:'tr',name:'Türkçe'},{code:'pl',name:'Polski'},{code:'cs',name:'Čeština'},{code:'el',name:'Ελληνικά'},{code:'sv',name:'Svenska'},{code:'da',name:'Dansk'},{code:'fi',name:'Suomi'},{code:'hu',name:'Magyar'},{code:'he',name:'עברית'},];
const languageStorageKey='dense_language_preference_v1';
fetch('https://dence-translate.onrender.com/languages',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(7000)}).then(response=>{if(!response.ok)throw new Error('Language list unavailable');return response.json()}).then(items=>{if(!Array.isArray(items)||!items.length)return;const display=new Intl.DisplayNames(['en'],{type:'language'});const available=items.map(item=>{const code=String(item.code||'').toLowerCase();return {code,name:String(item.name||display.of(code)||code)}}).filter(item=>/^[a-z]{2,3}$/.test(item.code));if(available.length)languageOptions.splice(0,languageOptions.length,...available);if(window.DenseLanguage&&!languageOptions.some(item=>item.code===window.DenseLanguage.code))applyLanguage('en',false);window.dispatchEvent(new Event('dense-languages-updated'));}).catch(()=>{});
function languageForCountry(code){return countryLanguage[String(code||'').toUpperCase()]||'en';}
function languageName(code){return languageOptions.find(x=>x.code===code)?.name||'English';}
function savedLanguage(){try{return JSON.parse(localStorage.getItem(languageStorageKey)||'null')}catch(e){return null}}
function applyLanguage(code,manual=true,persist=true){const valid=languageOptions.some(x=>x.code===code)?code:'en';window.DenseLanguage={code:valid,name:languageName(valid),manual:!!manual};if(manual&&persist){try{localStorage.setItem(languageStorageKey,JSON.stringify({code:valid,manual:true}))}catch(e){}}const label=document.getElementById('languagePickerLabel');if(label)label.textContent=languageName(valid);const studioLabel=document.getElementById('studioLanguagePickerLabel');if(studioLabel)studioLabel.textContent=languageName(valid);window.dispatchEvent(new CustomEvent('dense-language-change',{detail:window.DenseLanguage}));}

let selected=null;
let liveRates={};
let ratePromises={};
function countryForCode(code){return names.find(x=>x.code===String(code||'').toUpperCase())||null;}
function loadSaved(){try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch(e){return null}}
function format(amount,currency){try{return new Intl.NumberFormat('en',{style:'currency',currency:String(currency||'USD').toUpperCase(),maximumFractionDigits:2}).format(Number(amount||0))}catch(e){return String(currency||'USD')+' '+Number(amount||0).toLocaleString()}}
function apply(country,save=true,manual=true){
 if(!country)return;
 selected=country;
 window.ArtisticCountry={code:country.code,name:country.name,currency:country.currency,paymentCurrency:country.paymentCurrency,paymentOptions:paymentMethods[country.paymentCurrency]||'card, account',region:africanCodes.has(country.code)?'africa':'international',languageCode:languageForCountry(country.code),languageName:languageName(languageForCountry(country.code))};const preferred=savedLanguage();if(!preferred?.manual)applyLanguage(languageForCountry(country.code),false);else applyLanguage(preferred.code,false);
 const label=document.getElementById('countryPickerLabel');if(label)label.textContent=country.name+' · '+country.currency;const studioCountryLabel=document.getElementById('studioCountryPickerLabel');if(studioCountryLabel)studioCountryLabel.textContent=country.name+' · '+country.currency;
 const c=document.getElementById('checkoutCountryLabel');if(c)c.textContent=country.name;
 const cur=document.getElementById('checkoutCurrencyLabel');if(cur)cur.textContent=country.paymentCurrency;
 const adminSelect=document.getElementById('adminCountrySelect');if(adminSelect&&adminSelect.value!==country.code)adminSelect.value=country.code;
 const creatorSelect=document.querySelector('#profileForm select[name="countryCode"]');if(creatorSelect&&!creatorSelect.value)creatorSelect.value=country.code;
 if(save){try{localStorage.setItem(storageKey,JSON.stringify({...country,manual:!!manual}))}catch(e){}}
 window.dispatchEvent(new CustomEvent('artistic-country-change',{detail:{...window.ArtisticCountry,manual:!!manual}}));
}
async function detect(){
 const saved=loadSaved();
 if(saved&&saved.code&&saved.currency&&(saved.manual===true||typeof saved.manual==='undefined')){apply(countryForCode(saved.code)||saved,true,false);return;}
 let code='';
 try{const res=await fetch('https://ipapi.co/json/',{headers:{Accept:'application/json'}});if(res.ok){const data=await res.json();code=String(data.country_code||'').toUpperCase()}}catch(e){}
 if(!countryForCode(code)){try{const res=await fetch('https://ipwho.is/',{headers:{Accept:'application/json'}});if(res.ok){const data=await res.json();if(data.success)code=String(data.country_code||'').toUpperCase();}}catch(e){}}
 if(!countryForCode(code)){const locale=Intl.DateTimeFormat().resolvedOptions().locale||'';const m=locale.match(/-([A-Z]{2})(?:-|$)/);code=m?m[1]:'US'}
 apply(countryForCode(code)||countryForCode('US'),true,false);
}
async function ratesFor(sourceCurrency,targetCurrency){
 const source=String(sourceCurrency||'USD').toUpperCase(),target=String(targetCurrency||selected?.currency||'USD').toUpperCase();
 if(source===target)return {rate:1,fromCurrency:source,toCurrency:target};
 const key=source+':'+target;
 if(liveRates[key])return liveRates[key];
 if(ratePromises[key])return ratePromises[key];
 ratePromises[key]=(async()=>{
  const ready=window.creatorSupabaseReady;
  if(!ready)throw new Error('Currency service is not ready.');
  await ready;
  const config=window.creatorSupabase?.config;
  if(!config?.url||!config?.publishableKey)throw new Error('Currency service is unavailable.');
  const response=await fetch(config.url.replace(/\/$/,'')+'/functions/v1/flutterwave-payments',{
   method:'POST',headers:{'Content-Type':'application/json','apikey':config.publishableKey},
   body:JSON.stringify({action:'get-currency-rates',fromCurrency:source,toCurrency:target})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.ok||!Number.isFinite(Number(data.rate))||Number(data.rate)<=0)throw new Error(data.error||'Flutterwave did not return a rate for '+source+' to '+target+'.');
  liveRates[key]={rate:Number(data.rate),fromCurrency:source,toCurrency:target,fetchedAt:data.fetchedAt,provider:'flutterwave'};
  return liveRates[key];
 })().finally(()=>{delete ratePromises[key];});
 return ratePromises[key];
}
async function convertAmount(amount,from,to){
 const source=String(from||'USD').toUpperCase(),target=String(to||selected?.currency||'USD').toUpperCase(),value=Number(amount||0);
 if(!Number.isFinite(value))throw new Error('Invalid amount');
 const quote=await ratesFor(source,target);
 return Math.round((value*quote.rate+Number.EPSILON)*100)/100;
}
async function prepareCurrencies(currencies){
 const target=selected?.currency||'USD';
 const unique=[...new Set((currencies||[]).map(x=>String(x||'').toUpperCase()).filter(x=>x&&x!==target))];
 await Promise.allSettled(unique.map(source=>ratesFor(source,target)));
 return target;
}
function formatLocal(amount,sourceCurrency){
 const target=selected?.currency||'USD',source=String(sourceCurrency||target).toUpperCase(),value=Number(amount||0);
 if(source===target)return format(value,target);
 const quote=liveRates[source+':'+target];
 if(quote)return format(value*quote.rate,target);
 ratesFor(source,target).then(()=>window.dispatchEvent(new CustomEvent('artistic-currency-rates-updated',{detail:{fromCurrency:source,toCurrency:target}}))).catch(error=>console.warn('[Artistic Flutterwave FX]',error));
 return format(value,source)+' · '+(ratePromises[source+':'+target]?'loading rate':'rate unavailable');
}
function populateSelect(select,selectedCode){
 if(!select)return;
 const current=selectedCode||select.value;
 const groups={Africa:[],International:[]};
 names.forEach(x=>groups[africanCodes.has(x.code)?'Africa':'International'].push(x));
 select.innerHTML='<option value="">Choose country</option>'+Object.entries(groups).map(([label,items])=>'<optgroup label="'+label+'">'+items.map(x=>'<option value="'+x.code+'">'+x.name+' · '+x.currency+'</option>').join('')+'</optgroup>').join('');
 if(current&&countryForCode(current))select.value=current;
}
window.ArtisticLanguageTools={languages:languageOptions,languageForCountry,languageName,applyLanguage};window.ArtisticCountryTools={countries:names,currencyForCountry:code=>countryForCode(code)?.currency||'USD',paymentCurrencyForCountry:code=>countryForCode(code)?.paymentCurrency||'USD',languageForCountry,languageName,countryForCode,applyCountry:(code,save)=>apply(countryForCode(code),save!==false,false),detect,convertAmount,prepareCurrencies,formatLocal,populateSelect};
window.dispatchEvent(new Event('artistic-country-tools-ready'));
document.addEventListener('DOMContentLoaded',()=>{
 const picker=document.getElementById('countryPickerBtn'),search=document.getElementById('countrySearch'),list=document.getElementById('countryList'),studioPicker=document.getElementById('studioCountryPickerBtn'),studioSearch=document.getElementById('studioCountrySearch'),studioList=document.getElementById('studioCountryList'),languagePicker=document.getElementById('languagePickerBtn'),languageSearch=document.getElementById('languageSearch'),languageList=document.getElementById('languageList'),studioLanguagePicker=document.getElementById('studioLanguagePickerBtn'),studioLanguageSearch=document.getElementById('studioLanguageSearch'),studioLanguageList=document.getElementById('studioLanguageList');
 function showModal(id,input){const modal=document.getElementById(id);if(!modal)return;modal.classList.add('open');document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';input?.focus()}
 function hideModal(id){document.getElementById(id)?.classList.remove('open');if(!document.querySelector('.overlay.open,.country-settings-modal.open')){document.documentElement.style.overflow='';document.body.style.overflow=''}}
 function renderCountries(host,q){if(!host)return;const query=String(q||'').trim().toLowerCase(),matches=names.filter(x=>!query||(x.name+' '+x.code+' '+x.currency).toLowerCase().includes(query));host.innerHTML=matches.map(x=>'<button type="button" class="country-option" data-country="'+x.code+'"><span>'+x.name+'</span><small>'+x.currency+'</small></button>').join('')||'<p class="lead">No countries found.</p>';}
 function renderLanguages(host,q){if(!host)return;const query=String(q||'').trim().toLowerCase(),matches=languageOptions.filter(x=>!query||(x.name+' '+x.code).toLowerCase().includes(query));host.innerHTML=matches.map(x=>'<button type="button" class="country-option" translate="no" data-language="'+x.code+'"><span>'+x.name+'</span><small>'+x.code.toUpperCase()+'</small></button>').join('')||'<p class="lead">No languages found.</p>';}
 window.addEventListener('dense-languages-updated',()=>{if(document.getElementById('languageModal')?.classList.contains('open'))renderLanguages(languageList,languageSearch?.value||'');if(document.getElementById('studioLanguageModal')?.classList.contains('open'))renderLanguages(studioLanguageList,studioLanguageSearch?.value||'');});
 picker?.addEventListener('click',()=>{renderCountries(list,search?.value||'');showModal('countryModal',search)});studioPicker?.addEventListener('click',()=>{renderCountries(studioList,studioSearch?.value||'');showModal('studioCountryModal',studioSearch)});
 languagePicker?.addEventListener('click',()=>{renderLanguages(languageList,languageSearch?.value||'');showModal('languageModal',languageSearch)});studioLanguagePicker?.addEventListener('click',()=>{renderLanguages(studioLanguageList,studioLanguageSearch?.value||'');showModal('studioLanguageModal',studioLanguageSearch)});
 search?.addEventListener('input',()=>renderCountries(list,search.value));studioSearch?.addEventListener('input',()=>renderCountries(studioList,studioSearch.value));languageSearch?.addEventListener('input',()=>renderLanguages(languageList,languageSearch.value));studioLanguageSearch?.addEventListener('input',()=>renderLanguages(studioLanguageList,studioLanguageSearch.value));
 list?.addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(!b)return;const chosen=countryForCode(b.dataset.country);if(chosen)apply(chosen,true,true);hideModal('countryModal')});
 studioList?.addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(!b)return;const chosen=countryForCode(b.dataset.country);if(chosen)apply(chosen,false,true);hideModal('studioCountryModal')});
 languageList?.addEventListener('click',e=>{const b=e.target.closest('[data-language]');if(!b)return;applyLanguage(b.dataset.language,true);hideModal('languageModal')});
 studioLanguageList?.addEventListener('click',e=>{const b=e.target.closest('[data-language]');if(!b)return;applyLanguage(b.dataset.language,true,false);hideModal('studioLanguageModal')});
 document.querySelectorAll('[data-close="countryModal"],[data-close="languageModal"],[data-close="studioCountryModal"],[data-close="studioLanguageModal"]').forEach(b=>b.addEventListener('click',()=>hideModal(b.dataset.close)));
});
detect();
})();