// Contraste das cores (WCAG 2): texto que não dá para ler é o defeito de design mais comum e o mais fácil de medir.

/** "#abc" ou "#aabbcc" → [r, g, b] de 0 a 255; null se não for hex. */
export const lerHex = (cor) => {
	const m = cor?.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
	if (!m) return null;
	const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
	return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const luminancia = ([r, g, b]) => {
	const canal = (v) => {
		const s = v / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
};

/** Contraste entre duas cores hex (1 a 21). 4,5 é o mínimo para texto comum; 3 para texto grande. */
export const contraste = (a, b) => {
	const [la, lb] = [luminancia(lerHex(a)), luminancia(lerHex(b))].sort((x, y) => y - x);
	return (la + 0.05) / (lb + 0.05);
};

/**
 * Lê as cores do arquivo de tokens. Cada cor é `--cor-nome: #hex;` (um tema só) ou
 * `--cor-nome: light-dark(#claro, #escuro);`. Devolve {claro: {nome: hex}, escuro: {nome: hex}, ilegiveis: [nome]}.
 */
export const lerTokens = (css) => {
	const claro = {};
	const escuro = {};
	const ilegiveis = [];
	for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/--cor-([a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
		const [nome, valor] = [m[1], m[2].trim()];
		const dupla = valor.match(/^light-dark\(\s*([^,]+),\s*([^)]+)\)$/i);
		const [c, e] = dupla ? [dupla[1].trim(), dupla[2].trim()] : [valor, valor];
		if (!lerHex(c) || !lerHex(e)) {
			if (!/^var\(/.test(valor)) ilegiveis.push(nome);
			continue;
		}
		claro[nome] = c;
		escuro[nome] = e;
	}
	return {claro, escuro, ilegiveis};
};

/**
 * Pares (texto, fundo) que precisam passar de 4,5 quando os dois existem nos tokens: os fixos abaixo e todo
 * `sobre-X` em cima do seu `X` (ex.: --cor-sobre-vivo sobre --cor-vivo).
 */
export const paresDe = (cores) => {
	const pares = PARES.filter(([texto, fundo]) => cores[texto] && cores[fundo]);
	for (const nome of Object.keys(cores)) {
		const fundo = nome.match(/^sobre-(.+)$/)?.[1];
		if (fundo && cores[fundo] && !pares.some(([t, f]) => t === nome && f === fundo)) pares.push([nome, fundo]);
	}
	return pares;
};

const PARES = [
	['texto', 'fundo'],
	['texto', 'superficie'],
	['texto-suave', 'fundo'],
	['texto-suave', 'superficie'],
	['texto', 'realce'],
	['texto-suave', 'realce'],
	['destaque-texto', 'realce'],
	['sobre-destaque', 'destaque'],
	['destaque-texto', 'fundo'],
	['destaque-texto', 'superficie'],
	['erro', 'fundo'],
	['erro', 'superficie'],
];
