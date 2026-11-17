// O fiscal do projeto: confere sozinho as regras que dá para conferir sem olhar o resultado.
//   npm run fiscal                 confere o projeto (erro trava, aviso é para olhar)
//   npm run fiscal -- --final      antes de entregar ou publicar: provisórios e exemplos viram erro
//   npm run fiscal -- --quieto     só os erros (é o que o `npm run verificar` usa)
// Regra nova: escreva em ferramentas/fiscal/regras-do-projeto.mjs (não é apagado quando a fábrica atualiza).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {fiscalizar, relatorio} from './fiscal/nucleo.mjs';
import {regrasGerais} from './fiscal/regras-gerais.mjs';
import {regrasPaginas} from './fiscal/regras-paginas.mjs';
import {regrasSistema} from './fiscal/regras-sistema.mjs';
import {regrasRobo} from './fiscal/regras-robo.mjs';

const aqui = path.dirname(fileURLToPath(import.meta.url));

/** Todas as regras: as da fábrica mais as que o próprio projeto criou. */
export const todasAsRegras = async () => {
	const regras = [...regrasGerais, ...regrasPaginas, ...regrasSistema, ...regrasRobo];
	const proprias = path.join(aqui, 'fiscal', 'regras-do-projeto.mjs');
	if (fs.existsSync(proprias)) regras.push(...((await import(pathToFileURL(proprias).href)).regrasDoProjeto ?? []));
	return regras;
};

const ehPrincipal = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (ehPrincipal) {
	const args = process.argv.slice(2);
	const pasta = args.find((a) => !a.startsWith('--')) ?? path.resolve(aqui, '..');
	const resultado = await fiscalizar(path.resolve(pasta), await todasAsRegras(), {final: args.includes('--final')});
	if (args.includes('--json')) console.log(JSON.stringify({erros: resultado.erros, avisos: resultado.avisos, manuais: resultado.manuais}, null, '\t'));
	else console.log(relatorio(resultado, {quieto: args.includes('--quieto')}));
	process.exit(resultado.erros.length ? 1 : 0);
}
