# Manual: como fazer uma mudança neste projeto

Passo a passo escrito para funcionar com qualquer modelo do Claude. Cada etapa diz o que entregar e como saber que
está certo. Não pule etapas.

| # | Etapa | Entrega | Comando |
|---|---|---|---|
| 1 | Entender | o pedido repetido em uma frase e conferido com a ficha | |
| 2 | Teste primeiro | um teste que falha pelo motivo certo | `npm test` |
| 3 | Fazer | o mínimo que faz o teste passar | |
| 4 | Verificar | zero erros | `npm run verificar` |
| 5 | Olhar | o resultado aberto e conferido como o dono vai ver | |
| | **Parada: mostrar ao dono** (o que mudou e o que não ficou bom) | | |
| 6 | Fechar | diário, lições, painel, commit e envio | `npm run fiscal -- --final` |

## 1. Entender

- Leia `PAINEL.md`, `FICHA.md` e `docs/regras-de-ouro.md`.
- Repita o pedido em uma frase ("Você quer que...") e diga o que **não** vai mexer.
- O pedido está na ficha? Se não, pergunte se entra; com o sim, atualize a ficha (e "Pronto quando") antes do código.
- **Certo quando:** dá para dizer em uma linha como conferir que ficou pronto.

## 2. Teste primeiro

- Regra nova ou conserto: escreva o teste em `tests/` e veja falhar pelo motivo certo.
- **Certo quando:** `npm test` mostra só o teste novo falhando.

## 3. Fazer

- O mínimo que resolve. Nada de reorganizar o que não foi pedido.
- **Certo quando:** o teste novo passa e os antigos continuam passando.

## 4. Verificar

- `npm run verificar`. Erro: corrija o projeto (nunca o fiscal). Aviso: corrija ou diga por que fica.

## 5. Olhar

- Abra o resultado do jeito que o dono abre e confira com a ficha na mão.

## 6. Fechar

Siga "Fechar a mudança" do `CLAUDE.md`: diário, lições, painel, commit e envio.

## Sintoma, causa e conserto

| Sintoma | Causa provável | Conserto |
|---|---|---|
| O commit é recusado | o gancho rodou `npm run verificar` e ele falhou | leia a saída, corrija, tente de novo (sem `--no-verify`) |
| `npm install x` é bloqueado | dependência sem o OK do dono | pergunte; com o sim, anote em "Dependências aprovadas" da ficha |
| Acentos aparecem trocados por símbolos estranhos | arquivo salvo fora do UTF-8 | salve de novo em UTF-8 (o fiscal aponta o arquivo e a linha) |
| No PowerShell o comando com `--` não funciona | o PowerShell engole o primeiro `--` | escreva `npm run fiscal '--' --final` (com aspas) |
