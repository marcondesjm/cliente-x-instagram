#!/usr/bin/env node
/**
 * Script de teste para verificar a integração da API Claude-SS
 * Uso: node scripts/test-claude-ss-integration.mjs
 */

import { callClaudeSS, generateEditorialContent, analyzePerformance, classifyWatchdogError } from '../lib/claude-ss-client.js';

console.log(' Testando integração Claude-SS...\n');

async function testBasicCall() {
 console.log('1️⃣ Teste: Chamada básica à API Claude-SS');
 try {
 const result = await callClaudeSS({
 messages: [
 { role: 'user', content: 'Explique em uma frase o que é automação com IA para negócios' }
 ],
 maxTokens: 256,
 temperature: 0.7
 });
 console.log('✅ Sucesso!');
 console.log('Resposta:', result.content?.[0]?.text?.substring(0, 200));
 console.log('Modelo:', result.model);
 console.log('Uso de tokens:', result.usage);
 } catch (error) {
 console.log('❌ Erro:', error.message);
 }
 console.log('');
}

async function testEditorialGeneration() {
 console.log('2️⃣ Teste: Geração de conteúdo editorial');
 try {
 const result = await generateEditorialContent({
 niche: 'ensino prático de IA para atendimento e vendas',
 audience: 'donos de pequenos e médios negócios',
 tone: 'consultivo e educativo',
 topic: 'como usar chatbots para reduzir tarefas repetitivas no atendimento ao cliente'
 });
 console.log('✅ Conteúdo gerado!');
 console.log(result.content);
 } catch (error) {
 console.log('❌ Erro:', error.message);
 }
 console.log('');
}

async function testPerformanceAnalysis() {
 console.log('3️⃣ Teste: Análise de performance');
 try {
 const result = await analyzePerformance({
 posts: [
 { title: 'Como automatizar vendas com IA', reach: 1500, likes: 120, comments: 15, shares: 8, saved: 45 },
 { title: 'Chatbots para atendimento', reach: 2200, likes: 180, comments: 22, shares: 12, saved: 67 },
 { title: 'IA para pequenas empresas', reach: 800, likes: 65, comments: 5, shares: 3, saved: 20 }
 ]
 });
 console.log('✅ Análise concluída!');
 console.log(result.analysis.substring(0, 300));
 } catch (error) {
 console.log('❌ Erro:', error.message);
 }
 console.log('');
}

async function testErrorClassification() {
 console.log('4️⃣ Teste: Classificação de erro do watchdog');
 try {
 const result = await classifyWatchdogError({
 message: 'Failed to fetch article from OpenAI RSS feed: timeout after 30s',
 stage: 'radar-content-selection'
 });
 console.log('✅ Classificação realizada!');
 console.log(JSON.stringify(result.classification, null, 2));
 } catch (error) {
 console.log('❌ Erro:', error.message);
 }
 console.log('');
}

// Executar todos os testes
await testBasicCall();
await testEditorialGeneration();
await testPerformanceAnalysis();
await testErrorClassification();

console.log(' Testes concluídos!');
console.log('\nPróximos passos:');
console.log('- Configure as variáveis de ambiente no arquivo .env.local');
console.log('- Adicione CLAUDE_SS_API_KEY nas configurações da Vercel');
console.log('- Integre as funções nos workflows existentes conforme necessário');