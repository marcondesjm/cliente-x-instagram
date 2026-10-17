import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const keyFor = x => x?.key || (x?.account && x?.date && Number.isInteger(Number(x?.slotIndex)) ? `${x.account}:${x.date}:${x.slotIndex}` : null) || x?.id || x?.mediaId || x?.feedFingerprint || x?.storyFingerprint || x?.account;
export function mergeState(base, local, remote) {
  if (same(local,base)) return remote;
  if (same(remote,base) || same(local,remote)) return local;
  if ([base,local,remote].every(Array.isArray)) {
    if (![...base,...local,...remote].every(x=>x && typeof x==='object' && keyFor(x))) throw new Error('Concurrent unkeyed array change requires review');
    const maps=[base,local,remote].map(a=>new Map(a.map(x=>[String(keyFor(x)),x])));
    return [...new Set([...maps[2].keys(),...maps[1].keys()])].map(k=>mergeState(...maps.map(m=>m.get(k)))).filter(x=>x!==undefined);
  }
  if ([local,remote].every(x=>x && typeof x==='object' && !Array.isArray(x)) && (!base || typeof base==='object' && !Array.isArray(base))) {
    return Object.fromEntries([...new Set([...Object.keys(remote),...Object.keys(local)])].map(k=>[k,mergeState(base?.[k],local[k],remote[k])]).filter(([,v])=>v!==undefined));
  }
  // A completed publication/resolution must not be replaced by an older retry.
  if (local==='resolved' || remote==='resolved') return 'resolved';
  if (local==='published' || remote==='published') return 'published';
  if (local===undefined && remote!==undefined && !same(base,remote)) return remote;
  return local;
}
const git=(args,options={})=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024,...options}).trim();
const readAt=(rev,path)=>JSON.parse(git(['show',`${rev}:${path}`]));
export function persistState(paths, assets = []) {
  const base=git(['rev-parse','HEAD']);
  const saved=paths.map(path=>({path,base:readAt(base,path),local:JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''))}));
  const temp=mkdtempSync(join(tmpdir(),'instagram-state-'));
  try {
    for(let attempt=0;attempt<5;attempt++) {
      git(['fetch','origin','main']);
      const parent=git(['rev-parse','origin/main']);
      const env={...process.env,GIT_INDEX_FILE:join(temp,`index-${attempt}`)};
      git(['read-tree',parent],{env});
      for(const item of saved) {
        const merged=mergeState(item.base,item.local,readAt(parent,item.path));
        writeFileSync(item.path,JSON.stringify(merged,null,2)+'\n');
        git(['add','--',item.path],{env});
      }
      for(const path of assets) {
        if(!/^docs\/illustrations\/sabedoria-kids\/[a-z0-9-]+\/[a-zA-Z0-9_.-]+\.(jpg|png)$/.test(path)) throw new Error('Invalid reviewed Bible asset path');
        git(['add','--',path],{env});
      }
      const tree=git(['write-tree'],{env});
      if(tree===git(['rev-parse',`${parent}^{tree}`])) { console.log('State already persisted.'); return; }
      const commit=git(['commit-tree',tree,'-p',parent,'-m','Update Instagram schedule state']);
      try { git(['push','origin',`${commit}:refs/heads/main`]); console.log(`State persisted: ${commit}`); return; }
      catch(error) { if(attempt===4) throw error; }
    }
  } finally { rmSync(temp,{recursive:true,force:true}); }
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  persistState(args.filter(x=>!x.startsWith('--asset=')),args.filter(x=>x.startsWith('--asset=')).map(x=>x.slice(8)));
}
