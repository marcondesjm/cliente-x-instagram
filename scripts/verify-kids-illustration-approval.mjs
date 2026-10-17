import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const config='automation/instagram-template/config/';
const queue=JSON.parse(fs.readFileSync(config+'kids-illustration-queue.json'));
const candidate=queue.find(x=>x.id===process.env.APPROVE_BATCH && x.status==='approved');
if(!candidate) throw new Error('Lote aprovado ausente.');
const pack=JSON.parse(fs.readFileSync(config+'content-packs.json')).find(x=>x.account==='sabedoria-kids').packs.find(x=>x.id===candidate.packId);
execFileSync(process.execPath,['automation/instagram-template/scripts/publish-carousel.mjs','--account','sabedoria-kids','--render-only'],{stdio:'inherit',env:{...process.env,DRY_RUN:'true',INSTAGRAM_TEMPLATE_PACK_JSON:JSON.stringify(pack)}});
