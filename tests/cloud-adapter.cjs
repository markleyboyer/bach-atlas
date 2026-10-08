const fs=require('fs'),vm=require('vm'),assert=require('assert');
const controls=Object.fromEntries(['signin','signout','copy-local','cloud-status','save-status'].map(k=>[k,{addEventListener(t,fn){this[t]=fn}}]));
let authChange,snapshot,errorCallback,writes=[],applied=[],locked=0,stopped=0,transactions=0;
const ref=(...args)=>args.join('/');
const mocks={app:{initializeApp:()=>({})},auth:{getAuth:()=>({}),GoogleAuthProvider:class{},signInWithPopup:async()=>{},onAuthStateChanged:(a,fn)=>authChange=fn,signOut:async()=>authChange(null)},db:{initializeFirestore:()=>({}),persistentLocalCache:x=>x,persistentMultipleTabManager:()=>({}),collection:ref,doc:ref,onSnapshot:(r,o,fn,err)=>{snapshot=fn;errorCallback=err;return()=>{}},setDoc:async(r,p,o)=>writes.push({r,p,o}),waitForPendingWrites:async()=>{},runTransaction:async(d,fn)=>fn({get:async()=>({exists:()=>transactions++>0}),set:()=>{}})}};
let source=fs.readFileSync('cloud.js','utf8').replace("import(base+'firebase-app.js')","Promise.resolve(mocks.app)").replace("import(base+'firebase-auth.js')","Promise.resolve(mocks.auth)").replace("import(base+'firebase-firestore.js')","Promise.resolve(mocks.db)");
const window={BACH_FIREBASE_CONFIG:{apiKey:'public',appId:'app'},BACH_JOURNAL:{start:()=>locked++,stop:()=>stopped++,apply:e=>applied.push(e),local:()=>({'1':{notes:'Local'},'2':{notes:'Other'}})}};
vm.runInNewContext(source,{window,mocks,document:{getElementById:id=>controls[id.slice(5)]},console});
setImmediate(async()=>{
 try{
 assert(authChange);authChange({uid:'owner',email:'owner@example.com'});assert.strictEqual(locked,1);
 const deliver=(data,meta={hasPendingWrites:false,fromCache:false})=>snapshot({metadata:meta,forEach:fn=>Object.entries(data).forEach(([id,x])=>fn({id,data:()=>x}))});
 deliver({'1':{rating:'4'}});assert.strictEqual(applied.at(-1)['1'].rating,'4');assert(controls['cloud-status'].textContent.startsWith('Synced'));
 window.BACH_CLOUD.write('1/2',{notes:'Phone'});await Promise.resolve();assert(writes[0].r.endsWith('/1%2F2'));assert.deepStrictEqual(writes[0].p,{notes:'Phone'});assert(writes[0].o.merge);
 deliver({'1':{rating:'4',notes:'Phone'}},{hasPendingWrites:true,fromCache:true});assert(controls['cloud-status'].textContent.includes('waiting'));
 await controls['copy-local'].click();assert(controls['cloud-status'].textContent.includes('Copied 1'));
 errorCallback(new Error('permission-denied'));assert.strictEqual(locked,2);window.BACH_CLOUD.write('1',{rating:'5'});assert.strictEqual(writes.length,1);
 await controls.signout.click();assert.strictEqual(stopped,1);assert(controls.signin.hidden===false);
 console.log('PASS: adapter snapshots, pending status, encoded BWV IDs, field patches, missing-only migration, permission failure lock, and sign-out.');
 }catch(e){console.error(e);process.exitCode=1}
});
