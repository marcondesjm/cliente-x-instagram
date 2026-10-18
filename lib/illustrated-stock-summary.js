import {packContentFingerprint,normalizeContentFingerprint} from './scheduled-content-guard.js';
export function illustratedStockSummary(packs=[],readyPacks=[],history=[]){
 const used=pack=>history.some(h=>h.feedFingerprint===packContentFingerprint(pack)||normalizeContentFingerprint(h.coverTitle)===normalizeContentFingerprint(pack.slides?.[0]?.title));
 const unpublished=readyPacks.filter(p=>!used(p));
 return {total:packs.length,ready:readyPacks.length,pending:packs.length-readyPacks.length,unpublished:unpublished.length,publishedReady:readyPacks.length-unpublished.length};
}
