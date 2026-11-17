// Gera a capa que aparece quando o link do site é mandado no WhatsApp ou nas redes (1200 × 630), com o nome, o
// título e as cores do próprio site. Sai em site/imagens/capa-para-redes.png.
//   npm run capa
//   npm run capa -- --titulo "Outro texto para a capa"
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {lerTags, textoDe} from './fiscal/html.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opcao = (nome) => (args.includes(`--${nome}`) ? args[args.indexOf(`--${nome}`) + 1] : undefined);

let playwright;
try {
	playwright = createRequire(import.meta.url)('playwright');
} catch {
	console.error('A capa precisa do Playwright. Na nuvem do Claude ele já vem; no computador: `npm install --no-save playwright` e `npx playwright install chromium`.');
	process.exit(2);
}

const fabrica = JSON.parse(fs.readFileSync(path.join(raiz, 'fabrica.json'), 'utf8'));
// num projeto adotado o site pode não morar em site/: o fabrica.json diz onde (pastaDoSite)
const pastaDoSite = path.resolve(raiz, fabrica.pastaDoSite ?? 'site');
const html = fs.readFileSync(path.join(pastaDoSite, 'index.html'), 'utf8');
const tags = lerTags(html);
const de = (nome) => {
	const tag = tags.find((t) => t.nome === nome);
	return tag ? textoDe(html, tag) : '';
};
const marca = fabrica.nome ?? de('title');
const titulo = opcao('titulo') ?? de('h1') ?? marca;
const escapar = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const estilo = (arquivo) => pathToFileURL(path.join(pastaDoSite, 'estilo', arquivo)).href;

// site antigo (adotado) não tem os tokens da fábrica: a capa sai com cores e fontes neutras, que os tokens
// substituem quando existirem
const folhas = ['tokens.css', 'base.css'].filter((f) => fs.existsSync(path.join(pastaDoSite, 'estilo', f)));
const PADRAO = '*, *::before, *::after { box-sizing: border-box; } :root { --cor-fundo: #f6f5f2; --cor-texto: #1b1b1f; --cor-destaque: #2f5bea; --fonte-titulo: system-ui, -apple-system, "Segoe UI", sans-serif; --peso-titulo: 700; --aperto-titulo: -0.02em; } body { margin: 0; background: var(--cor-fundo); color: var(--cor-texto); font-family: var(--fonte-titulo); } h1 { margin: 0; font-family: var(--fonte-titulo); font-weight: var(--peso-titulo); letter-spacing: var(--aperto-titulo); }';
if (!folhas.length) console.log('Este site não tem estilo/tokens.css: a capa sai com cores neutras. Para a capa ter as cores do site, crie os tokens (veja docs/manual.md).');

const pagina = `<!doctype html><html lang="pt-BR" data-tema="claro"><head><meta charset="utf-8">
<style>${PADRAO}</style>${folhas.map((f) => `<link rel="stylesheet" href="${estilo(f)}">`).join('')}
<style>
	body { width: 1200px; height: 630px; display: grid; grid-template-rows: auto 1fr auto; padding: 64px 72px; overflow: hidden; }
	.marca { font-family: var(--fonte-titulo); font-weight: var(--peso-titulo); font-size: 34px; letter-spacing: var(--aperto-titulo); }
	h1 { align-self: center; max-width: 18ch; font-size: ${titulo.length > 60 ? 64 : 82}px; line-height: 1.02; }
	.barra { height: 14px; width: 220px; border-radius: 999px; background: var(--cor-destaque); }
</style></head><body><div class="marca">${escapar(marca)}</div><h1>${escapar(titulo)}</h1><div class="barra"></div></body></html>`;

const temporario = path.join(pastaDoSite, '_capa.html');
fs.writeFileSync(temporario, pagina);
const navegador = await playwright.chromium.launch();
try {
	const aba = await navegador.newPage({viewport: {width: 1200, height: 630}, colorScheme: 'light'});
	await aba.goto(pathToFileURL(temporario).href, {waitUntil: 'load'});
	await aba.evaluate(() => document.fonts.ready);
	// usa a pasta de imagens que o site já tem (site antigo costuma ter images/)
	const pastaImagens = ['imagens', 'images', 'img'].find((p) => fs.existsSync(path.join(pastaDoSite, p))) ?? 'imagens';
	fs.mkdirSync(path.join(pastaDoSite, pastaImagens), {recursive: true});
	const saida = path.join(pastaDoSite, pastaImagens, 'capa-para-redes.png');
	await aba.screenshot({path: saida});
	console.log(`Capa gravada em ${path.relative(raiz, saida).split(path.sep).join('/')} (${Math.round(fs.statSync(saida).size / 1024)} KB). Abra e olhe: o título cabe? Dá para ler pequeno?`);
} finally {
	await navegador.close();
	fs.rmSync(temporario, {force: true});
}
