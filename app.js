
(()=>{
const root=document.getElementById('bach-atlas');
const data=window.BACH_WORKS;
const q=id=>root.querySelector('#bach-'+id);
const collator=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
const marker=w=>w.l===1?'★':w.l===2?'◆':'○';
const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
const recordings=window.BACH_RECORDINGS||[];
const recordingMap=new Map();
const normalizeBWV=id=>id.toLowerCase().replace(/\s+/g,'').replace(/^bwv/,'');
for(const recording of recordings){const key=normalizeBWV(recording.bwv);if(!recordingMap.has(key))recordingMap.set(key,[]);recordingMap.get(key).push(recording)}
let activePlayer=null,activeOwner=null;
function listeningSection(w){
const exact=recordingMap.get(normalizeBWV(w.b));const base=/^\d+/.exec(w.b)?.[0];const parts=!exact&&w.b===base?recordings.filter(r=>normalizeBWV(r.bwv).startsWith(base+'/')):[];const matches=exact||(base?recordingMap.get(base):null)||(parts.length?parts:null);const area=make('div','bach-listening');area.append(make('h3','','Listen'));
if(!matches?.length){area.append(make('p','text-small','No matching All of Bach performance verified yet.'));return area}
if(!exact)area.append(make('p','text-small',parts.length?'Recorded sections of this work · See each performance title.':'Related performance for BWV '+base+' · The version or separately listed part of this entry has not been matched.'));
for(const r of matches){const row=make('div','bach-recording');row.append(make('p','text-small',r.title+' · '+r.credit));const actions=make('div','viz-row');const full=make('a','btn','Performance · All of Bach');full.href=r.url;full.target='_blank';full.rel='noopener';actions.append(full);
if(r.video){const play=make('button','btn', 'Listen to opening · '+(r.end-r.start)+' seconds');play.type='button';const holder=make('div','bach-player');const stop=make('button','btn btn-ghost','Close player');stop.type='button';stop.hidden=true;function close(){holder.replaceChildren();stop.hidden=true;if(activePlayer===close){activePlayer=null;activeOwner=null}}stop.addEventListener('click',close);play.addEventListener('click',()=>{if(activePlayer)activePlayer();const iframe=make('iframe');iframe.src='https://www.youtube-nocookie.com/embed/'+r.video+'?start='+r.start+'&end='+r.end+'&autoplay=1&rel=0';iframe.setAttribute('title',r.title+' · '+r.excerpt);iframe.setAttribute('allow','autoplay; encrypted-media; fullscreen; picture-in-picture');iframe.setAttribute('allowfullscreen','');iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');holder.replaceChildren(iframe);stop.hidden=false;activePlayer=close;activeOwner=area});actions.append(play,stop);row.append(make('p','text-small','Excerpt: '+r.excerpt));row.append(actions,holder)}else row.append(actions);area.append(row)}return area;
}
const storageKey='bach-listening-journal-v1';
let journal=Object.create(null),canSave=false;
try{const testKey=storageKey+'-test';localStorage.setItem(testKey,'1');localStorage.removeItem(testKey);canSave=true;const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');journal=cleanJournal(saved)}catch(e){canSave=false}
function cleanJournal(input){const out=Object.create(null);if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Invalid journal');for(const w of data){const x=input[w.b];if(!x||typeof x!=='object')continue;out[w.b]={listened:x.listened===true,recording:typeof x.recording==='string'?x.recording.slice(0,20000):'',rating:['','1','2','3','4','5'].includes(String(x.rating??''))?String(x.rating??''):'',notes:typeof x.notes==='string'?x.notes.slice(0,100000):''}}return out}
function save(){try{if(canSave)localStorage.setItem(storageKey,JSON.stringify(journal));q('save-status').textContent=canSave?'Journal saved in this browser · Back up journal to keep a portable copy.':'Journal held for this session · Back up journal before closing or reloading.'}catch(e){canSave=false;q('save-status').textContent='Browser saving unavailable · Back up journal before closing or reloading.'}}
q('save-status').textContent=canSave?'Journal saves in this browser · Backups can be restored on another device.':'Journal held for this session · Back up journal before closing or reloading.';
function setBelow(container,open){if(!open&&activePlayer&&container.contains(activeOwner))activePlayer();for(const item of container.querySelectorAll('details.bach-branch, details.bach-work'))item.open=open;if(container.matches&&container.matches('details.bach-branch'))container.open=open}
function branchButtons(container,name){const group=make('span','bach-branch-actions');for(const [label,open,iconName] of [['Expand all',true,'chevrons-down'],['Collapse all',false,'chevrons-up']]){const btn=make('button','btn btn-ghost');btn.type='button';btn.setAttribute('aria-label',label+' below '+name);btn.setAttribute('data-tooltip',label+' below '+name);const icon=make('span','',open?'⇊':'⇈');icon.setAttribute('aria-hidden','true');btn.append(icon);btn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();setBelow(container,open)});group.append(btn)}return group}
function paths(w,mode){
const collection=w.c||'Individual works / other entries';
if(mode==='instrument')return[w.i,w.s,collection];
if(mode==='chronology')return[w.y?Math.floor(w.y/10)*10+'s':'Date unknown',w.g,collection];
if(mode==='key')return[w.k||'Key unspecified / multiple keys',w.g,collection];
return[w.g,w.s,collection];
}
function work(w){
const el=make('details','bach-work');el.dataset.level=w.l;
const sum=make('summary','cursor-interaction',marker(w)+' BWV '+w.b+' · '+w.t+(w.k?' · '+w.k:''));
const badge=make('span','bach-total text-small');const note=journal[w.b]||{listened:false,recording:'',rating:'',notes:''};const updateBadge=()=>{badge.textContent=(note.listened?' · Listened':'')+(note.rating?' · '+note.rating+'/5':'')+(!note.listened&&!note.rating&&(note.recording||note.notes)?' · Notes':'')};updateBadge();sum.append(badge);
el.append(sum);const meta=make('div','bach-meta text-small');
meta.append(make('p','',w.d+' · '+w.i+' · '+w.g));
meta.append(make('p','', 'Forces: '+(w.f||'Unspecified')+' · '+w.a+' · '+w.v));
if(w.r)meta.append(make('p','',marker(w)+' '+w.r));
if(w.c)meta.append(make('p','', 'Collection: '+w.c));
if(w.rel.length)meta.append(make('p','', 'Related catalogue references: '+[...new Set(w.rel)].map(x=>'BWV '+x).join(', ')));
const link=make('a','','Catalogue source');link.href='https://imslp.org/wiki/List_of_works_by_Johann_Sebastian_Bach';link.target='_blank';link.rel='noopener';meta.append(link);
meta.append(listeningSection(w));const form=make('div','bach-journal');
const listenedLabel=make('label','form-check');const listened=make('input','form-check-input');listened.type='checkbox';listened.checked=note.listened;listenedLabel.append(make('span','form-check-label','Listened'),listened);form.append(listenedLabel);
function field(label,tag,cls){const wrapper=make('label','form-label',label);const control=make(tag,cls);wrapper.append(control);form.append(wrapper);return control}
const rating={value:note.rating};const ratingRow=make('div','viz-row');ratingRow.append(make('span','form-label','My rating'));const stars=make('span','bach-stars');stars.setAttribute('role','group');stars.setAttribute('aria-label','My rating');const starButtons=[];function paintStars(){starButtons.forEach((button,index)=>{const number=index+1;button.textContent=number<=Number(rating.value)?'★':'☆';button.setAttribute('aria-pressed',String(String(number)===rating.value));button.setAttribute('aria-label',number+' out of 5 stars'+(String(number)===rating.value?' · Selected; click again to clear':''));button.setAttribute('data-tooltip',String(number)===rating.value?'Clear rating':number+' out of 5 stars')})}for(let number=1;number<=5;number++){const button=make('button','btn btn-ghost bach-star');button.type='button';button.addEventListener('click',()=>{rating.value=rating.value===String(number)?'':String(number);paintStars();changed()});starButtons.push(button);stars.append(button)}paintStars();ratingRow.append(stars);form.append(ratingRow);
const recording=field('Preferred recording','input','form-control');recording.type='text';recording.placeholder='Performer, ensemble, conductor, year, or link';recording.value=note.recording;
const notes=field('Comments','textarea','form-control');notes.rows=3;notes.placeholder='Your impressions and listening notes';notes.value=note.notes;
function changed(){note.listened=listened.checked;note.rating=rating.value;note.recording=recording.value;note.notes=notes.value;journal[w.b]=note;updateBadge();save()}
listened.addEventListener('change',changed);recording.addEventListener('input',changed);notes.addEventListener('input',changed);meta.append(form);el.append(meta);return el;
}
function render(){
if(activePlayer)activePlayer();
const mode=q('group').value, sort=q('sort').value, level=q('level').value,needle=q('search').value.toLowerCase().trim().replace(/^bwv\s*/, '');
let works=data.filter(w=>(q('appendix').checked||!w.ap)&&(q('questionable').checked||w.a==='Not flagged in source')&&(q('lost').checked||w.v==='No loss flagged')&&(level==='all'||(w.l>0&&w.l<=Number(level)))&&(!needle||[w.b,w.t,w.f,w.i,w.c,w.k,w.g,w.s].join(' ').toLowerCase().includes(needle)));
works.sort((a,b)=>sort==='date'?(a.y??9999)-(b.y??9999)||collator.compare(a.b,b.b):sort==='title'?collator.compare(a.t,b.t):sort==='importance'?(a.l? a.l:3)-(b.l?b.l:3)||collator.compare(a.b,b.b):collator.compare(a.b,b.b));
q('count').textContent=works.length.toLocaleString()+' entries shown · '+works.filter(w=>w.l===1).length+' landmark entries · '+works.filter(w=>w.l===2).length+' other notable entries · Expand branches to explore.';
const tree={children:new Map(),works:[],all:[]};
for(const w of works){let node=tree;node.all.push(w);for(const name of paths(w,mode)){if(!node.children.has(name))node.children.set(name,{children:new Map(),works:[],all:[]});node=node.children.get(name);node.all.push(w)}node.works.push(w)}
function branch(node,depth){const fragment=document.createDocumentFragment();let entries=[...node.children];
entries.sort((a,b)=>mode==='chronology'&&depth===0?(a[0]==='Date unknown'?1:b[0]==='Date unknown'?-1:collator.compare(a[0],b[0])):depth===0&&mode==='genre'?['Vocal works','Organ works','Other keyboard works','Chamber music','Orchestral music','Canons','Late contrapuntal works','Other works'].indexOf(a[0])-['Vocal works','Organ works','Other keyboard works','Chamber music','Orchestral music','Canons','Late contrapuntal works','Other works'].indexOf(b[0]):collator.compare(a[0],b[0]));
for(const [name,child] of entries){const el=make('details','bach-branch');const sum=make('summary','cursor-interaction');sum.append(branchButtons(el,name),document.createTextNode(name));const stars=child.all.filter(w=>w.l===1).length,diamonds=child.all.filter(w=>w.l===2).length;sum.append(make('span','bach-total text-small',child.all.length+' entries'+(stars?' · ★ '+stars:'')+(diamonds?' · ◆ '+diamonds:'')));
if(depth===0){const meter=make('span','bach-meter');meter.setAttribute('aria-hidden','true');const fill=make('span');fill.style.width=(100*child.all.length/Math.max(1,works.length))+'%';meter.append(fill);sum.append(meter)}
el.append(sum);const contents=make('div','bach-children');contents.append(branch(child,depth+1));el.append(contents);if(needle||level!=='all')el.open=depth<2;fragment.append(el)}
for(const w of node.works)fragment.append(work(w));return fragment}
q('tree').replaceChildren(branch(tree,0));if(!works.length)q('tree').append(make('p','','No matching entries.'));
if(typeof lucide!=='undefined')lucide.createIcons({attrs:{width:16,height:16}});
}
q('expand').addEventListener('click',()=>setBelow(q('tree'),true));q('collapse').addEventListener('click',()=>setBelow(q('tree'),false));
q('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({format:'bach-listening-journal',version:1,exportedAt:new Date().toISOString(),entries:journal},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=make('a');a.href=url;a.download='bach-listening-journal.json';root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);q('save-status').textContent='Journal backup requested · Keep the downloaded JSON file to restore your entries.'});
q('import').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>10000000)throw new Error('File too large');const imported=JSON.parse(await file.text());if(imported.format!=='bach-listening-journal'||imported.version!==1)throw new Error('Unrecognized backup');const incoming=cleanJournal(imported.entries);for(const [key,value] of Object.entries(incoming))journal[key]=value;save();render();q('save-status').textContent=Object.keys(incoming).length+' journal entries restored · '+(canSave?'Saved in this browser.':'Back up before closing or reloading.')}catch(e){q('save-status').textContent='Could not restore journal: '+e.message}event.target.value=''});
['group','sort','level','appendix','questionable','lost'].forEach(id=>q(id).addEventListener('change',render));let timer;q('search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(render,160)});render();
})();
