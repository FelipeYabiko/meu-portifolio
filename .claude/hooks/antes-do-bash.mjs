// Gancho PreToolUse do Bash: trava o que é caro de desfazer e roda o `npm run verificar` antes de cada commit.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {decidirBash, lerEntrada} from './regras.mjs';

const negar = (motivo) => {
	console.log(JSON.stringify({hookSpecificOutput: {hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: motivo}}));
	process.exit(0);
};

const entrada = await lerEntrada();
const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd || process.cwd();
const arquivoFicha = path.join(raiz, 'FICHA.md');
const ficha = fs.existsSync(arquivoFicha) ? fs.readFileSync(arquivoFicha, 'utf8') : '';
const decisao = decidirBash(entrada.tool_input, {ficha});
if (decisao.acao === 'bloquear') negar(decisao.motivo);
if (decisao.acao === 'verificar') {
	const r = spawnSync('npm', ['run', '-s', 'verificar'], {cwd: raiz, encoding: 'utf8', shell: process.platform === 'win32'});
	if (r.status !== 0) {
		const saida = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-40).join('\n');
		negar(`O npm run verificar falhou; corrija antes de commitar (não contorne):\n${saida}`);
	}
}
