let artworks=[];
let filteredArtworks=[];
let currentLanguage=localStorage.getItem('kelk_language')||'fa';

const $=id=>document.getElementById(id);
const gallery=$('gallery'), count=$('count'), searchInput=$('search');
const poetFilter=$('poetFilter'), artistFilter=$('artistFilter'), scriptFilter=$('scriptFilter'), formatFilter=$('formatFilter'), periodFilter=$('periodFilter');
const languageToggle=$('languageToggle');

const labels={
 fa:{title:'کلک دبیر',subtitle:'درگاه مشق نظری نستعلیق',desc:'«کلک دبیر» درگاهی است برای مشق نظری خوشنویسی که با قابلیت جستجو، امکان دسترسی سریع را به ترکیب انتخابی بزرگان نستعلیق و شکسته‌نستعلیق از کلمات و عبارات فراهم می‌کند.',search:'جستجو در شعر، شاعر، خوشنویس، خط، قالب، دوره، مکان و منابع…',hint:'می‌توانید چند کلیدواژه را هم‌زمان جستجو کنید.',poets:'همه شاعران',artists:'همه خوشنویسان',scripts:'همه خطوط',formats:'همه قالب‌ها',periods:'همه دوره‌ها',count:'تعداد آثار',poet:'شاعر',artist:'خوشنویس',script:'خط',format:'قالب',year:'سال',period:'دوره',place:'مکان',tech:'تکنیک/تزئین',poemSource:'منبع شعر',imageSource:'منبع عکس',additionalSource:'منبع اضافه',description:'توضیحات',date:'تاریخ ثبت',view:'مشاهده اثر',none:'اثری با این مشخصات پیدا نشد.',noText:'بدون متن توصیفی',noData:'داده‌ای برای نمایش وجود ندارد.',close:'بستن',all:'همه',footer:'گرداننده: @sahhosseini',dataset:'آرشیو استخراج‌شده از نسخه پشتیبان تلگرام',open:'مشاهده منبع'},
 en:{title:'Kelk Dabir',subtitle:'A Gateway to Theoretical Nastaliq Practice',desc:'Kelk Dabir is a searchable research archive for Persian calligraphy, providing access to selected compositions by masters of Nastaliq and Shekasteh-Nastaliq.',search:'Search poems, poets, calligraphers, scripts, formats, periods, places and sources…',hint:'Multiple keywords can be searched together.',poets:'All poets',artists:'All calligraphers',scripts:'All scripts',formats:'All formats',periods:'All periods',count:'Artworks',poet:'Poet',artist:'Calligrapher',script:'Script',format:'Format',year:'Year',period:'Period',place:'Place',tech:'Technique / ornament',poemSource:'Poem source',imageSource:'Image source',additionalSource:'Additional source',description:'Description',date:'Archive date',view:'View artwork',none:'No artworks found.',noText:'No descriptive text',noData:'No data available.',close:'Close',all:'All',footer:'Curated by: @sahhosseini',dataset:'Extracted from the Telegram backup',open:'Open source'}
};

const formatLabels={"Satr":'سطر',"سطر":'سطر',"Chalipa":'چلیپا',"چلیپا":'چلیپا',"Siyah Mashq":'سیاه‌مشق',"سیاه‌مشق":'سیاه‌مشق',"Daftari":'دفتری',"دفتری":'دفتری',"Qet'e":'قطعه',"قطعه":'قطعه',"Shekasteh":'شکسته',"Nasta'liq":'نستعلیق',"Nastaliq":'نستعلیق',"Mofrad":'مفرد',"Moraqqa":'مرقع',"Morakkab":'مرکب'};
const scriptLabels={"Nasta’liq":'نستعلیق',"Nasta'liq":'نستعلیق',"Nastaliq":'نستعلیق',"Shekasteh":'شکسته'};

function langArr(item,field){
  const en=item[field+'_en'];
  const fa=item[field];
  return currentLanguage==='en' ? (Array.isArray(en)&&en.length?en:fa||[]) : (fa||[]);
}
function displayValue(item,field){return langArr(item,field).join(currentLanguage==='fa'?'، ':', ')}
function normalize(text){return String(text??'').toLowerCase().normalize('NFKC').replace(/ي/g,'ی').replace(/ى/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f]/g,' ').replace(/\s+/g,' ').trim();}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

async function loadData(){
  try{
    const r=await fetch('artworks_final.json?t='+Date.now());
    if(!r.ok) throw new Error('artworks_final.json');
    artworks=await r.json();
    artworks=Array.isArray(artworks)?artworks:[];
    filteredArtworks=[...artworks];
    populateFilters(); renderGallery(); updateLanguageUI();
  }catch(e){console.error(e);gallery.innerHTML='<div class="load-error">'+labels[currentLanguage].noData+'</div>';}
}

function counts(field){
 const m=new Map(); artworks.forEach(a=>{(a[field]||[]).forEach(v=>{if(v)m.set(v,(m.get(v)||0)+1);});}); return m;
}
function fillSelect(select,field,defaultLabel,translate=false){
 const previous=select.value; select.innerHTML='';
 const d=document.createElement('option'); d.value=''; d.textContent=defaultLabel; select.appendChild(d);
 [...counts(field).entries()].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),'fa')).forEach(([v,n])=>{
  const o=document.createElement('option');o.value=v;
  if(translate && currentLanguage==='fa') o.textContent=(formatLabels[v]||v)+' ('+n+')';
  else if(currentLanguage==='en' && field==='formats') o.textContent=(v==='Satr'?'Satr':v==='Chalipa'?'Chalipa':v==='Siyah Mashq'?'Siyah Mashq':v==='Daftari'?'Daftari':v)+` (${n})`;
  else {
    let en=v;
    artworks.some(a=>{const idx=(a[field]||[]).indexOf(v); if(idx>=0){const arr=a[field+'_en']; if(arr?.[idx]) en=arr[idx]; return true;} return false;});
    o.textContent=(currentLanguage==='en'?en:v)+` (${n})`;
  }
  select.appendChild(o);
 });
 if([...select.options].some(o=>o.value===previous)) select.value=previous;
}
function populateFilters(){
 fillSelect(poetFilter,'poets',labels[currentLanguage].poets);fillSelect(artistFilter,'calligraphers',labels[currentLanguage].artists);fillSelect(scriptFilter,'scripts',labels[currentLanguage].scripts);fillSelect(formatFilter,'formats',labels[currentLanguage].formats,true);fillSelect(periodFilter,'periods',labels[currentLanguage].periods);
}

function applyFilters(){
 const terms=normalize(searchInput.value).split(' ').filter(Boolean);
 const poet=poetFilter.value, artist=artistFilter.value, script=scriptFilter.value, format=formatFilter.value, period=periodFilter.value;
 filteredArtworks=artworks.filter(a=>{
  const searchable=normalize([
   a.poem_text,a.text,a.description,a.year,a.date,a.poem_source,a.image_source,a.additional_source,a.source,
   ...(a.poem_sources||[]).flatMap(x=>[x.label,x.url]),...(a.hashtags||[]),...(a.poets||[]),...(a.poets_en||[]),...(a.calligraphers||[]),...(a.calligraphers_en||[]),...(a.scripts||[]),...(a.scripts_en||[]),...(a.formats||[]),...(a.formats_en||[]),...(a.techniques||[]),...(a.techniques_en||[]),...(a.periods||[]),...(a.periods_en||[]),...(a.places||[]),...(a.places_en||[]),...(a.other_tags||[])
  ].join(' '));
  return terms.every(t=>searchable.includes(t)) && (!poet||(a.poets||[]).includes(poet)) && (!artist||(a.calligraphers||[]).includes(artist)) && (!script||(a.scripts||[]).includes(script)) && (!format||(a.formats||[]).includes(format)) && (!period||(a.periods||[]).includes(period));
 });
 renderGallery();
}

function renderGallery(){
 gallery.innerHTML='';
 count.textContent=`${labels[currentLanguage].count}: ${filteredArtworks.length.toLocaleString(currentLanguage==='fa'?'fa-IR':'en-US')}`;
 if(!filteredArtworks.length){gallery.innerHTML=`<div class="no-results">${labels[currentLanguage].none}</div>`;return;}
 filteredArtworks.forEach(a=>gallery.appendChild(card(a)));
}
function card(a){
 const article=document.createElement('article');article.className='artwork-card';
 const img=document.createElement('img');img.loading='lazy';img.src=a.thumbnail||a.high_res||'';img.alt=displayValue(a,'calligraphers')||'Persian calligraphy';img.onerror=()=>img.classList.add('image-missing');
 const info=document.createElement('div');info.className='artwork-info';
 const title=document.createElement('h3');title.textContent=preview(a.poem_text||a.text||labels[currentLanguage].noText);info.appendChild(title);
 addCard(info,labels[currentLanguage].poet,displayValue(a,'poets'));addCard(info,labels[currentLanguage].artist,displayValue(a,'calligraphers'));addCard(info,labels[currentLanguage].format,displayValue(a,'formats'));addCard(info,labels[currentLanguage].year,a.year);
 const b=document.createElement('button');b.className='view-button';b.textContent=labels[currentLanguage].view;b.onclick=()=>openArtwork(a);info.appendChild(b);
 article.append(img,info);return article;
}
function addCard(c,label,value){if(!value)return;const p=document.createElement('p');p.innerHTML=`<strong>${esc(label)}:</strong> ${esc(value)}`;c.appendChild(p);}
function preview(t){t=String(t||'').trim().replace(/\s+/g,' ');return t.length>105?t.slice(0,105)+'…':t;}

function addDetail(c,label,value){if(!value)return;const p=document.createElement('p');p.className='detail-row';p.innerHTML=`<strong>${esc(label)}:</strong> <span>${esc(value).replace(/\n/g,'<br>')}</span>`;c.appendChild(p);}
function addLinks(c,label,items,legacy){
 const arr=Array.isArray(items)?items.filter(x=>x&&x.url):[];
 if(!arr.length && legacy){
  const parts=String(legacy).split(/\s*\|\s*/).filter(Boolean);if(parts.length){addDetail(c,label,legacy);return;}
 }
 if(!arr.length)return;
 const p=document.createElement('p');p.className='detail-row';const strong=document.createElement('strong');strong.textContent=label+':';p.appendChild(strong);
 const wrap=document.createElement('span');wrap.className='source-links';arr.forEach((x,i)=>{if(i)wrap.append(' · ');const a=document.createElement('a');a.href=x.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=x.label||labels[currentLanguage].open;wrap.appendChild(a);});p.appendChild(wrap);c.appendChild(p);
}
function openArtwork(a){
 const modal=document.createElement('div');modal.className='artwork-modal';
 const inner=document.createElement('div');inner.className='modal-inner';
 const close=document.createElement('button');close.className='modal-close';close.type='button';close.textContent='×';close.title=labels[currentLanguage].close;close.onclick=()=>modal.remove();
 const img=document.createElement('img');img.className='high-res-image';img.src=a.high_res||a.thumbnail||'';img.alt=displayValue(a,'calligraphers')||'Persian calligraphy';
 const details=document.createElement('div');details.className='modal-details';
 addDetail(details,currentLanguage==='fa'?'متن':'Text',a.poem_text||a.text);addDetail(details,labels[currentLanguage].poet,displayValue(a,'poets'));addDetail(details,labels[currentLanguage].artist,displayValue(a,'calligraphers'));addDetail(details,labels[currentLanguage].script,displayValue(a,'scripts'));addDetail(details,labels[currentLanguage].format,displayValue(a,'formats'));addDetail(details,labels[currentLanguage].tech,displayValue(a,'techniques'));addDetail(details,labels[currentLanguage].year,a.year);addDetail(details,labels[currentLanguage].period,displayValue(a,'periods'));addDetail(details,labels[currentLanguage].place,displayValue(a,'places'));addDetail(details,labels[currentLanguage].description,a.description);addLinks(details,labels[currentLanguage].poemSource,a.poem_sources,a.poem_source);addDetail(details,labels[currentLanguage].imageSource,a.image_source);addDetail(details,labels[currentLanguage].additionalSource,a.additional_source);addDetail(details,labels[currentLanguage].date,a.date);
 inner.append(close,img,details);modal.appendChild(inner);document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});
 const escHandler=e=>{if(e.key==='Escape'){modal.remove();document.removeEventListener('keydown',escHandler);}};document.addEventListener('keydown',escHandler);
}

function updateLanguageUI(){
 const l=labels[currentLanguage];document.documentElement.lang=currentLanguage;document.documentElement.dir=currentLanguage==='fa'?'rtl':'ltr';$('siteTitle').textContent=l.title;$('siteSubtitle').textContent=l.subtitle;$('siteDescription').textContent=l.desc;$('searchHint').textContent=l.hint;$('footerText').textContent=l.footer;$('datasetInfo').textContent=l.dataset;searchInput.placeholder=l.search;languageToggle.textContent=currentLanguage==='fa'?'English':'فارسی';populateFilters();renderGallery();
}

[searchInput,poetFilter,artistFilter,scriptFilter,formatFilter,periodFilter].forEach(el=>el.addEventListener(el.tagName==='INPUT'?'input':'change',applyFilters));
languageToggle.addEventListener('click',()=>{currentLanguage=currentLanguage==='fa'?'en':'fa';localStorage.setItem('kelk_language',currentLanguage);updateLanguageUI();});
loadData();
