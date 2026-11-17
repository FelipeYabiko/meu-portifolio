// Regras dos sistemas de cadastro (modelo `sistema`): o modelo carrega e faz sentido, os dados reais não vão para o
// GitHub, as regras do negócio têm teste e o exemplo da fábrica não é entregue como se fosse o sistema do dono.
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const erro = (mensagem, extra = {}) => ({nivel: 'erro', mensagem, ...extra});
const aviso = (mensagem, extra = {}) => ({nivel: 'aviso', mensagem, ...extra});

/** Carrega um módulo do projeto sempre do disco (sem o cache do Node), para o fiscal ver a versão atual. */
const carregar = (raiz, rel) => import(`${pathToFileURL(path.join(raiz, rel)).href}?t=${Date.now()}-${Math.random()}`);

export const regrasSistema = [
	{
		id: 'modelo',
		tipos: ['sistema'],
		manual: ['Uso de verdade: cadastre, edite, busque e apague um registro de cada cadastro (`npm start`) antes de mostrar ao dono.', 'Se os nomes dos campos e das opções são as palavras que o dono usa no dia a dia.'],
		checar: async (p) => {
			for (const arquivo of ['modelo.mjs', 'regras.mjs', 'motor/modelo.mjs']) if (!p.existe(arquivo)) return [erro(`falta ${arquivo}`)];
			let modelo;
			let regras;
			let validarModelo;
			try {
				({modelo} = await carregar(p.raiz, 'modelo.mjs'));
				({regras} = await carregar(p.raiz, 'regras.mjs'));
				({validarModelo} = await carregar(p.raiz, 'motor/modelo.mjs'));
			} catch (e) {
				return [erro(`o modelo.mjs ou o regras.mjs não carrega (erro de escrita): ${e.message.split('\n')[0]}`, {arquivo: 'modelo.mjs'})];
			}
			const achados = validarModelo(modelo, regras ?? {}).map((problema) => erro(problema, {arquivo: 'modelo.mjs'}));
			if (modelo?.exemplo) achados.push({nivel: p.final ? 'erro' : 'aviso', arquivo: 'modelo.mjs', mensagem: 'os cadastros ainda são os de exemplo da fábrica (`exemplo: true`): troque pelos da FICHA.md e apague a marca'});
			const testes = p.ler('tests/regras.test.mjs') ?? '';
			for (const [idEntidade, doCadastro] of Object.entries(regras ?? {})) {
				if (!modelo?.entidades?.[idEntidade]) {
					achados.push(erro(`regras.mjs tem regras para "${idEntidade}", que não é um cadastro do modelo`, {arquivo: 'regras.mjs'}));
					continue;
				}
				const nomes = [...(doCadastro.validar ? ['validar'] : []), ...(doCadastro.aoSalvar ? ['aoSalvar'] : []), ...Object.keys(doCadastro.calculados ?? {})];
				const semTeste = nomes.filter((nome) => !new RegExp(`regras\\.${idEntidade}\\b[\\s\\S]{0,40}\\b${nome}\\b`).test(testes));
				if (semTeste.length) achados.push(aviso(`regra sem teste em tests/regras.test.mjs: ${semTeste.map((n) => `${idEntidade}.${n}`).join(', ')} (um caso que passa e um que quebra para cada)`, {arquivo: 'regras.mjs'}));
			}
			return achados;
		},
	},
	{
		id: 'dados-do-dono',
		tipos: ['sistema'],
		checar: (p) => {
			const achados = p.com(/^dados\//).map((arquivo) => erro('arquivo de dados/ indo para o GitHub: os dados reais do dono ficam só no computador dele. Confira `dados/` no .gitignore e rode `git rm -r --cached dados`', {arquivo}));
			if (!/^dados\/?$/m.test(p.ler('.gitignore') ?? '')) achados.push(erro('o .gitignore precisa da linha `dados/`', {arquivo: '.gitignore'}));
			return achados;
		},
	},
];
