// Folha de telas: abre cada tela do projeto num navegador de verdade, no computador e no celular, clara e escura,
// tira uma foto de cada "dobra" (o que cabe na tela de cada vez) e monta uma folha por tela para aprovar.
// De quebra confere o que só o navegador sabe: erro de programação na página, imagem que não carregou, página
// vazando para o lado no celular e botão pequeno demais para o dedo.
//   npm run telas                         todas as telas
//   npm run telas -- --so contato         só as telas com "contato" no nome
//   npm run telas -- --tema claro         só um tema (claro | escuro)
//   npm run telas -- --aparelho celular   só um aparelho (computador | celular)
// As fotos ficam em folha/ (fora do git). Quem diz quais são as telas é ferramentas/telas.config.mjs.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(aqui, '..');
const args = process.argv.slice(2);
const opcao = (nome, padrao) => (args.includes(`--${nome}`) ? args[args.indexOf(`--${nome}`) + 1] : padrao);

const APARELHOS = {
	computador: {largura: 1440, altura: 900, escala: 1, colunas: 3, miniatura: 560},
	celular: {largura: 390, altura: 844, escala: 2, colunas: 6, miniatura: 270, toque: true},
};
const TEMAS = {claro: 'light', escuro: 'dark'};
const MAX_DOBRAS = 14;

let playwright;
try {
	// require (e não import) porque na nuvem o Playwright mora na pasta global, que só o require enxerga
	playwright = createRequire(import.meta.url)('playwright');
} catch {
	console.error(
		[
			'A folha de telas precisa do Playwright (o navegador de teste).',
			'- Na nuvem do Claude ele já vem instalado: rode de novo por lá.',
			'- No computador: `npm install --no-save playwright` e depois `npx playwright install chromium` (uma vez só).',
		].join('\n'),
	);
	process.exit(2);
}

const config = path.join(aqui, 'telas.config.mjs');
if (!fs.existsSync(config)) {
	console.error('Falta ferramentas/telas.config.mjs: ele sobe o projeto e devolve a lista de telas ({endereco, telas: [{nome, caminho}], fechar}).');
	process.exit(2);
}
const {preparar} = await import(pathToFileURL(config).href);
const {endereco, telas, fechar} = await preparar();

const so = opcao('so', '');
const temas = Object.keys(TEMAS).filter((t) => !opcao('tema') || t === opcao('tema'));
const aparelhos = Object.keys(APARELHOS).filter((a) => !opcao('aparelho') || a === opcao('aparelho'));
const escolhidas = telas.filter((t) => !so || t.nome.includes(so));
if (!escolhidas.length) {
	console.error(`Nenhuma tela com "${so}" no nome. Telas: ${telas.map((t) => t.nome).join(', ')}`);
	await fechar?.();
	process.exit(2);
}

const pastaFolha = path.join(raiz, 'folha');
fs.rmSync(pastaFolha, {recursive: true, force: true});
fs.mkdirSync(pastaFolha, {recursive: true});

const navegador = await playwright.chromium.launch();
const problemas = [];
const folhas = [];

/** Confere, dentro da página, o que só o navegador sabe. */
const olhar = (toque) => {
	const achados = [];
	const sobra = document.documentElement.scrollWidth - window.innerWidth;
	if (sobra > 1) achados.push({nivel: 'erro', mensagem: `a página vaza ${sobra}px para o lado (aparece barra de rolagem horizontal)`});
	for (const img of document.images) {
		// imagem sem endereço é moldura que o próprio site preenche depois (prévia ao passar o mouse): não é defeito
		if (img.getAttribute('src') && img.complete && img.naturalWidth === 0) achados.push({nivel: 'erro', mensagem: `imagem não carregou: ${img.getAttribute('src')}`});
	}
	if (toque) {
		const pequenos = [...document.querySelectorAll('a, button, input, select, textarea, summary')].filter((el) => {
			const r = el.getBoundingClientRect();
			if (!r.width || !r.height || el.type === 'hidden') return false;
			// link no meio de um parágrafo pode ser baixo; botão e campo, não
			const noTexto = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
			return !noTexto && (r.height < 40 || r.width < 40);
		});
		if (pequenos.length) {
			const exemplo = (pequenos[0].textContent || pequenos[0].getAttribute('aria-label') || pequenos[0].tagName).trim().slice(0, 30);
			achados.push({nivel: 'aviso', mensagem: `${pequenos.length} botão(ões) ou campo(s) com menos de 40px para o dedo (o primeiro: "${exemplo}")`});
		}
	}
	return achados;
};

for (const tela of escolhidas) {
	for (const nomeAparelho of aparelhos) {
		const aparelho = APARELHOS[nomeAparelho];
		for (const tema of temas) {
			const contexto = await navegador.newContext({
				viewport: {width: aparelho.largura, height: aparelho.altura},
				deviceScaleFactor: aparelho.escala,
				colorScheme: TEMAS[tema],
				hasTouch: Boolean(aparelho.toque),
				isMobile: Boolean(aparelho.toque),
				locale: 'pt-BR',
			});
			const pagina = await contexto.newPage();
			const onde = `${tela.nome} (${nomeAparelho}, ${tema})`;
			pagina.on('pageerror', (e) => problemas.push({nivel: 'erro', onde, mensagem: `erro de programação na página: ${e.message}`}));
			pagina.on('console', (m) => m.type() === 'error' && problemas.push({nivel: 'erro', onde, mensagem: `erro no console: ${m.text().slice(0, 200)}`}));
			pagina.on('requestfailed', (r) => {
				// vídeo e áudio: o navegador corta o download de propósito (só baixa o pedaço que vai tocar), e o Chromium
				// da nuvem nem toca MP4. Isso não é defeito do site; vira aviso para conferir no computador.
				const midia = r.resourceType() === 'media' || /\.(mp4|webm|mov|mp3|m4a|ogg)(\?|$)/i.test(r.url());
				if (midia && /ERR_ABORTED/.test(r.failure()?.errorText ?? '')) problemas.push({nivel: 'aviso', onde, mensagem: `vídeo ou áudio não tocou aqui (${r.url().split('/').pop()}): confira abrindo o site no computador`});
				else problemas.push({nivel: 'erro', onde, mensagem: `não carregou: ${r.url()}`});
			});
			pagina.on('response', (r) => r.status() >= 400 && problemas.push({nivel: 'erro', onde, mensagem: `resposta ${r.status()} em ${r.url()}`}));
			await pagina.goto(endereco + tela.caminho, {waitUntil: 'networkidle'});
			await pagina.evaluate(() => document.fonts?.ready);
			if (tela.esperar) await pagina.waitForSelector(tela.esperar, {timeout: 5000}).catch(() => problemas.push({nivel: 'erro', onde, mensagem: `não apareceu: ${tela.esperar}`}));

			const total = await pagina.evaluate(() => document.documentElement.scrollHeight);
			// uma foto por dobra; a última encosta no fim da página (sem repetir o rodapé em duas fotos)
			const fim = Math.max(0, total - aparelho.altura);
			const posicoes = [];
			for (let y = 0; y < fim && posicoes.length < MAX_DOBRAS - 1; y += aparelho.altura) posicoes.push(y);
			if (!posicoes.length || fim - posicoes.at(-1) > 40) posicoes.push(fim);
			const fotos = [];
			for (const [i, y] of posicoes.entries()) {
				// rola até a dobra e espera as animações de entrada terminarem antes da foto
				await pagina.evaluate((alvo) => window.scrollTo({top: alvo, behavior: 'instant'}), y);
				await pagina.waitForTimeout(i === 0 ? 700 : 450);
				const arquivo = `${tela.nome}-${nomeAparelho}-${tema}-${String(i + 1).padStart(2, '0')}.png`;
				await pagina.screenshot({path: path.join(pastaFolha, arquivo)});
				fotos.push(arquivo);
			}
			for (const achado of await pagina.evaluate(olhar, Boolean(aparelho.toque))) problemas.push({...achado, onde});
			await contexto.close();
			folhas.push({tela: tela.nome, aparelho: nomeAparelho, tema, fotos, cortada: total > MAX_DOBRAS * aparelho.altura});
		}
	}
}

// Monta uma folha (uma imagem só) por tela e aparelho, com os dois temas lado a lado: é o que o dono aprova.
const montador = await navegador.newPage({viewport: {width: 1800, height: 900}});
const arquivosDeFolha = [];
for (const tela of escolhidas) {
	for (const nomeAparelho of aparelhos) {
		const aparelho = APARELHOS[nomeAparelho];
		const grupos = folhas.filter((f) => f.tela === tela.nome && f.aparelho === nomeAparelho);
		const html = `<!doctype html><meta charset="utf-8"><style>
			body{margin:0;padding:28px;background:#16171a;color:#e9e9ec;font:15px/1.4 system-ui,sans-serif}
			h1{font-size:22px;margin:0 0 4px} p{margin:0 0 18px;color:#a0a3ab}
			h2{font-size:15px;margin:22px 0 10px;text-transform:uppercase;letter-spacing:.08em;color:#ffd166}
			.g{display:grid;grid-template-columns:repeat(${aparelho.colunas},${aparelho.miniatura}px);gap:14px}
			figure{margin:0} img{width:100%;display:block;border-radius:6px;outline:1px solid #33363d}
			figcaption{font-size:12px;color:#a0a3ab;margin-top:4px}
		</style><h1>${tela.nome} · ${nomeAparelho}</h1><p>${endereco}${tela.caminho} · ${aparelho.largura}×${aparelho.altura} · cada foto é uma dobra da página, de cima para baixo</p>
		${grupos.map((g) => `<h2>tema ${g.tema}${g.cortada ? ' (página longa: só as primeiras dobras)' : ''}</h2><div class="g">${g.fotos.map((f, i) => `<figure><img src="${pathToFileURL(path.join(pastaFolha, f)).href}"><figcaption>dobra ${i + 1}</figcaption></figure>`).join('')}</div>`).join('')}`;
		const temporario = path.join(pastaFolha, '_folha.html');
		fs.writeFileSync(temporario, html);
		await montador.goto(pathToFileURL(temporario).href, {waitUntil: 'load'});
		const arquivo = `folha-${tela.nome}-${nomeAparelho}.png`;
		await montador.screenshot({path: path.join(pastaFolha, arquivo), fullPage: true});
		fs.rmSync(temporario);
		arquivosDeFolha.push(arquivo);
	}
}
await navegador.close();
await fechar?.();

// Um problema repetido em vários temas e aparelhos aparece uma vez só, com a lista de onde.
const juntos = new Map();
for (const p of problemas) {
	const chave = `${p.nivel}|${p.mensagem}`;
	juntos.set(chave, {...p, onde: [...(juntos.get(chave)?.onde ?? []), p.onde]});
}
const lista = [...juntos.values()];
const erros = lista.filter((p) => p.nivel === 'erro');
const avisos = lista.filter((p) => p.nivel === 'aviso');
fs.writeFileSync(path.join(pastaFolha, 'relatorio.json'), JSON.stringify({telas: escolhidas.map((t) => t.nome), folhas: arquivosDeFolha, erros, avisos}, null, '\t'));

const linha = (p) => `  - ${p.mensagem}  [${[...new Set(p.onde)].slice(0, 3).join('; ')}${new Set(p.onde).size > 3 ? '; ...' : ''}]`;
console.log(`Folha de telas: ${escolhidas.length} tela(s), ${arquivosDeFolha.length} folha(s) em folha/ (${arquivosDeFolha.join(', ')}).`);
console.log(`O navegador achou ${erros.length} erro(s) e ${avisos.length} aviso(s).`);
if (erros.length) console.log(['ERROS (corrija antes de mostrar ao dono):', ...erros.map(linha)].join('\n'));
if (avisos.length) console.log(['AVISOS:', ...avisos.map(linha)].join('\n'));
console.log('Agora ABRA cada folha (é imagem) e olhe com calma: alinhamento, respiro, texto cortado, contraste em cima de foto, tema escuro.');
process.exit(erros.length ? 1 : 0);
