// Servidor de páginas paradas (HTML, CSS, imagens) para ver o site no próprio computador, sem instalar nada.
//   npm run ver            abre em http://localhost:4173
//   node ferramentas/servir.mjs --porta 5000 --pasta . --abrir     (--abrir já abre o navegador)
// Só atende o próprio computador (127.0.0.1) e nunca sai da pasta do projeto.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const TIPOS = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.mp3': 'audio/mpeg',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8',
	'.csv': 'text/csv; charset=utf-8',
	'.pdf': 'application/pdf',
};

/** Acha o arquivo pedido dentro da pasta (ou null). Recusa qualquer caminho que tente sair dela. */
export const acharArquivo = (pasta, endereco) => {
	let caminho;
	try {
		caminho = decodeURIComponent(endereco.split('?')[0].split('#')[0]);
	} catch {
		return null;
	}
	const inteiro = path.resolve(pasta, `.${path.posix.normalize(`/${caminho}`)}`);
	if (inteiro !== pasta && !inteiro.startsWith(pasta + path.sep)) return null;
	const candidatos = [inteiro, path.join(inteiro, 'index.html'), `${inteiro}.html`];
	return candidatos.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
};

/** Sobe o servidor e devolve {servidor, porta, endereco}. Porta 0 = qualquer porta livre (usado pela folha de telas). */
export const servir = ({pasta, porta = 4173}) =>
	new Promise((resolve, reject) => {
		const raiz = path.resolve(pasta);
		const servidor = http.createServer((req, res) => {
			const arquivo = acharArquivo(raiz, req.url ?? '/');
			if (!arquivo) {
				const naoAchou = path.join(raiz, '404.html');
				res.writeHead(404, {'content-type': 'text/html; charset=utf-8'});
				res.end(fs.existsSync(naoAchou) ? fs.readFileSync(naoAchou) : 'Página não encontrada');
				return;
			}
			res.writeHead(200, {'content-type': TIPOS[path.extname(arquivo).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store'});
			fs.createReadStream(arquivo).pipe(res);
		});
		servidor.once('error', reject);
		servidor.listen(porta, '127.0.0.1', () => {
			const real = servidor.address().port;
			resolve({servidor, porta: real, endereco: `http://localhost:${real}`});
		});
	});

/** Abre o endereço no navegador padrão do computador (Windows, Mac ou Linux). Se não der, só segue. */
export const abrirNoNavegador = (endereco) => {
	const [comando, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', endereco]] : process.platform === 'darwin' ? ['open', [endereco]] : ['xdg-open', [endereco]];
	try {
		spawn(comando, args, {stdio: 'ignore', detached: true}).on('error', () => {}).unref();
	} catch {
		// sem navegador (nuvem): o endereço já foi escrito no terminal
	}
};

const ehPrincipal = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (ehPrincipal) {
	const args = process.argv.slice(2);
	const opcao = (nome, padrao) => (args.includes(`--${nome}`) ? args[args.indexOf(`--${nome}`) + 1] : padrao);
	const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
	// sem --pasta: a pasta do site que o fabrica.json disser (pastaDoSite); senão site/ se existir; senão a raiz
	let doProjeto = fs.existsSync(path.join(raiz, 'site')) ? 'site' : '.';
	try {
		doProjeto = JSON.parse(fs.readFileSync(path.join(raiz, 'fabrica.json'), 'utf8')).pastaDoSite ?? doProjeto;
	} catch {
		// sem fabrica.json: vale o palpite acima
	}
	const pasta = path.resolve(raiz, opcao('pasta', doProjeto));
	try {
		const {endereco} = await servir({pasta, porta: Number(opcao('porta', 4173))});
		console.log(`Site aberto em ${endereco}  (Ctrl+C para fechar)`);
		if (args.includes('--abrir')) abrirNoNavegador(endereco);
	} catch (e) {
		console.error(e.code === 'EADDRINUSE' ? 'A porta já está em uso: o site provavelmente já está aberto em outra janela. Feche a outra ou use --porta 4174.' : e.message);
		process.exit(1);
	}
}
