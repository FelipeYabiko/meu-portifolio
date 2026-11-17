// Grava o endereço definitivo do site em todos os lugares que precisam dele, de uma vez (fazer à mão em cinco
// lugares é pedir para esquecer um): endereço oficial de cada página, capa das redes, mapa do site, robots.txt e a
// página de erro. Pode rodar de novo quando o endereço mudar.
//   npm run endereco -- https://felipeyabiko.github.io/meu-site/
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arquivoFabrica = path.join(raiz, 'fabrica.json');
const fabrica = JSON.parse(fs.readFileSync(arquivoFabrica, 'utf8'));
// num projeto adotado o site pode não morar em site/: o fabrica.json diz onde (pastaDoSite)
const pasta = path.resolve(raiz, fabrica.pastaDoSite ?? 'site');
const FORA = new Set(['node_modules', 'folha', 'secoes', 'ferramentas', 'docs', 'tests', 'dist']);
let endereco = process.argv[2] ?? '';
if (!/^https:\/\/[^\s/]+\.[^\s/]+(\/[^\s]*)?$/.test(endereco)) {
	console.error('Diga o endereço completo do site, começando com https://  Ex.: npm run endereco -- https://felipeyabiko.github.io/meu-site/');
	process.exit(1);
}
if (!endereco.endsWith('/')) endereco += '/';

const paginas = (dir, base = dir) =>
	fs.readdirSync(dir, {withFileTypes: true}).flatMap((item) => {
		const inteiro = path.join(dir, item.name);
		if (item.isDirectory()) return item.name.startsWith('.') || FORA.has(item.name) ? [] : paginas(inteiro, base);
		return item.name.endsWith('.html') ? [path.relative(base, inteiro).split(path.sep).join('/')] : [];
	});

/** Troca a tag que casa com `expr` ou, se ela não existir, põe a nova antes do </head>. */
const porNoHead = (html, expr, tag) => (expr.test(html) ? html.replace(expr, tag) : html.replace(/\n?(\s*)<\/head>/i, `\n\t${tag}\n$1</head>`));

const mudadas = [];
const noMapa = [];
for (const rel of paginas(pasta)) {
	const arquivo = path.join(pasta, rel);
	const antes = fs.readFileSync(arquivo, 'utf8');
	let html = antes;
	const daPagina = endereco + (rel === 'index.html' ? '' : rel.replace(/(^|\/)index\.html$/, '$1'));
	if (rel === '404.html') {
		// a página de erro aparece em qualquer endereço errado, então os caminhos dela precisam partir da raiz do site
		html = porNoHead(html, /<base\s[^>]*>/i, `<base href="${endereco}">`);
	} else {
		html = porNoHead(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${daPagina}">`);
		html = porNoHead(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${daPagina}">`);
		html = html.replace(/(<meta\s+property="og:image"\s+content=")([^"]*)(")/i, (_, a, atual, c) => a + endereco + atual.replace(/^https?:\/\/[^/]+\/(.*\/)?(?=imagens\/)/, '').replace(/^\.?\//, '') + c);
		if (!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) noMapa.push(daPagina);
	}
	if (html !== antes) {
		fs.writeFileSync(arquivo, html);
		mudadas.push(rel);
	}
}

const hoje = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(pasta, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${noMapa.map((u) => `\t<url><loc>${u}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(pasta, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${endereco}sitemap.xml\n`);

fs.writeFileSync(arquivoFabrica, `${JSON.stringify({...fabrica, endereco}, null, '\t')}\n`);

console.log(`Endereço ${endereco} gravado em ${mudadas.length} página(s) (${mudadas.join(', ') || 'já estavam certas'}), no sitemap.xml (${noMapa.length} página(s)) e no robots.txt.`);
if (!fs.existsSync(path.join(pasta, 'imagens', 'capa-para-redes.png'))) console.log('Falta a capa das redes: rode `npm run capa`.');
