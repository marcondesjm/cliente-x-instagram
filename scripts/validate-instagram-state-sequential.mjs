import assert from 'node:assert/strict';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,dirname,basename} from 'node:path';
import {execFileSync} from 'node:child_process';
import {persistState} from './persist-instagram-state.mjs';
const original=process.cwd(),temp=fs.mkdtempSync(join(tmpdir(),'instagram-sequential-test-'));
const git=(cwd,args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const remote=join(temp,'remote.git'),work=join(temp,'work'),other=join(temp,'other');
try {
  fs.mkdirSync(work);git(temp,['init','--bare',remote]);git(work,['init','-b','main']);
  for(const [key,value] of [['user.name','Test'],['user.email','test@example.invalid']])git(work,['config',key,value]);
  const path='state.json';
  fs.writeFileSync(join(work,path),JSON.stringify({audit:{cards:[{scene:1,decision:'initial'}]},otherAccount:{score:0}}));
  git(work,['add','.']);git(work,['commit','-m','base']);git(work,['remote','add','origin',remote]);git(work,['push','origin','main']);
  const checkoutHead=git(work,['rev-parse','HEAD']);process.chdir(work);
  let state=JSON.parse(fs.readFileSync(path));state.audit.cards=[{scene:1,decision:'first review'}];fs.writeFileSync(path,JSON.stringify(state));persistState([path]);
  git(temp,['clone','--branch','main',remote,other]);
  for(const [key,value] of [['user.name','Test'],['user.email','test@example.invalid']])git(other,['config',key,value]);
  const concurrent=JSON.parse(fs.readFileSync(join(other,path)));concurrent.otherAccount.score=7;fs.writeFileSync(join(other,path),JSON.stringify(concurrent));git(other,['add','.']);git(other,['commit','-m','other account']);git(other,['push','origin','main']);
  state.audit.cards=[{scene:1,decision:'second review'}];fs.writeFileSync(path,JSON.stringify(state));persistState([path]);
  const stored=JSON.parse(git(remote,['show','main:state.json']));
  assert.equal(stored.audit.cards[0].decision,'second review');assert.equal(stored.otherAccount.score,7);assert.equal(git(work,['rev-parse','HEAD']),checkoutHead);
  // The caller retains its original otherAccount score; a third write must not undo the remote edit.
  state.audit.cards=[{scene:1,decision:'third review'}];fs.writeFileSync(path,JSON.stringify(state));persistState([path]);
  const third=JSON.parse(git(remote,['show','main:state.json']));assert.equal(third.otherAccount.score,7);assert.equal(third.audit.cards[0].decision,'third review');
  // A no-op write also refreshes the merge base correctly.
  persistState([path]);
  console.log('PASS: sequential unkeyed review arrays persist from the previous confirmed write, preserve a concurrent account edit, and leave checkout HEAD unchanged. Local Git only.');
}finally{
  process.chdir(original);
  if(dirname(resolve(temp))!==resolve(tmpdir()) || !basename(temp).startsWith('instagram-sequential-test-'))throw new Error('Unsafe temporary cleanup target');
  fs.rmSync(temp,{recursive:true,force:true});
}
