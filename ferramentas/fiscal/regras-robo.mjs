// Regras dos robôs (modelo `robo`): os passos seguem o combinado (usam o ctx, têm teste), os segredos estão
// documentados e fora do código, o agendamento não exagera e o exemplo da fábrica não é entregue como se fosse o
// robô do dono.
import {linhaDe} from './nucleo.mjs';

const erro = (mensagem, extra = {}) => ({nivel: 'erro', mensagem, ...extra});
const aviso = (mensagem, extra = {}) => ({nivel: 'aviso', mensagem, ...extra});

const semComentarios = (codigo) => codigo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

/** O que um passo não pode usar por conta própria, e por quê. */
const PROIBIDOS = [
	[/\bfrom\s+['"](node:)?fs(\/promises)?['"]|\brequire\(\s*['"](node:)?fs/, 'mexe em arquivo direto (`fs`): use ctx.escrever, ctx.acrescentar e ctx.lerArquivo, senão o modo ensaio grava de verdade'],
	[/(^|[^.\w])fetch\s*\(/, 'chama a internet direto (`fetch`): use ctx.rede.buscarTexto ou buscarJson, senão o teste depende da internet e não há nova tentativa'],
	[/\bfrom\s+['"](node:)?child_process['"]/, 'roda outro programa (`child_process`): combine com o dono antes; isso não é coberto pelo modo ensaio'],
	[/\bprocess\.env\b/, 'lê segredo direto (`process.env`): use ctx.segredo(\'NOME\'), que explica ao dono o que falta'],
];

export const regrasRobo = [
	{
		id: 'config',
		tipos: ['robo'],
		manual: ['Rodar de verdade uma vez (`npm start`) e abrir o que saiu em saida/: é o que o dono vai receber.', 'Rodar duas vezes seguidas: a segunda não pode repetir nem perder nada.'],
		checar: (p) => {
			const texto = p.ler('config.json');
			if (texto === null) return [erro('falta config.json')];
			let config;
			try {
				config = JSON.parse(texto);
			} catch (e) {
				return [erro(`config.json não abre como JSON: ${e.message}`, {arquivo: 'config.json'})];
			}
			const achados = [];
			if (config.exemplo) achados.push({nivel: p.final ? 'erro' : 'aviso', arquivo: 'config.json', mensagem: 'o robô ainda é o de exemplo da fábrica (`"exemplo": true`): troque as fontes e os passos pelos da FICHA.md e apague a marca'});
			const olhar = (objeto, caminho) => {
				for (const [chave, valor] of Object.entries(objeto ?? {})) {
					if (valor && typeof valor === 'object') olhar(valor, `${caminho}${chave}.`);
					else if (typeof valor === 'string' && valor.length >= 8 && /senha|password|token|secret|segredo|chave|api_?key/i.test(chave)) achados.push(erro(`"${caminho}${chave}" parece um segredo dentro do config.json (que vai para o GitHub): leve para o .env e use ctx.segredo`, {arquivo: 'config.json'}));
				}
			};
			olhar(config, '');
			return achados;
		},
	},
	{
		id: 'passos',
		tipos: ['robo'],
		checar: (p) => {
			const achados = [];
			const passos = p.com(/^passos\/[^/]+\.mjs$/);
			if (!passos.length) return [erro('nenhum passo em passos/ (arquivos "1-nome.mjs", "2-nome.mjs"...)')];
			const testes = p.com(/^tests\/.+\.test\.mjs$/).filter((a) => !/motor\.test\.mjs$/.test(a)).map((a) => p.ler(a) ?? '').join('\n');
			for (const arquivo of passos) {
				const nome = arquivo.replace(/^passos\/|\.mjs$/g, '');
				if (!/^\d+-[a-z0-9-]+$/.test(nome)) {
					achados.push(erro('nome fora do padrão "número-nome.mjs" (minúsculas e hífen): o motor não roda este arquivo', {arquivo}));
					continue;
				}
				const codigo = semComentarios(p.ler(arquivo) ?? '');
				if (!/export\s+(const\s+rodar\s*=|async\s+function\s+rodar\b|function\s+rodar\b)/.test(codigo)) achados.push(erro('o passo precisa exportar a função `rodar(entrada, ctx)`', {arquivo}));
				if (!/export\s+const\s+descricao\s*=/.test(codigo)) achados.push(aviso('falta `export const descricao = \'...\'`: é a frase que aparece no registro de cada rodada', {arquivo}));
				for (const [expr, motivo] of PROIBIDOS) {
					const m = codigo.match(expr);
					if (m) achados.push(erro(`o passo ${motivo}`, {arquivo, linha: linhaDe(codigo, m.index)}));
				}
			}
			// passos de um robô real costumam ser testados juntos (a rodada inteira); basta haver teste que rode o robô
			if (!/executar\s*\(/.test(testes) && !passos.every((a) => testes.includes(a.replace(/^passos\/|\.mjs$/g, '')))) achados.push(aviso('os passos não aparecem nos testes: tests/passos.test.mjs precisa rodar o robô com a internet de faz de conta (um caso que dá certo e um que falha)'));
			return achados;
		},
	},
	{
		id: 'segredos-do-robo',
		tipos: ['robo'],
		checar: (p) => {
			const exemplo = p.ler('.env.exemplo');
			const usados = new Set();
			for (const arquivo of p.com(/^(passos|lib)\/.+\.mjs$/)) for (const m of semComentarios(p.ler(arquivo) ?? '').matchAll(/ctx\.segredo\(\s*['"]([A-Z0-9_]+)['"]\s*\)/g)) usados.add(m[1]);
			if (!usados.size) return [];
			if (exemplo === null) return [erro(`os passos pedem segredo (${[...usados].join(', ')}) mas falta o .env.exemplo dizendo ao dono o que preencher`)];
			const achados = [...usados].filter((nome) => !new RegExp(`^#?\\s*${nome}=`, 'm').test(exemplo)).map((nome) => erro(`o segredo ${nome} é pedido por um passo mas não está no .env.exemplo (uma linha \`${nome}=\` com um comentário dizendo onde conseguir)`, {arquivo: '.env.exemplo'}));
			for (const arquivo of p.com(/^\.github\/workflows\/.+\.ya?ml$/)) {
				const fluxo = p.ler(arquivo) ?? '';
				if (!/node\s+robo\.mjs/.test(fluxo)) continue;
				for (const nome of usados) if (!new RegExp(`^\\s*${nome}:\\s*\\$\\{\\{\\s*secrets\\.${nome}\\s*\\}\\}`, 'm').test(fluxo)) achados.push(aviso(`o agendamento do GitHub não passa o segredo ${nome} para o robô (em \`env:\` do passo "Rodar": \`${nome}: \${{ secrets.${nome} }}\`)`, {arquivo}));
			}
			return achados;
		},
	},
	{
		id: 'agendamento',
		tipos: ['robo'],
		checar: (p) => {
			const achados = [];
			for (const arquivo of p.com(/^\.github\/workflows\/.+\.ya?ml$/)) {
				const fluxo = p.ler(arquivo) ?? '';
				for (const m of fluxo.matchAll(/^\s*-\s*cron:\s*['"]([^'"]+)['"]/gm)) {
					const campos = m[1].trim().split(/\s+/);
					if (campos.length !== 5) achados.push(erro(`horário "${m[1]}" precisa de 5 partes (minuto hora dia mês dia-da-semana)`, {arquivo, linha: linhaDe(fluxo, m.index)}));
					else if (/^\*$|^\*\/([1-9]|[1-5]\d)$/.test(campos[0]) || campos[0].includes(',')) achados.push(aviso(`horário "${m[1]}" roda mais de uma vez por hora: gasta os minutos grátis do GitHub e costuma irritar o site consultado. É isso mesmo que o dono pediu?`, {arquivo, linha: linhaDe(fluxo, m.index)}));
				}
			}
			return achados;
		},
	},
];
