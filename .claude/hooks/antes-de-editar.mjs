// Gancho PreToolUse do Write/Edit: protege os dados reais do dono, o fiscal e as próprias travas.
import {decidirEdicao, lerEntrada} from './regras.mjs';

const entrada = await lerEntrada();
const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd || process.cwd();
const decisao = decidirEdicao(entrada.tool_input?.file_path ?? entrada.tool_input?.notebook_path ?? '', raiz);
if (decisao.acao === 'bloquear') {
	console.log(JSON.stringify({hookSpecificOutput: {hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: decisao.motivo}}));
}
