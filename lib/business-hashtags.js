export function ensureBusinessHashtags(caption='',topic=''){
 const text=String(caption).trim();
 const found=[...text.matchAll(/(?:^|\s)(#[\p{L}\p{N}_]+)/gu)].map(m=>m[1].toLocaleLowerCase('pt-BR'));
 if(found.length>=3)return text;
 const subject=String(topic).toLowerCase();
 const specific=/atendimento|pedido|fila|resposta|transferencia/.test(subject)?'#AtendimentoAoCliente':/venda|comercial|orcamento/.test(subject)?'#Vendas':'#Produtividade';
 const tags=['#IAparaEmpresas','#Automacao','#GestaoDeNegocios',specific].filter(t=>!found.includes(t.toLocaleLowerCase('pt-BR'))).slice(0,4-found.length);
 return [text,tags.join(' ')].filter(Boolean).join('\n\n');
}
