---
name: mudanca
description: Faz uma mudança neste projeto do começo ao fim, do jeito combinado (entender, teste primeiro, fazer o mínimo, verificar, olhar o resultado, mostrar ao dono e fechar com diário e painel). Use sempre que o dono pedir qualquer coisa neste projeto - coisa nova, ajuste, conserto, texto, cor, tela, campo, relatório - ou disser "continua", "arruma", "muda", "acrescenta", mesmo que pareça pequeno.
---

# Mudança no projeto

Toda mudança segue `docs/manual.md`, na ordem. Resumo do que não pode faltar:

1. **Ler antes:** `PAINEL.md`, `FICHA.md`, `docs/regras-de-ouro.md` (inteiro). No `docs/aprendizados.md`, só busque
   o assunto.
2. **Repetir o pedido em uma frase** e dizer o que não vai mexer. Fora da ficha? Pergunte e atualize a ficha antes.
3. **Teste que falha primeiro** (regra nova ou conserto), depois o mínimo de código que faz passar.
4. **`npm run verificar`** sem erro. Mexeu em tela: `npm run telas`, abra as folhas e olhe.
5. **Mostrar ao dono** o que mudou para quem usa, com a folha de telas quando houver, e **os pontos fracos**.
6. **Fechar:** diário, lições (regras de ouro ou aprendizados), painel, `npm run fiscal -- --final` se for entregar,
   commit e envio pela skill `aprendizado:commits-limpos`.

Se travar numa etapa, veja a tabela "Sintoma, causa e conserto" do manual antes de inventar um caminho novo. Se o
pedido for um projeto novo (e não uma mudança neste), use a skill `fabrica:novo-projeto`.
