# Validação isolada da API — 17/10/2026

Execução: https://github.com/marcondesjm/cliente-x-instagram/actions/runs/39077990789

Branch exclusiva de teste: test/kids-api-copy-validation-20261017. Não incorporar as alterações de destino de persistência ou workflow à produção.

Resultado: API respondeu à seleção da pauta kids-biblia-29 e rejeitou o mapa (distinct=false, referenceAccurate=false). Mapa retornou a cena 3, de Zaqueu na árvore, para a capa “Zaqueu recebeu Jesus em sua casa”. A etapa de verificação copyMatch não foi executada; portanto a correção da instrução não foi validada nesta execução. Nenhuma nova receita aprovada.

Uma chamada textual nova; observações de pixels reaproveitadas do cache vinculado a hashes. Provedor reportou entrada zero, tratada como desconhecida e contabilizada pelo máximo de 120.000 tokens. O número de saída informado não comprova custo ou identidade do modelo.

Evidência: artefato kids-scene-replenishment-evidence, ID 12117902240, inclui seleção rejeitada, candidatos e recibos. enabled=false; circuito vision_validation_failed; limites operacionais restaurados. Credenciais, agenda e histórico de main não foram modificados por este piloto. Montagem de receitas antigas não significa aprovação desta pauta.
