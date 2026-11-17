# Painel: Portfólio de Felipe Yabiko

A página para abrir primeiro: o que é, como está e o que falta. O Claude atualiza ao fim de toda conversa que muda
alguma coisa. Atualizado em 17/11/2026.

## O que é

O portfólio que está no ar: https://felipeyabiko.github.io/meu-portifolio/ . Uma página só, em português e inglês
(botão de idioma), voltada a vagas de engenharia de software (backend, dados e IA), com os projetos em vídeos em loop.
Também guarda as páginas do Shorts Factory (apresentação, política de privacidade e termos).

## Estado

| Parte | Situação | Próximo passo |
|---|---|---|
| Página principal | no ar; adotada pela Fábrica em 17/11/2026 sem mudar nada no site | |
| Projetos com vídeo | copom-mcp, FONAR, FinançasIA, Mercado, Dep's, Party Ranking, Basaltinho | projeto novo: ver "Como este site é feito" no `CLAUDE.md` |
| Páginas do Shorts Factory | no ar em `shorts-factory/` | nunca mudar o endereço delas |
| Fiscal | 0 erros | os avisos que sobram estão explicados em "Decisões" da ficha |

## Falta fazer

1. Nada urgente. O site está em ordem.
2. Opcional: dar descrição para o Google às três páginas do Shorts Factory.

## Como abrir

- **No ar:** https://felipeyabiko.github.io/meu-portifolio/ (o GitHub publica sozinho a cada envio para a `main`).
- **No computador:** `npm run ver` (abre em http://localhost:4173).
- **Mudar alguma coisa:** abra uma conversa no Claude Code com este repositório e peça em português.

## Onde fica cada coisa

| O quê | Onde |
|---|---|
| A página | `index.html`, `styles.css`, `app.js` (animações), `i18n.js` (textos em inglês), `og.png` (capa das redes) |
| Imagens e vídeos dos projetos | `img/` (como gerar os vídeos de novo: `motion/README.md`) |
| Páginas do Shorts Factory | `shorts-factory/` |
| O combinado | `FICHA.md` |
| Histórico | `docs/diario.md` |
