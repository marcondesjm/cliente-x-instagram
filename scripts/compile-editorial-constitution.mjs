#!/usr/bin/env node
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseConstitution, compileConstitution, validateConstitution, digestConstitution} from '../lib/editorial-constitution.js';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const CONFIG_DIR=join(ROOT,'automation','instagram-template','config');
const CLAUDE_MD_PATH=join(ROOT,'CLAUDE.md');
const PERFORMANCE_PATH=join(CONFIG_DIR,'performance-insights.json');
const OUTPUT_PATH=join(CONFIG_DIR,'claude-editorial-constitution.json');
function readJson(path,fallback){ if(!existsSync(path))return fallback; return JSON.parse(readFileSync(path,'utf8').replace(/^﻿/,'')); }
if(!existsSync(CLAUDE_MD_PATH)){ console.error('CLAUDE.md não encontrado em:',CLAUDE_MD_PATH); process.exit(1); }
const claudeMdContent=readFileSync(CLAUDE_MD_PATH,'utf8').replace(/^﻿/,'');
const sourceHash=digestConstitution(claudeMdContent);
const performanceInsights=readJson(PERFORMANCE_PATH,{});
const parsed=parseConstitution(claudeMdContent);
parsed._sourceHash=sourceHash;
const constitution=compileConstitution(parsed,performanceInsights);
validateConstitution(constitution);
writeFileSync(OUTPUT_PATH,JSON.stringify(constitution,null,2)+'\n','utf8');
console.log('Constituição compilada: '+OUTPUT_PATH);
console.log('Source hash: '+sourceHash+', version: '+constitution.version);
console.log('Identity: niche='+constitution.identity.niche+', tone='+constitution.identity.tone);
console.log('Rules: '+constitution.rules.contentBoundaries.length+' boundaries, '+constitution.rules.forbiddenPatterns.length+' forbidden');
console.log('Learnings: '+constitution.learnings.confirmedPatterns.length+' confirmed, '+constitution.learnings.antiPatterns.length+' anti, '+constitution.learnings.activeHypotheses.length+' hypotheses');
console.log('Performance: freshness='+constitution.performanceContext.freshness+', confidence='+constitution.performanceContext.confidence);