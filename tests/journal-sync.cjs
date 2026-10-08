const fs=require('fs'),vm=require('vm'),assert=require('assert');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.listeners={};this.value='';this.checked=false;this.open=false;this.attrs={}}
 append(...cs){for(const c of cs){if(c?.tag==='fragment'){this.append(...c.children)}else this.children.push(c)}}
 setAttribute(k,v){this.attrs[k]=v}addEventListener(n,f){this.listeners[n]=f}replaceChildren(...cs){this.children=[];this.append(...cs)}
 matches(sel){return sel.split(',').some(s=>{const [t,c]=s.trim().split('.');return this.tag===t&&(!c||this.className?.split(' ').includes(c))})}
 contains(el){return this===el||this.children.some(c=>c===el||c.contains?.(el))}
 querySelectorAll(sel){let out=[];for(const c of this.children){if(c.matches?.(sel))out.push(c);if(c.querySelectorAll)out.push(...c.querySelectorAll(sel))}return out}
}
const html=fs.readFileSync('index.html','utf8');const code=fs.readFileSync('app.js','utf8');new vm.Script(code);const window={};vm.runInNewContext(fs.readFileSync('catalogue.js','utf8'),{window});vm.runInNewContext(fs.readFileSync('recordings.js','utf8'),{window});
const store={};
function start(blocked=false){const ids=['group','sort','level','search','appendix','questionable','lost','count','tree','expand','collapse','export','import','save-status'];const els=Object.fromEntries(ids.map(id=>[id,new Element('div')]));els.group.value='genre';els.sort.value='bwv';els.level.value='all';els.questionable.checked=true;els.lost.checked=true;
 const root={querySelector:s=>els[s.replace('#bach-','')],append(){}};const doc={getElementById:()=>root,createElement:t=>new Element(t),createTextNode:text=>({textContent:text}),createDocumentFragment:()=>new Element('fragment')};const localStorage={getItem:k=>store[k],setItem:(k,v)=>{if(blocked)throw Error('blocked');store[k]=v},removeItem:k=>delete store[k]};vm.runInNewContext(code,{document:doc,localStorage,window,Intl,setTimeout,clearTimeout,console});return els}
const els=start();const sampleButtons=els.tree.querySelectorAll('button').filter(x=>x.textContent?.startsWith('Listen to opening'));assert(sampleButtons.length>0);sampleButtons[0].listeners.click();assert(els.tree.querySelectorAll('iframe').length===1);assert(els.tree.querySelectorAll('iframe')[0].src.includes('end='));sampleButtons[1].listeners.click();assert(els.tree.querySelectorAll('iframe').length===1);assert(els.count.textContent.startsWith('1,349'));
els.expand.listeners.click();assert(els.tree.querySelectorAll('details').every(x=>x.open));els.collapse.listeners.click();assert(els.tree.querySelectorAll('details').every(x=>!x.open));
const branch=els.tree.children[0];const buttons=branch.children[0].querySelectorAll('button');const evt={preventDefault(){},stopPropagation(){}};buttons[0].listeners.click(evt);assert(branch.open);assert(branch.querySelectorAll('details').every(x=>x.open));assert(!els.tree.children[1].open);buttons[1].listeners.click(evt);assert(!branch.open);assert(branch.querySelectorAll('details').every(x=>!x.open));
const work=els.tree.querySelectorAll('details.bach-work').find(w=>w.children[0].textContent?.includes('BWV 1 ·'));
const inputs=work.querySelectorAll('input');inputs[0].checked=true;inputs[0].listeners.change();inputs[1].value='Gardiner, 2000';inputs[1].listeners.input();const stars=work.querySelectorAll('button.bach-star');assert(stars.length===5);assert(stars.every(x=>x.textContent==='☆'));stars[4].listeners.click();assert(stars.every(x=>x.textContent==='★'));stars[4].listeners.click();assert(stars.every(x=>x.textContent==='☆'));stars[4].listeners.click();const comments=work.querySelectorAll('textarea')[0];comments.value='Opening chorus is wonderful.';comments.listeners.input();
assert(JSON.parse(store['bach-listening-journal-v1'])['1'].notes==='Opening chorus is wonderful.');
els.group.value='instrument';els.group.listeners.change();assert(els.tree.querySelectorAll('textarea').some(x=>x.value==='Opening chorus is wonderful.'));
const reloaded=start();assert(reloaded.tree.querySelectorAll('textarea').some(x=>x.value==='Opening chorus is wonderful.'));

const cloudCalls=[];window.BACH_CLOUD={write:(b,p)=>cloudCalls.push([b,p])};
const treeBefore=reloaded.tree.children[0];treeBefore.open=true;
window.BACH_JOURNAL.start();
const cw=reloaded.tree.querySelectorAll('details.bach-work').find(w=>w.children[0].textContent?.includes('BWV 1 ·'));
assert(cw.querySelectorAll('input').every(x=>x.disabled));
window.BACH_JOURNAL.apply({'1':{listened:true,rating:'3',notes:'Phone note',recording:'Cloud recording'}});
assert.strictEqual(reloaded.tree.children[0],treeBefore);assert(treeBefore.open);
assert.strictEqual(cw.querySelectorAll('textarea')[0].value,'Phone note');
const savedBefore=store['bach-listening-journal-v1'];
const cloudStars=cw.querySelectorAll('button.bach-star');cloudStars[4].listeners.click();
assert.strictEqual(JSON.stringify(cloudCalls),JSON.stringify([['1',{rating:'5'}]]));
assert.strictEqual(store['bach-listening-journal-v1'],savedBefore);
window.BACH_JOURNAL.stop();assert.strictEqual(cw.querySelectorAll('textarea')[0].value,'Opening chorus is wonderful.');
console.log('PASS: cloud patches change only edited fields, snapshots preserve tree expansion, loading locks inputs, local and cloud journals remain separate.');
const blocked=start(true);assert(blocked['save-status'].textContent.includes('session'));
(async()=>{reloaded.import.listeners.change({target:{files:[{size:100,text:async()=>JSON.stringify({format:'bach-listening-journal',version:1,entries:{'1':{notes:'Restored note',rating:'4',listened:true}}})}],value:'file'}}).then(()=>{assert(reloaded.tree.querySelectorAll('textarea').some(x=>x.value==='Restored note'));console.log('PASS: all/branch expansion, isolated collapse, journal inputs, regrouping, browser reload, restricted-storage fallback, backup import.');console.log('Bytes:',Buffer.byteLength(html))})})()
