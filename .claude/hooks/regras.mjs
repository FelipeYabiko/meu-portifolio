// Decisões dos ganchos do Claude Code deste projeto, separadas da leitura da entrada para poder testar.
// Cada trava existe porque o erro que ela evita é caro e fácil de cometer sem perceber.
import fs from 'node:fs';
import path from 'node:path';

/** Pacotes pedidos num `npm install <pacote>` (vazio quando é só `npm install`, que instala o que já está combinado). */
export const pacotesPedidos = (comando = '') => {
	const pacotes = [];
	for (const m of comando.matchAll(/\b(?:npm\s+(?:install|i|add)|pnpm\s+add|yarn\s+add)\b([^\n;&|]*)/g)) {
		for (const parte of m[1].trim().split(/\s+/)) {
			if (!parte || parte.startsWith('-')) continue;
			// "pacote@1.2.3" e "@escopo/pacote@1.2.3" → só o nome
			pacotes.push(parte.replace(/(?!^)@[^/]*$/, ''));
		}
	}
	return pacotes;
};

/** O que a FICHA.md lista em "## Dependências aprovadas". */
export const aprovadasNaFicha = (ficha = '') => ficha.match(/^## Dependências aprovadas\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';

/**
 * O que fazer com um comando do Bash: {acao: 'seguir'} | {acao: 'bloquear', motivo} | {acao: 'verificar'} (rodar o
 * `npm run verificar` e só deixar passar se ele passar).
 */
export const decidirBash = ({command: comando = ''} = {}, {ficha = ''} = {}) => {
	// dados/ guarda o que o dono digitou no sistema; não vai para o GitHub, então não tem como recuperar.
	if (/\b(rm|rmdir|del|rd|erase|Remove-Item|mv|move|Move-Item|truncate)\b[^\n;&|]*(^|[\s"'/\\.])dados([/\\"'\s]|$)/i.test(comando) || />\s*["']?(\.\/)?dados[/\\]/.test(comando)) {
		return {acao: 'bloquear', motivo: 'A pasta dados/ guarda os dados reais do dono e não tem cópia no GitHub: não apague, mova nem sobrescreva. Para testar, use uma pasta temporária (os testes já fazem isso). Se o dono pediu mesmo para limpar, peça que ele confirme e apague à mão.'};
	}
	if (/\bgit\s+commit\b[^\n;&|]*--no-verify|\bgit\s+push\b[^\n;&|]*(--force\b|-f\b)/.test(comando)) {
		return {acao: 'bloquear', motivo: 'Sem --no-verify e sem push forçado: se a verificação falhou, corrija o que ela apontou; se o push foi recusado, traga as mudanças com `git fetch` + `git merge` e envie de novo.'};
	}
	const novos = pacotesPedidos(comando).filter((pacote) => !aprovadasNaFicha(ficha).includes(pacote));
	if (novos.length) {
		return {acao: 'bloquear', motivo: `Dependência nova (${novos.join(', ')}) precisa do OK do dono: este projeto roda sem instalar nada de propósito (menos coisa para quebrar e para atualizar). Diga ao dono em uma linha para que serve e o que acontece sem ela; com o sim, anote em "## Dependências aprovadas" da FICHA.md (nome e motivo) e rode de novo.`};
	}
	if (/\bgit\s+commit\b/.test(comando)) return {acao: 'verificar'};
	return {acao: 'seguir'};
};

/** O que fazer com a edição de um arquivo: {acao: 'seguir'} | {acao: 'bloquear', motivo}. */
export const decidirEdicao = (arquivo = '', raiz = '') => {
	const rel = path.relative(raiz || '.', arquivo).split(path.sep).join('/');
	if (/^dados\//.test(rel)) {
		return {acao: 'bloquear', motivo: 'dados/ são os dados reais do dono: quem escreve ali é o próprio sistema, nunca a mão. Para dados de exemplo ou de teste, use exemplos/ ou uma pasta temporária.'};
	}
	if (/^ferramentas\/fiscal(\.mjs$|\/)/.test(rel) && !/regras-do-projeto\.mjs$/.test(rel)) {
		return {acao: 'bloquear', motivo: 'Não mude o fiscal para ele passar: corrija o projeto. Regra só deste projeto vai em ferramentas/fiscal/regras-do-projeto.mjs. Se uma regra da fábrica estiver errada, diga ao dono (o conserto é no claude-kit, e chega aqui com `criar.mjs --atualizar`).'};
	}
	if (/^\.claude\/hooks\//.test(rel)) {
		return {acao: 'bloquear', motivo: 'Os ganchos são as travas de segurança do projeto: só mude se o dono pedir, e então peça que ele confirme na conversa antes.'};
	}
	return {acao: 'seguir'};
};

const secao = (texto, titulo) => texto.match(new RegExp(`^## ${titulo}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))?.[1].trim() ?? '';

/** O que a conversa nova precisa saber para retomar: estado e o que falta, tirados do PAINEL.md. */
export const resumoDoPainel = (raiz) => {
	const arquivo = path.join(raiz, 'PAINEL.md');
	if (!fs.existsSync(arquivo)) return '';
	const painel = fs.readFileSync(arquivo, 'utf8');
	const titulo = painel.match(/^# (.+)$/m)?.[1] ?? 'Projeto';
	const partes = [`${titulo} (projeto da Fábrica do claude-kit). Antes de mexer: leia PAINEL.md, FICHA.md e docs/regras-de-ouro.md; mudança nova segue docs/manual.md (skill \`mudanca\`).`];
	const estado = secao(painel, 'Estado');
	const falta = secao(painel, 'Falta fazer');
	if (estado) partes.push(`Estado:\n${estado}`);
	if (falta) partes.push(`Falta fazer:\n${falta}`);
	const texto = partes.join('\n\n');
	return texto.length > 2500 ? `${texto.slice(0, 2500)}\n…` : texto;
};

/** Lê a entrada do gancho (JSON no stdin). */
export const lerEntrada = async () => {
	let texto = '';
	for await (const pedaco of process.stdin) texto += pedaco;
	return texto ? JSON.parse(texto) : {};
};
