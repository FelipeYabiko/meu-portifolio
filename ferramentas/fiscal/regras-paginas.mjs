// Regras das páginas (sites e as telas dos sistemas): o que dá para conferir no HTML e no CSS sem abrir o navegador.
// O que só o olho confere (beleza, alinhamento, se o texto convence) fica na folha de telas: `npm run telas`.
import path from 'node:path';
import {linhaDe} from './nucleo.mjs';
import {ehExterno, lerTags, mioloDe, textoDe} from './html.mjs';
import {contraste, lerTokens, paresDe} from './cores.mjs';

const erro = (mensagem, extra = {}) => ({nivel: 'erro', mensagem, ...extra});
const aviso = (mensagem, extra = {}) => ({nivel: 'aviso', mensagem, ...extra});

/** As páginas de verdade: fora a biblioteca de seções (pedaços para copiar) e o que é gerado. */
export const paginasDe = (p) => p.com(/\.html?$/i).filter((a) => !/^(secoes|ferramentas|folha|saida|exemplos|tests)\//.test(a));

const resolver = (deArquivo, endereco) => {
	const limpo = endereco.split('#')[0].split('?')[0];
	if (!limpo) return null;
	const base = limpo.startsWith('/') ? limpo.slice(1) : path.posix.join(path.posix.dirname(deArquivo), limpo);
	const normal = path.posix.normalize(decodeURI(base));
	return normal.endsWith('/') || normal === '.' ? path.posix.join(normal, 'index.html') : normal;
};

/** Pedaços de endereço que só aparecem em link de exemplo. */
const LINK_DE_EXEMPLO = /\/(seu|sua|your)[-_]|[/@.](exemplo|example)\.(com|org|net)\b|9{4,}-?9{4}|(seu|your)usuario|SEU[_-]?USUARIO/i;

const VAGOS = /^(clique aqui|aqui|saiba mais|leia mais|ver mais|link|click here|here|more)$/i;
const IMAGEM = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export const regrasPaginas = [
	{
		id: 'pagina-base',
		tipos: ['site', 'sistema'],
		manual: ['Aparência: abra a folha de telas (`npm run telas`) e olhe cada tela no celular e no computador, clara e escura.', 'Texto: releia em voz alta; tem que soar como o dono fala, não como propaganda genérica.'],
		checar: (p) => {
			const achados = [];
			const titulos = new Map();
			for (const arquivo of paginasDe(p)) {
				const html = p.ler(arquivo) ?? '';
				const tags = lerTags(html);
				const uma = (nome) => tags.find((t) => t.nome === nome);
				const meta = (chave, valor) => tags.find((t) => t.nome === 'meta' && (t.atributos[chave] ?? '').toLowerCase() === valor);
				if (!/^\s*<!doctype html>/i.test(html)) achados.push(erro('falta `<!doctype html>` na primeira linha (sem ele o navegador desenha em modo antigo)', {arquivo}));
				if (!uma('html')?.atributos.lang) achados.push(erro('falta o idioma: `<html lang="pt-BR">` (leitor de tela e Google dependem disso)', {arquivo}));
				if (!meta('charset', 'utf-8')) achados.push(erro('falta `<meta charset="utf-8">`: acentos podem sair quebrados', {arquivo}));
				if (!meta('name', 'viewport')) achados.push(erro('falta `<meta name="viewport" content="width=device-width, initial-scale=1">`: no celular a página fica minúscula', {arquivo}));
				const tagTitulo = uma('title');
				const titulo = tagTitulo ? textoDe(html, tagTitulo) : '';
				if (!titulo) achados.push(erro('falta o `<title>` (o nome que aparece na aba e no Google)', {arquivo}));
				else {
					if (titulo.length > 60) achados.push(aviso(`título com ${titulo.length} letras: o Google corta depois de ~60`, {arquivo}));
					if (titulos.has(titulo)) achados.push(aviso(`mesmo título de ${titulos.get(titulo)}: cada página precisa do seu`, {arquivo}));
					titulos.set(titulo, arquivo);
				}
				// página que pede para não aparecer no Google (erro 404, obrigado) não precisa de descrição nem de capa
				if (p.tipo !== 'site' || /noindex/i.test(meta('name', 'robots')?.atributos.content ?? '')) continue;
				const descricao = meta('name', 'description')?.atributos.content ?? '';
				if (!descricao) achados.push(aviso('falta `<meta name="description">`: é o texto que aparece embaixo do título no Google', {arquivo}));
				else if (descricao.length < 50 || descricao.length > 160) achados.push(aviso(`descrição com ${descricao.length} letras: o bom é entre 50 e 160`, {arquivo}));
				for (const og of ['og:title', 'og:description', 'og:image']) {
					if (!meta('property', og)) achados.push(aviso(`falta \`<meta property="${og}">\`: sem ele o link fica sem capa no WhatsApp e nas redes`, {arquivo}));
				}
				if (!tags.some((t) => t.nome === 'link' && /icon/i.test(t.atributos.rel ?? ''))) achados.push(aviso('falta o ícone da aba (`<link rel="icon">`)', {arquivo}));
				const capa = meta('property', 'og:image')?.atributos.content;
				if (capa && !ehExterno(capa)) {
					if (!p.existe(resolver(arquivo, capa))) achados.push(aviso('a capa das redes ainda não existe: rode `npm run capa`', {arquivo}));
					if (p.final) achados.push(erro('a capa das redes precisa do endereço completo do site (WhatsApp e redes não aceitam caminho curto): rode `npm run endereco -- https://...`', {arquivo}));
				}
			}
			return achados;
		},
	},
	{
		id: 'titulos-de-secao',
		tipos: ['site'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of paginasDe(p)) {
				const tags = lerTags(p.ler(arquivo) ?? '').filter((t) => /^h[1-6]$/.test(t.nome));
				const h1 = tags.filter((t) => t.nome === 'h1');
				if (h1.length !== 1) achados.push(erro(`a página tem ${h1.length} título(s) principal(is) \`<h1>\`: precisa de exatamente 1`, {arquivo}));
				let anterior = 0;
				for (const t of tags) {
					const nivel = Number(t.nome[1]);
					if (anterior && nivel > anterior + 1) achados.push(aviso(`pulou de <h${anterior}> para <${t.nome}>: os níveis descem de um em um (é o índice que o leitor de tela usa)`, {arquivo, linha: t.linha}));
					anterior = nivel;
				}
			}
			return achados;
		},
	},
	{
		id: 'imagens',
		tipos: ['site', 'sistema'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of paginasDe(p)) {
				for (const t of lerTags(p.ler(arquivo) ?? '').filter((t) => t.nome === 'img')) {
					if (!('alt' in t.atributos)) achados.push(erro('imagem sem `alt`: descreva a imagem em uma frase (ou `alt=""` se for só enfeite)', {arquivo, linha: t.linha}));
					if (t.atributos.src && (!t.atributos.width || !t.atributos.height)) achados.push(aviso('imagem sem `width` e `height`: a página pula enquanto carrega', {arquivo, linha: t.linha}));
				}
			}
			for (const arquivo of p.com(IMAGEM)) {
				const kb = p.tamanho(arquivo) / 1024;
				if (kb > 2048) achados.push(erro(`imagem de ${(kb / 1024).toFixed(1)} MB: reduza para menos de 500 KB (largura de até 1920 px, formato webp ou jpg)`, {arquivo}));
				else if (kb > 500) achados.push(aviso(`imagem de ${kb.toFixed(0)} KB: acima de 500 KB a página demora no celular`, {arquivo}));
			}
			return achados;
		},
	},
	{
		id: 'links',
		tipos: ['site', 'sistema'],
		manual: 'Links para fora (redes sociais, WhatsApp, mapas): clique em cada um para ver se abre o lugar certo.',
		checar: (p) => {
			const achados = [];
			const idsDe = new Map();
			const ids = (arquivo) => {
				if (!idsDe.has(arquivo)) idsDe.set(arquivo, new Set(lerTags(p.ler(arquivo) ?? '').flatMap((t) => [t.atributos.id, t.nome === 'a' ? t.atributos.name : null]).filter(Boolean)));
				return idsDe.get(arquivo);
			};
			for (const arquivo of paginasDe(p)) {
				const html = p.ler(arquivo) ?? '';
				for (const t of lerTags(html)) {
					for (const atributo of ['href', 'src', 'poster']) {
						const endereco = t.atributos[atributo];
						if (endereco === undefined || ehExterno(endereco)) continue;
						if (atributo === 'href' && (endereco === '' || endereco === '#')) {
							achados.push({nivel: p.final ? 'erro' : 'aviso', arquivo, linha: t.linha, mensagem: 'link vazio (`href="#"`): aponte para o lugar certo ou tire o link'});
							continue;
						}
						// rota de aplicativo ("#/clientes") e endereço da API não são arquivo nem âncora da página
						if (p.tipo === 'sistema' && (/^#[/!]/.test(endereco) || endereco.startsWith('/api/'))) continue;
						if (endereco.startsWith('/') && p.tipo === 'site') {
							achados.push(erro(`caminho começando com "/" ("${endereco}"): no GitHub Pages o site mora numa subpasta e isso quebra. Use caminho relativo ("imagens/foto.jpg")`, {arquivo, linha: t.linha}));
							continue;
						}
						const alvo = resolver(arquivo, endereco);
						if (alvo && !p.existe(alvo)) {
							achados.push(erro(`aponta para "${endereco}", que não existe no projeto`, {arquivo, linha: t.linha}));
							continue;
						}
						const ancora = endereco.split('#')[1];
						if (ancora && atributo === 'href') {
							const onde = alvo ?? arquivo;
							if (/\.html?$/i.test(onde) && !ids(onde).has(decodeURIComponent(ancora))) achados.push(erro(`aponta para "#${ancora}", mas não existe nada com esse id em ${onde}`, {arquivo, linha: t.linha}));
						}
					}
					if (t.nome === 'a' || t.nome === 'button') {
						const texto = textoDe(html, t);
						const rotulo = t.atributos['aria-label'] || t.atributos.title;
						const temImagem = /<img\b[^>]*\balt\s*=\s*["'][^"']+["']/i.test(mioloDe(html, t));
						if (!texto && !rotulo && !temImagem) achados.push(erro(`<${t.nome}> sem texto: quem usa leitor de tela não sabe o que ele faz (escreva o texto ou ponha \`aria-label\`)`, {arquivo, linha: t.linha}));
						else if (t.nome === 'a' && VAGOS.test(texto)) achados.push(aviso(`link com texto vago ("${texto}"): diga para onde leva ("Ver os trabalhos")`, {arquivo, linha: t.linha}));
					}
				}
			}
			for (const arquivo of p.com(/\.css$/i)) {
				const css = (p.ler(arquivo) ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
				for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
					if (ehExterno(m[1]) || m[1].startsWith('#')) continue;
					const alvo = resolver(arquivo, m[1]);
					if (alvo && !p.existe(alvo)) achados.push(erro(`o CSS aponta para "${m[1]}", que não existe`, {arquivo, linha: linhaDe(css, m.index)}));
				}
			}
			return achados;
		},
	},
	{
		id: 'formularios',
		tipos: ['site', 'sistema'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of paginasDe(p)) {
				const html = p.ler(arquivo) ?? '';
				const tags = lerTags(html);
				const comFor = new Set(tags.filter((t) => t.nome === 'label').map((t) => t.atributos.for).filter(Boolean));
				for (const t of tags) {
					if (!['input', 'select', 'textarea'].includes(t.nome)) continue;
					if (['hidden', 'submit', 'button', 'reset', 'image'].includes(t.atributos.type)) continue;
					if (t.atributos['aria-label'] || t.atributos['aria-labelledby'] || t.atributos.title) continue;
					if (t.atributos.id && comFor.has(t.atributos.id)) continue;
					const antes = html.slice(0, t.indice).toLowerCase();
					if (antes.lastIndexOf('<label') > antes.lastIndexOf('</label')) continue;
					achados.push(erro('campo sem rótulo: ligue um `<label for="...">` ao `id` do campo (texto cinza dentro do campo não vale como rótulo)', {arquivo, linha: t.linha}));
				}
			}
			return achados;
		},
	},
	{
		id: 'contraste',
		tipos: ['site', 'sistema'],
		manual: 'Contraste de texto em cima de foto ou degradê: o fiscal só confere as cores dos tokens.',
		checar: (p) => {
			const achados = [];
			for (const arquivo of p.com(/(^|\/)tokens\.css$/)) {
				const {claro, escuro, ilegiveis} = lerTokens(p.ler(arquivo) ?? '');
				for (const nome of ilegiveis) achados.push(aviso(`não consegui ler a cor --cor-${nome}: escreva em #hex para o fiscal conferir o contraste`, {arquivo}));
				for (const [tema, cores] of [['claro', claro], ['escuro', escuro]]) {
					for (const [texto, fundo] of paresDe(cores)) {
						const c = contraste(cores[texto], cores[fundo]);
						if (c < 4.5) achados.push(erro(`tema ${tema}: --cor-${texto} (${cores[texto]}) sobre --cor-${fundo} (${cores[fundo]}) tem contraste ${c.toFixed(1)}; o mínimo para ler bem é 4,5. Escureça ou clareie uma das duas`, {arquivo}));
					}
				}
			}
			return achados;
		},
	},
	{
		id: 'estilo-nos-tokens',
		tipos: ['site', 'sistema'],
		checar: (p) => {
			const achados = [];
			const folhas = p.com(/\.css$/i).filter((a) => !/(^|\/)tokens\.css$/.test(a) && !/^(secoes|folha)\//.test(a));
			let temMovimento = false;
			let respeita = false;
			for (const arquivo of folhas) {
				const css = (p.ler(arquivo) ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
				const soltas = [...css.matchAll(/#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/gi)];
				if (soltas.length) achados.push(aviso(`${soltas.length} cor(es) escrita(s) direto no CSS (a primeira: ${soltas[0][0]}): cor mora só no tokens.css, senão o tema escuro e a troca de marca quebram`, {arquivo, linha: linhaDe(css, soltas[0].index)}));
				if (/\b(animation|transition)\s*:/.test(css)) temMovimento = true;
				if (/prefers-reduced-motion/.test(css)) respeita = true;
			}
			if (temMovimento && !respeita) achados.push(aviso('há animação mas nenhum `@media (prefers-reduced-motion: reduce)`: quem pediu menos movimento no aparelho precisa ser respeitado', {arquivo: folhas[0]}));
			for (const arquivo of paginasDe(p)) {
				const emLinha = lerTags(p.ler(arquivo) ?? '').filter((t) => t.atributos.style);
				if (emLinha.length > 3) achados.push(aviso(`${emLinha.length} estilos escritos direto na tag (\`style="..."\`): leve para o CSS, com as classes e os tokens`, {arquivo, linha: emLinha[0].linha}));
			}
			return achados;
		},
	},
	{
		id: 'conteudo-de-exemplo',
		tipos: ['site'],
		checar: (p) => {
			const achados = [];
			const nivel = p.final ? 'erro' : 'aviso';
			for (const arquivo of paginasDe(p)) {
				const html = p.ler(arquivo) ?? '';
				const tags = lerTags(html);
				const exemplos = tags.filter((t) => 'data-exemplo' in t.atributos);
				if (exemplos.length) achados.push({nivel, arquivo, linha: exemplos[0].linha, mensagem: `${exemplos.length} trecho(s) ainda com o texto de exemplo do modelo (marcados com \`data-exemplo\`): troque pelo conteúdo do dono e apague a marca`});
				// exemplo-capa.svg (modelo da fábrica), exemplo.png, exemplo2.jpg (sites antigos): imagem que só segura o lugar
				const imagens = tags.filter((t) => /(^|\/)(exemplo|placeholder)([-_\d][^/]*)?\.[a-z0-9]+$/i.test(t.atributos.src ?? ''));
				if (imagens.length) achados.push({nivel, arquivo, linha: imagens[0].linha, mensagem: `${imagens.length} imagem(ns) de exemplo, que só seguram o lugar (${imagens.map((t) => t.atributos.src.split('/').pop()).join(', ')}): troque pelas imagens do dono`});
				// endereço que ainda é o de exemplo (perfil "seu-linkedin", e-mail @exemplo.com, telefone 99999-9999):
				// o visitante clica e cai em lugar nenhum. O texto marcado com data-exemplo já é contado acima.
				const falsos = tags.filter((t) => !('data-exemplo' in t.atributos) && /^(https?:|mailto:|tel:)/i.test(t.atributos.href ?? '') && LINK_DE_EXEMPLO.test(t.atributos.href));
				for (const t of falsos) achados.push({nivel, arquivo, linha: t.linha, mensagem: `link que ainda é de exemplo ("${t.atributos.href}"): troque pelo endereço de verdade ou tire o link`});
				const lorem = html.match(/lorem ipsum/i);
				if (lorem) achados.push(erro('texto "lorem ipsum": nunca entregue texto falso, escreva o texto real (ou pergunte ao dono)', {arquivo, linha: linhaDe(html, lorem.index)}));
			}
			return achados;
		},
	},
	{
		id: 'peso-da-pagina',
		tipos: ['site'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of paginasDe(p)) {
				const html = p.ler(arquivo) ?? '';
				const locais = new Set([arquivo]);
				for (const t of lerTags(html)) {
					if (t.nome === 'video' || t.nome === 'source') continue;
					for (const atributo of ['href', 'src']) {
						const endereco = t.atributos[atributo];
						if (!endereco || ehExterno(endereco) || (t.nome === 'a' && atributo === 'href')) continue;
						const alvo = resolver(arquivo, endereco);
						if (alvo && p.existe(alvo)) locais.add(alvo);
					}
				}
				const kb = [...locais].reduce((soma, a) => soma + p.tamanho(a), 0) / 1024;
				if (kb > 1500) achados.push(aviso(`a página carrega ${(kb / 1024).toFixed(1)} MB logo de cara: passe de 1,5 MB e o celular com internet fraca desiste`, {arquivo}));
			}
			return achados;
		},
	},
];
