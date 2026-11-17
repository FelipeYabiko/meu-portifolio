// Diz à folha de telas quais são as telas do site: sobe a pasta do site e lista cada página .html dela.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {servir} from './servir.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// num projeto criado pela fábrica o site mora em site/; num projeto adotado, onde o fabrica.json disser (pastaDoSite)
const pasta = path.resolve(raiz, JSON.parse(fs.readFileSync(path.join(raiz, 'fabrica.json'), 'utf8')).pastaDoSite ?? 'site');
const FORA = new Set(['node_modules', 'folha', 'secoes', 'ferramentas', 'docs', 'tests', 'dist']);

const paginas = (dir, base = dir) =>
	fs.readdirSync(dir, {withFileTypes: true}).flatMap((item) => {
		const inteiro = path.join(dir, item.name);
		if (item.isDirectory()) return item.name.startsWith('.') || FORA.has(item.name) ? [] : paginas(inteiro, base);
		return item.name.endsWith('.html') ? [path.relative(base, inteiro).split(path.sep).join('/')] : [];
	});

export const preparar = async () => {
	const {servidor, endereco} = await servir({pasta, porta: 0});
	const telas = paginas(pasta)
		.sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)))
		.map((rel) => ({nome: rel === 'index.html' ? 'inicio' : rel.replace(/\.html$/, '').replace(/\//g, '-'), caminho: `/${rel}`}));
	return {endereco, telas, fechar: () => servidor.close()};
};
