// Regras que valem para qualquer projeto da fábrica. Cada uma nasceu de um problema real (segredo vazado, nome que
// quebra no Windows, projeto sem painel que a conversa seguinte não entende). Regra nova: teste primeiro.
import {createHash} from 'node:crypto';
import {linhaDe} from './nucleo.mjs';

const erro = (mensagem, extra = {}) => ({nivel: 'erro', mensagem, ...extra});
const aviso = (mensagem, extra = {}) => ({nivel: 'aviso', mensagem, ...extra});

/** O que precisa existir para a próxima conversa (de qualquer modelo, em qualquer conta) entender o projeto. */
const OBRIGATORIOS = {
	'CLAUDE.md': 'as instruções que o Claude lê no começo de toda conversa',
	'PAINEL.md': 'a página que diz o estado do projeto e o que falta',
	'FICHA.md': 'o combinado com o dono: o que o projeto é, o que não é e quando está pronto',
	'README.md': 'a explicação para quem abre o repositório',
	'docs/diario.md': 'o registro de cada mudança',
	'docs/regras-de-ouro.md': 'as regras de qualidade lidas antes de toda mudança',
	'package.json': 'os comandos do projeto (verificar, test)',
	'.gitignore': 'a lista do que não vai para o GitHub',
};

/** Chaves com formato conhecido: achou uma destas num arquivo que vai para o git, é vazamento. */
const CHAVES = [
	['Anthropic', /sk-ant-[A-Za-z0-9_-]{20,}/],
	['OpenAI', /sk-(proj-)?[A-Za-z0-9_-]{40,}/],
	['Google', /AIza[0-9A-Za-z_-]{35}/],
	['GitHub', /gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,}/],
	['Slack', /xox[baprs]-[A-Za-z0-9-]{10,}/],
	['AWS', /AKIA[0-9A-Z]{16}/],
	['ElevenLabs', /sk_[a-f0-9]{40,}/],
	['Stripe', /[sr]k_live_[A-Za-z0-9]{20,}/],
	['chave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

/** `senha = "..."` e parecidos: pode ser exemplo, então é aviso. */
const ATRIBUICAO = /\b(senha|password|passwd|secret|segredo|token|api[_-]?key|chave[_-]?(?:da[_-]?)?api)\b["']?\s*[:=]\s*["']([^"'\s]{16,})["']/gi;
const DE_EXEMPLO = /exemplo|example|sua[-_ ]?chave|your[-_ ]?key|xxxx|0000|\*\*\*|<.*>|\$\{|process\.env|troque|coloque/i;

const RESERVADOS = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

/** Sinais de texto salvo com a codificação errada (acentos viram "Ã§", "Ã£"...). */
const QUEBRADO = /Ã[§£¡©³ºµª¢­‡ƒ‰]|Â[ºª°·]|â€[œ“™˜]|�/;

const dataBr = (texto) => {
	const m = texto?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
	return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

export const regrasGerais = [
	{
		id: 'arquivos-do-projeto',
		tipos: ['*'],
		checar: (p) =>
			Object.entries(OBRIGATORIOS)
				.filter(([arquivo]) => !p.existe(arquivo))
				.map(([arquivo, paraQue]) => erro(`falta ${arquivo} (${paraQue})`)),
	},
	{
		id: 'ficha',
		tipos: ['*'],
		manual: 'Se o que foi feito é mesmo o que a FICHA.md pede (releia a ficha com o resultado aberto).',
		checar: (p) => {
			const ficha = p.ler('FICHA.md');
			if (!ficha) return [];
			const achados = [];
			const nivel = p.final ? 'erro' : 'aviso';
			const pendentes = [...ficha.matchAll(/PREENCHER/g)].length;
			if (pendentes) achados.push({nivel, arquivo: 'FICHA.md', mensagem: `${pendentes} trecho(s) ainda com "PREENCHER": a ficha é o combinado com o dono, complete com as respostas da entrevista`});
			const secao = ficha.match(/^## Pronto quando\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';
			const itens = secao.match(/^- \[[ xX]\] .+$/gm) ?? [];
			if (itens.length < 3) achados.push({nivel, arquivo: 'FICHA.md', mensagem: 'a seção "## Pronto quando" precisa de pelo menos 3 itens de marcar (`- [ ] ...`) que dê para conferir olhando ou rodando'});
			const abertos = itens.filter((i) => /^- \[ \]/.test(i));
			if (p.final && abertos.length) achados.push(erro(`${abertos.length} item(ns) de "Pronto quando" sem marcar: ${abertos.map((i) => i.slice(6)).join('; ')}`, {arquivo: 'FICHA.md'}));
			return achados;
		},
	},
	{
		id: 'segredos',
		tipos: ['*'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of p.arquivos) {
				const nome = arquivo.split('/').pop();
				if (/^\.env(\.(local|production|development))?$/.test(nome)) achados.push(erro('arquivo de segredos indo para o GitHub: ponha `.env` no .gitignore e rode `git rm --cached` nele', {arquivo}));
			}
			for (const arquivo of p.deTexto()) {
				const texto = p.ler(arquivo) ?? '';
				for (const [dono, expr] of CHAVES) {
					const m = texto.match(expr);
					if (m) achados.push(erro(`parece uma chave de ${dono} escrita no arquivo. Tire daqui, ponha no .env (ou nos segredos do ambiente) e troque a chave no site do serviço: ela já deve ser considerada vazada`, {arquivo, linha: linhaDe(texto, m.index)}));
				}
				for (const m of texto.matchAll(ATRIBUICAO)) {
					if (DE_EXEMPLO.test(m[2]) || DE_EXEMPLO.test(m[0])) continue;
					achados.push(aviso(`"${m[1]}" com um valor fixo no código: se for segredo de verdade, vai para o .env`, {arquivo, linha: linhaDe(texto, m.index)}));
				}
			}
			return achados;
		},
	},
	{
		id: 'nomes-windows',
		tipos: ['*'],
		checar: (p) => {
			const achados = [];
			const vistos = new Map();
			for (const arquivo of p.arquivos) {
				const chave = arquivo.toLowerCase().normalize('NFC');
				if (vistos.has(chave) && vistos.get(chave) !== arquivo) achados.push(erro(`no Windows é o mesmo arquivo que "${vistos.get(chave)}" (só muda maiúscula/minúscula): renomeie um dos dois`, {arquivo}));
				vistos.set(chave, arquivo);
				for (const parte of arquivo.split('/')) {
					if (/[<>:"|?*\\]/.test(parte)) achados.push(erro(`nome com caractere que o Windows não aceita (< > : " | ? * \\)`, {arquivo}));
					else if (RESERVADOS.test(parte)) achados.push(erro(`"${parte}" é nome reservado do Windows: escolha outro`, {arquivo}));
					else if (/[. ]$/.test(parte)) achados.push(erro('nome terminando em ponto ou espaço: o Windows corta e o arquivo some', {arquivo}));
				}
				if (arquivo.length > 180) achados.push(aviso('caminho com mais de 180 letras: pode estourar o limite do Windows dentro da pasta do dono', {arquivo}));
			}
			return achados;
		},
	},
	{
		id: 'arquivo-grande',
		tipos: ['*'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of p.arquivos) {
				const mb = p.tamanho(arquivo) / 1024 / 1024;
				if (mb > 95) achados.push(erro(`${mb.toFixed(0)} MB: o GitHub recusa arquivo acima de 100 MB. Tire do git (.gitignore) e guarde em outro lugar`, {arquivo}));
				else if (mb > 25) achados.push(aviso(`${mb.toFixed(0)} MB: arquivo pesado deixa o repositório lento para sempre; confirme que precisa ir para o git`, {arquivo}));
			}
			return achados;
		},
	},
	{
		id: 'comandos',
		tipos: ['*'],
		checar: (p) => {
			if (!p.pkg) return p.existe('package.json') ? [erro('package.json não abre como JSON', {arquivo: 'package.json'})] : [];
			const achados = [];
			for (const comando of ['verificar', 'test', 'fiscal']) {
				if (!p.pkg.scripts?.[comando]) achados.push(erro(`falta o comando "npm run ${comando}" em scripts`, {arquivo: 'package.json'}));
			}
			const deps = Object.keys({...p.pkg.dependencies, ...p.pkg.devDependencies});
			if (deps.length && !p.existe('package-lock.json')) achados.push(erro('há dependências mas falta o package-lock.json: rode `npm install` e envie o arquivo (sem ele cada computador instala versões diferentes)', {arquivo: 'package.json'}));
			const ficha = p.ler('FICHA.md') ?? '';
			const aprovadas = ficha.match(/^## Dependências aprovadas\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';
			for (const dep of deps) {
				if (!aprovadas.includes(dep)) achados.push(aviso(`dependência "${dep}" sem o OK anotado: pergunte ao dono e registre em "## Dependências aprovadas" da FICHA.md (com o motivo)`, {arquivo: 'package.json'}));
			}
			return achados;
		},
	},
	{
		id: 'testes',
		tipos: ['*'],
		checar: (p) => {
			const testes = p.com(/^tests\/.+\.test\.m?js$/);
			if (testes.length) return [];
			if (p.tipo === 'site') return [];
			const nivel = p.tipo === 'sistema' || p.tipo === 'robo' ? 'erro' : 'aviso';
			return [{nivel, mensagem: 'nenhum teste em tests/*.test.mjs: toda regra do projeto precisa de um teste que passa e um que quebra'}];
		},
	},
	{
		id: 'painel-em-dia',
		tipos: ['*'],
		checar: (p) => {
			const painel = p.ler('PAINEL.md');
			if (!painel) return [];
			const dataPainel = dataBr(painel.match(/Atualizado em[^\n]*/)?.[0]);
			if (!dataPainel) return [aviso('falta a linha "Atualizado em dd/mm/aaaa"', {arquivo: 'PAINEL.md'})];
			const diario = p.ler('docs/diario.md') ?? '';
			const datas = [...diario.matchAll(/^## (\d{2}\/\d{2}\/\d{4})/gm)].map((m) => dataBr(m[1])).sort();
			const ultima = datas.at(-1);
			if (ultima && ultima > dataPainel) return [aviso(`o diário tem mudança de ${ultima.split('-').reverse().join('/')} e o painel parou antes: atualize o PAINEL.md ao fechar a mudança`, {arquivo: 'PAINEL.md'})];
			return [];
		},
	},
	{
		id: 'texto-quebrado',
		tipos: ['*'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of p.deTexto()) {
				if (/^ferramentas\/fiscal\//.test(arquivo)) continue;
				const texto = p.ler(arquivo) ?? '';
				const m = texto.match(QUEBRADO);
				if (m) achados.push(erro(`acentos quebrados ("${texto.slice(m.index, m.index + 12).replace(/\s+/g, ' ')}"): o arquivo foi salvo com a codificação errada; salve de novo em UTF-8`, {arquivo, linha: linhaDe(texto, m.index)}));
			}
			return achados;
		},
	},
	{
		id: 'pendencias',
		tipos: ['*'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of p.deTexto()) {
				if (/^(ferramentas\/fiscal\/|docs\/|CLAUDE\.md|\.claude\/)/.test(arquivo)) continue;
				const texto = p.ler(arquivo) ?? '';
				const afazer = [...texto.matchAll(/\b(TODO|FIXME|XXX)\b/g)];
				if (afazer.length) achados.push(aviso(`${afazer.length} marca(s) de pendência (${afazer[0][1]}): resolva ou leve para "Falta fazer" do diário`, {arquivo, linha: linhaDe(texto, afazer[0].index)}));
				const provisorio = texto.match(/PROVIS[ÓO]RIO/);
				if (provisorio) achados.push({nivel: p.final ? 'erro' : 'aviso', arquivo, linha: linhaDe(texto, provisorio.index), mensagem: 'trecho marcado como PROVISÓRIO: troque pela versão de verdade antes de entregar'});
			}
			return achados;
		},
	},
	{
		id: 'pecas-da-fabrica',
		tipos: ['*'],
		checar: (p) => {
			const mexidas = Object.entries(p.fabrica.pecas ?? {}).filter(([arquivo, assinatura]) => {
				const texto = p.ler(arquivo);
				return texto !== null && createHash('sha256').update(texto.replace(/\r\n/g, '\n')).digest('hex').slice(0, 12) !== assinatura;
			});
			const sumidas = Object.keys(p.fabrica.pecas ?? {}).filter((arquivo) => !p.existe(arquivo));
			const achados = [];
			if (mexidas.length) achados.push(aviso(`peça(s) da fábrica mexida(s) à mão: ${mexidas.map(([a]) => a).join(', ')}. A próxima atualização da fábrica desfaz. Se era um conserto, anote no diário e avise o dono para levar ao claude-kit; se não, desfaça com \`criar.mjs --atualizar\``));
			if (sumidas.length) achados.push(erro(`peça(s) da fábrica apagada(s): ${sumidas.join(', ')}. Traga de volta com \`criar.mjs --atualizar\``));
			return achados;
		},
	},
	{
		id: 'bat-no-windows',
		tipos: ['*'],
		checar: (p) => {
			const bats = p.com(/\.(bat|cmd)$/i);
			if (!bats.length) return [];
			const atributos = p.ler('.gitattributes') ?? '';
			if (/\*\.bat\s+.*eol=crlf/.test(atributos)) return [];
			return [aviso('há arquivo .bat mas o .gitattributes não tem `*.bat text eol=crlf`: sem isso o atalho pode chegar quebrado no Windows', {arquivo: bats[0]})];
		},
	},
];
