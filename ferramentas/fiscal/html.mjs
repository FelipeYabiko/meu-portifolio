// Leitor de HTML simples, sem dependência: basta para conferir título, imagens, links e títulos de seção.
// Não é um navegador: ignora comentários e o miolo de <script>/<style>, e não tenta consertar HTML torto.

const semComentarios = (html) => html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));

/** Apaga o miolo de script e style (mantendo as posições) para o que está lá dentro não virar "tag". */
const semMiolo = (html) => html.replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2\s*>)/gi, (_, abre, _nome, miolo, fecha) => abre + miolo.replace(/[^\n]/g, ' ') + fecha);

const TAG = /<(\/)?([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'<>]+))?)*)\s*(\/)?>/g;
const ATRIBUTO = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+)))?/g;

/** Todas as tags de abertura do HTML: {nome, atributos, indice, fim, linha}. */
export const lerTags = (html) => {
	const limpo = semMiolo(semComentarios(html));
	const tags = [];
	for (const m of limpo.matchAll(TAG)) {
		if (m[1]) continue;
		const atributos = {};
		for (const a of m[3].matchAll(ATRIBUTO)) atributos[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
		tags.push({nome: m[2].toLowerCase(), atributos, indice: m.index, fim: m.index + m[0].length, linha: limpo.slice(0, m.index).split('\n').length});
	}
	return tags;
};

/** O texto visível dentro de uma tag (até o primeiro fechamento dela), sem as tags de dentro. */
export const textoDe = (html, tag) => {
	const limpo = semMiolo(semComentarios(html));
	const fecha = limpo.toLowerCase().indexOf(`</${tag.nome}`, tag.fim);
	if (fecha < 0) return '';
	return limpo.slice(tag.fim, fecha).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
};

/** O HTML de dentro de uma tag (até o primeiro fechamento dela). */
export const mioloDe = (html, tag) => {
	const limpo = semComentarios(html);
	const fecha = limpo.toLowerCase().indexOf(`</${tag.nome}`, tag.fim);
	return fecha < 0 ? '' : limpo.slice(tag.fim, fecha);
};

/** Se o endereço aponta para fora do projeto (site, e-mail, telefone, dado embutido). */
export const ehExterno = (endereco) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(endereco);
