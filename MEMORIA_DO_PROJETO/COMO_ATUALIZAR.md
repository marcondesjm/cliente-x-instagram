# Como Atualizar

Sempre que o usuario pedir para atualizar a memoria do projeto, adicionar uma nova entrada em `HISTORICO.md` e revisar `STATUS_ATUAL.md`.

## Checklist

1. Verificar estado do Git:

```powershell
git status --short
git branch --show-current
git log --oneline -3
```

2. Registrar:

- data e hora em BRT;
- branch atual;
- commit atual;
- arquivos principais alterados;
- validacoes executadas;
- resultado das validacoes;
- se houve deploy;
- se houve publicacao real;
- proximo passo recomendado.

3. Se houve mudanca no dashboard aprovada para commit/deploy, conferir versao visivel em:

- `api/state.js`
- `docs/dashboard.html`

4. Nunca registrar dry-run como publicacao real.

## Formato recomendado para nova entrada

```markdown
## AAAA-MM-DD HH:MM BRT

Resumo:

- ...

Validado:

- ...

Pendente:

- ...

Deploy/publicacao:

- Deploy: sim/nao
- Instagram real: sim/nao
```

