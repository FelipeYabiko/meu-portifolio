# Ficha: Portfólio de Felipe Yabiko

O combinado com o dono. Escrita em 17/11/2026 a partir do site que já estava no ar (adoção pela Fábrica). As
suposições estão marcadas com "supus que".

## O que é

O portfólio de engenheiro de software do Felipe: quem ele é, o que faz e os projetos, cada um com um vídeo em loop.

## Para quem

Recrutadores e times de engenharia (backend, dados e IA), em português e em inglês. Supus que: chegam pelo LinkedIn,
pelo GitHub e pelo currículo, no computador e no celular.

## O que a pessoa consegue fazer

1. Entender na primeira tela quem é o Felipe e o que ele faz.
2. Ver os projetos selecionados em vídeo, com o que foi feito e os links (no ar, repositório).
3. Ver os outros projetos ("Também construí") e a trajetória.
4. Trocar o idioma entre português e inglês.
5. Entrar em contato (e-mail com botão de copiar, GitHub, LinkedIn).

## Seções do site

| Seção | O que diz |
|---|---|
| Topo (`#topo`) | nome, frase de apresentação e números (produtos no ar, pessoas que usam, inglês, formatura) |
| O que eu faço (`#sobre`) | IA e LLMs, dados, automação, produto |
| Trabalho selecionado (`#trabalho`) | os projetos com vídeo em loop |
| Também construí e trajetória (`#trajetoria`) | projetos menores e o caminho até aqui |
| Contato (`#contato`) | "Vamos conversar", e-mail, GitHub, LinkedIn |

## Ação principal

Ver os projetos e chamar para conversar (e-mail).

## Regras

- As páginas `shorts-factory/` (apresentação, privacidade, termos) não mudam de endereço: um aplicativo cadastrado
  pode depender delas.
- Todo texto existe em português e em inglês (`i18n.js`).
- Vídeo de projeto em loop, sem som, leve (ver `img/LEIA-ME.txt`), com imagem de capa (`-poster.webp`).
- Mudança no visual só com pedido do Felipe.

## Fora do combinado (não fazer agora)

- Redesenho, troca de fontes ou de cores.
- Páginas próprias para cada projeto.
- Blog.

## Pronto quando

- [x] O site abre sem erro no computador e no celular (folha de telas de 17/11/2026, sem erros do navegador).
- [x] Todo link de rede social leva ao perfil de verdade.
- [x] O link mandado no WhatsApp aparece com a capa (`og.png`, endereço completo).

## Dependências aprovadas

Nenhuma no site (o GSAP das animações vem de fora, como já era). O projeto `motion/` tem as dependências dele
(Remotion), no `motion/package.json`.

## Decisões

| Data | Decisão | Por quê |
|---|---|---|
| 17/11/2026 | Adotado pela Fábrica do claude-kit (tipo `site`), com as páginas na pasta principal (`pastaDoSite: "."`) | ganhar painel, ficha, fiscal e folha de telas sem mexer no site |
| 17/11/2026 | Avisos aceitos: cores no `styles.css` (sem `tokens.css`), alguns estilos escritos na tag, e as páginas do Shorts Factory sem descrição nem capa para redes | mudar seria redesenho; as páginas legais não são compartilhadas |
