// The catalogue stays public. Firestore rules protect each personal journal.
const ui = id => document.getElementById('bach-'+id);
const status = message => { ui('cloud-status').textContent = message; };
const config = window.BACH_FIREBASE_CONFIG;
if (!config?.apiKey || !config?.appId) {
  ui('signin').disabled = true;
  status('Cloud sync awaits Firebase setup. Local journal still works.');
} else {
  ui('signin').disabled=true;
  boot().catch(error => { status('Cloud sync unavailable: '+error.message+'. Local journal still works.'); });
}
async function boot() {
  const base = 'https://www.gstatic.com/firebasejs/12.19.0/';
  const [{initializeApp},authSDK,dbSDK] = await Promise.all([
    import(base+'firebase-app.js'), import(base+'firebase-auth.js'), import(base+'firebase-firestore.js')
  ]);
  const {getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut} = authSDK;
  const {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,collection,doc,onSnapshot,setDoc,runTransaction} = dbSDK;
  const app = initializeApp(config);
  const db = initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});
  const auth = getAuth(app);
  ui('signin').disabled=false;
  let user = null,unsubscribe = null,generation = 0,ready = false;
  const entriesRef = uid => collection(db,'users',uid,'entries');
  const entryRef = (uid,bwv) => doc(entriesRef(uid),encodeURIComponent(bwv));
  window.BACH_CLOUD = {write(bwv,patch) {
    if (!user || !ready) { status('Cloud journal is not ready.');return; }
    const session = generation;
    status('Saving to cloud…');
    setDoc(entryRef(user.uid,bwv),patch,{merge:true}).catch(error => {
      if (session===generation) status('Cloud save failed: '+error.message+'. Export a journal backup to preserve your edits.');
    });
  }};
  ui('signin').addEventListener('click',async()=>{
    try {await signInWithPopup(auth,new GoogleAuthProvider());}
    catch(error) {status('Could not sign in: '+error.message);}
  });
  ui('signout').addEventListener('click',async()=>{
    // Wait for queued writes before changing the active journal.
    ui('signout').disabled=true;
    try {await dbSDK.waitForPendingWrites(db);await signOut(auth);}
    catch(error) {status('Sign-out paused: '+error.message+'. Keep this tab open or export a backup.');}
    finally {ui('signout').disabled=false;}
  });
  ui('copy-local').addEventListener('click',async()=>{
    if (!user || !ready) return;
    const uid = user.uid,session = generation;
    ui('copy-local').disabled=true;
    try {
      const local = window.BACH_JOURNAL.local();let copied=0;
      for (const [bwv,value] of Object.entries(local)) {
        if (session!==generation) throw new Error('Account changed');
        const ref=entryRef(uid,bwv);
        const added=await runTransaction(db,async transaction=>{
          const existing=await transaction.get(ref);
          if (existing.exists()) return false;
          transaction.set(ref,value);return true;
        });
        if(added)copied++;
      }
      if(session===generation)status('Copied '+copied+' local entries. Existing cloud entries were preserved.');
    } catch(error) {status('Copy stopped: '+error.message+'. Local journal remains available when signed out.');}
    finally {ui('copy-local').disabled=false;}
  });
  onAuthStateChanged(auth,next=>{
    generation++;if(unsubscribe)unsubscribe();unsubscribe=null;user=next;ready=false;
    ui('signin').hidden=!!next;ui('signout').hidden=!next;ui('copy-local').hidden=!next;
    ui('copy-local').disabled=true;
    if (!next) {window.BACH_JOURNAL.stop();status('Signed out · Journal saves only in this browser.');return;}
    window.BACH_JOURNAL.start();
    ui('save-status').textContent='Cloud journal · Export a backup whenever you wish.';
    status('Loading cloud journal for '+next.email+'…');
    const session=generation;
    unsubscribe=onSnapshot(entriesRef(next.uid),{includeMetadataChanges:true},snapshot=>{
      if(session!==generation)return;
      const entries=Object.create(null);
      snapshot.forEach(row=>{entries[decodeURIComponent(row.id)]=row.data()});
      window.BACH_JOURNAL.apply(entries);ready=true;ui('copy-local').disabled=false;
      status(snapshot.metadata.hasPendingWrites?'Changes waiting to sync · Keep this browser data.':snapshot.metadata.fromCache?'Offline/cached journal · Cloud connection not confirmed.':'Synced · '+next.email);
    },error=>{
      if(session!==generation)return;
      ready=false;window.BACH_JOURNAL.start();ui('copy-local').disabled=true;
      status('Cloud journal unavailable: '+error.message+'. Sign out to use your local journal.');
    });
  });
}
