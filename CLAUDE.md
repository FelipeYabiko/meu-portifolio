# Portfólio de Felipe Yabiko

Portfólio de engenheiro de software: quem sou, o que faço e os projetos, com vídeos em loop de cada um.

Site que já estava no ar, adotado pela Fábrica de projetos do claude-kit em 17/11/2026 (tipo `site`). O dono (Felipe) não programa:
responda sempre em português simples e explique o que muda **para quem usa** (a tela, o arquivo, o resultado), não o
código. Ele roda comandos no PowerShell do Windows.

## Antes de mexer em qualquer coisa

1. Leia `PAINEL.md` (estado e o que falta) e `FICHA.md` (o combinado: o que o projeto é e o que **não** é).
2. Leia `docs/regras-de-ouro.md` inteiro. O `docs/aprendizados.md` é biblioteca: busque só o assunto do momento.
3. Mudança nova: siga `docs/manual.md` etapa por etapa (a skill `mudanca` deste projeto faz isso). Não pule etapa nem
   troque a ordem: cada uma evita um erro que já aconteceu.

## Regras que não se discutem

- **A ficha manda.** Só se constrói o que está na `FICHA.md`. Pedido fora dela: pergunte, e com o sim atualize a
  ficha antes do código. Sem "já que estou aqui".
- **Uma mudança por conversa**, pequena, que termina funcionando. Mudança grande vira lista em "Falta fazer" do
  painel e é feita uma por vez.
- **Prove antes de dizer que ficou pronto:** `npm run verificar` sem erro e, se mexeu em tela, `npm run telas` com as
  folhas abertas e olhadas. Diga ao dono também o que **não** ficou bom ou não foi testado.
- **Sem dependência nova sem o OK do dono.** O projeto roda sem instalar nada de propósito. O gancho bloqueia
  `npm install <pacote>` enquanto o pacote não estiver em "Dependências aprovadas" da ficha.
- **Não mexa no fiscal para ele passar** nem nos ganchos de `.claude/hooks/`: corrija o projeto. Regra nova só deste
  projeto vai em `ferramentas/fiscal/regras-do-projeto.mjs`, com teste.
- **Segredo nunca no código:** chave e senha ficam no `.env` (fora do git) ou nos segredos do ambiente da nuvem.
- **Nomes, comentários e mensagens em português**, no estilo do código em volta; comentário curto que explica o porquê.
- **Erro corrigido pela segunda vez vira regra do fiscal** (em comando não é esquecida; em texto é).

## Fechar a mudança (sempre, antes de dizer que acabou)

1. `npm run verificar` sem erro; antes de entregar ou publicar, `npm run fiscal -- --final`.
2. `docs/diario.md`: uma entrada com a data, o que mudou para quem usa e o que ficou faltando.
3. Lição que vale para toda mudança vai para `docs/regras-de-ouro.md`; detalhe, para `docs/aprendizados.md`.
4. `PAINEL.md` atualizado (estado, "Falta fazer" e a data).
5. Commit e envio seguindo a skill `aprendizado:commits-limpos` (autor é o Felipe, sem assinatura do Claude; `main` só
   com o OK dele). O gancho roda o `npm run verificar` antes de todo commit e trava se falhar.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run verificar` | fiscal + testes; roda sozinho antes de cada commit |
| `npm run fiscal` | só o fiscal, com os avisos (`-- --final` antes de entregar) |
| `npm test` | só os testes |
| `npm run ver` | abre o site neste computador (http://localhost:4173) |
| `npm run telas` | folha de telas: fotos da página no celular e no computador, em `folha/` |

## Como este site é feito

- **No ar em https://felipeyabiko.github.io/meu-portifolio/**, publicado pelo GitHub a cada envio para a `main`.
  Repositório público: tudo o que for enviado fica visível.
- **Uma página só, na pasta principal** (`"pastaDoSite": "."` no `fabrica.json`): `index.html`, `styles.css`,
  `app.js` (animações com GSAP, tela de abertura, prévia ao passar o mouse), `i18n.js` (os textos em inglês).
- **Todo texto tem versão em inglês:** quem tem `data-i18n` no `index.html` precisa da chave correspondente no
  `i18n.js`. Mudou um texto em português, mude o inglês junto.
- **Projeto novo em "Trabalho selecionado":** copie um bloco de projeto existente; vídeo em loop 4:3 (1200 × 900),
  sem som, `.mp4` + `.webm` + `-poster.webp` em `img/` (como gerar: `motion/README.md` e `img/LEIA-ME.txt`).
- **`shorts-factory/`** são as páginas de apresentação, política de privacidade e termos de um aplicativo: **nunca
  mude o endereço nem apague**.
- **`motion/` é outro projeto** (Remotion) que gera os vídeos dos cartões. O fiscal e a folha de telas não olham
  para ele.
- **A primeira foto da folha de telas** mostra a tela de abertura (contagem até 100): normal.

## Onde fica cada coisa

| O quê | Onde |
|---|---|
| Estado do projeto e o que falta | `PAINEL.md` |
| O combinado com o dono | `FICHA.md` |
| Passo a passo de uma mudança | `docs/manual.md` |
| Regras de qualidade (lidas sempre) | `docs/regras-de-ouro.md` |
| Lições guardadas (busca por assunto) | `docs/aprendizados.md` |
| Histórico das mudanças | `docs/diario.md` |
| Fiscal e ferramentas | `ferramentas/` (regras só deste projeto: `ferramentas/fiscal/regras-do-projeto.mjs`) |
| Travas automáticas | `.claude/hooks/` |
