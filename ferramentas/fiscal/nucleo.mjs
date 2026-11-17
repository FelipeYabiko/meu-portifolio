// Núcleo do fiscal: junta os arquivos do projeto e roda as regras. Cada regra devolve achados
// {regra, nivel: 'erro' | 'aviso', arquivo?, mensagem}. Erro trava o commit; aviso é para olhar.
// Este arquivo vem da Fábrica de projetos (claude-kit). Para atualizar: `criar.mjs --atualizar`.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

/** Pastas que nunca fazem parte do projeto (geradas ou de terceiros). */
const FORA = new Set(['.git', 'node_modules', 'folha', 'dist', '.cache']);

/** Extensões lidas como texto pelas regras. */
const TEXTO = /\.(m?js|cjs|ts|tsx|jsx|json|jsonl|md|txt|html?|css|svg|ya?ml|bat|command|sh|ps1|csv|xml|exemplo)$/i;

const paraPosix = (p) => p.split(path.sep).join('/');

/** Transforma uma linha do .gitignore num teste simples (basta para os modelos da fábrica). */
const padraoIgnore = (linha) => {
	const negado = linha.startsWith('!');
	let p = (negado ? linha.slice(1) : linha).replace(/\/$/, '');
	const ancorado = p.startsWith('/');
	if (ancorado) p = p.slice(1);
	const re = p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '§').replace(/\*/g, '[^/]*').replace(/§/g, '.*').replace(/\?/g, '[^/]');
	const expr = ancorado || p.includes('/') ? new RegExp(`^${re}(/|$)`) : new RegExp(`(^|/)${re}(/|$)`);
	return {negado, expr};
};

/** Lista os arquivos que iriam para o git: usa o próprio git quando dá; senão, anda pelas pastas lendo o .gitignore. */
export const listarArquivos = (raiz) => {
	if (fs.existsSync(path.join(raiz, '.git'))) {
		try {
			const saida = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], {cwd: raiz, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore']});
			const lista = saida.split('\0').filter((a) => a && fs.existsSync(path.join(raiz, a)) && !FORA.has(a.split('/')[0]));
			if (lista.length) return lista.sort();
		} catch {
			// sem git instalado: cai no modo de andar pelas pastas
		}
	}
	const arquivoIgnore = path.join(raiz, '.gitignore');
	const padroes = fs.existsSync(arquivoIgnore)
		? fs.readFileSync(arquivoIgnore, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map(padraoIgnore)
		: [];
	const ignorado = (rel) => {
		let fora = false;
		for (const {negado, expr} of padroes) if (expr.test(rel)) fora = !negado;
		return fora;
	};
	const lista = [];
	const andar = (pasta) => {
		for (const item of fs.readdirSync(pasta, {withFileTypes: true})) {
			if (FORA.has(item.name)) continue;
			const inteiro = path.join(pasta, item.name);
			const rel = paraPosix(path.relative(raiz, inteiro));
			if (ignorado(rel)) continue;
			if (item.isDirectory()) andar(inteiro);
			else if (item.isFile()) lista.push(rel);
		}
	};
	andar(raiz);
	return lista.sort();
};

/** Monta o objeto que as regras recebem: lista de arquivos, leitura com cache e os dados do fabrica.json. */
export const abrirProjeto = (raiz, {final = false} = {}) => {
	const arquivos = listarArquivos(raiz);
	const conjunto = new Set(arquivos);
	const cache = new Map();
	const ler = (rel) => {
		if (!cache.has(rel)) {
			const inteiro = path.join(raiz, rel);
			cache.set(rel, fs.existsSync(inteiro) ? fs.readFileSync(inteiro, 'utf8') : null);
		}
		return cache.get(rel);
	};
	const lerJson = (rel) => {
		try {
			return JSON.parse(ler(rel) ?? 'null');
		} catch {
			return null;
		}
	};
	const fabrica = lerJson('fabrica.json') ?? {};
	return {
		raiz,
		final,
		arquivos,
		tipo: fabrica.tipo ?? 'livre',
		fabrica,
		pkg: lerJson('package.json'),
		existe: (rel) => conjunto.has(rel) || fs.existsSync(path.join(raiz, rel)),
		noGit: (rel) => conjunto.has(rel),
		ler,
		lerJson,
		tamanho: (rel) => fs.statSync(path.join(raiz, rel)).size,
		deTexto: () => arquivos.filter((a) => TEXTO.test(a)),
		com: (expr) => arquivos.filter((a) => expr.test(a)),
	};
};

/** Número da linha (a partir de 1) em que está a posição `indice` do texto. */
export const linhaDe = (texto, indice) => texto.slice(0, indice).split('\n').length;

/**
 * Roda as regras que valem para o tipo do projeto. Regra que quebra por dentro vira erro do fiscal (nunca passa em
 * silêncio): fiscal que falha calado é pior do que não ter fiscal.
 */
export const fiscalizar = async (raiz, regras, opcoes = {}) => {
	const projeto = abrirProjeto(raiz, opcoes);
	const achados = [];
	const manuais = [];
	for (const regra of regras) {
		if (!regra.tipos.includes('*') && !regra.tipos.includes(projeto.tipo)) continue;
		if (regra.manual) manuais.push(...[regra.manual].flat());
		if (!regra.checar) continue;
		try {
			for (const achado of (await regra.checar(projeto)) ?? []) achados.push({regra: regra.id, nivel: 'erro', ...achado});
		} catch (e) {
			achados.push({regra: regra.id, nivel: 'erro', mensagem: `a regra quebrou por dentro (${e.message}); avise na conversa`});
		}
	}
	return {
		projeto,
		erros: achados.filter((a) => a.nivel === 'erro'),
		avisos: achados.filter((a) => a.nivel === 'aviso'),
		manuais,
	};
};

/** Texto do relatório, do jeito que aparece no terminal e volta para o Claude. */
export const relatorio = ({projeto, erros, avisos, manuais}, {quieto = false} = {}) => {
	const linha = (a) => `  - [${a.regra}] ${a.arquivo ? `${a.arquivo}${a.linha ? `:${a.linha}` : ''}: ` : ''}${a.mensagem}`;
	const partes = [`Fiscal do projeto (tipo ${projeto.tipo}${projeto.final ? ', modo final' : ''}): ${erros.length} erro(s), ${avisos.length} aviso(s).`];
	if (erros.length) partes.push('ERROS (travam; corrija todos):', ...erros.map(linha));
	if (avisos.length && !quieto) partes.push('AVISOS (olhe cada um; corrija ou diga por que fica):', ...avisos.map(linha));
	if (!quieto && manuais.length) partes.push('O fiscal NÃO confere (continua manual):', ...manuais.map((m) => `  - ${m}`));
	if (!erros.length && !projeto.final && !quieto) partes.push('Antes de entregar ou publicar, rode também: npm run fiscal -- --final');
	return partes.join('\n');
};
