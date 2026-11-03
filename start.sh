#!/bin/bash

echo "🚀 Iniciando Automação Sabedoria Kids na Nuvem..."
echo "📋 Verificando duplicidades antes de iniciar..."

# Executa validação anti-duplicidade
node scripts/validate-schedule-against-published.mjs

if [ $? -eq 0 ]; then
    echo "✅ Validação concluída. Iniciando processamento de agendamentos..."
    # Inicia o loop de verificação de agendamentos (roda indefinidamente)
    exec node scripts/process-scheduled-posts.mjs
else
    echo "❌ Erro na validação. Encerrando para segurança."
    exit 1
fi