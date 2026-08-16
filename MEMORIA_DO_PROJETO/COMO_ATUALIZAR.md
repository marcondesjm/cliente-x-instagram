# Como Atualizar

Toda atualizacao concluida no projeto deve gerar um checkpoint, mesmo quando o usuario nao pedir novamente para salvar a memoria.

O checkpoint faz parte da propria entrega: adicionar uma nova entrada em `HISTORICO.md`, revisar `STATUS_ATUAL.md`, criar um commit de memoria quando necessario e sincroniza-lo com o repositorio remoto junto com a alteracao.

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

5. Antes de encerrar qualquer atualizacao:

- confirmar que `HISTORICO.md` registra a mudanca;
- confirmar que `STATUS_ATUAL.md` representa o estado atual;
- registrar o commit funcional e o commit de memoria, quando forem separados;
- enviar o checkpoint ao remoto quando a alteracao tambem tiver sido enviada;
- informar claramente qualquer validacao operacional que ainda dependa do usuario.

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
