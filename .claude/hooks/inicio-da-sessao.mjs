// Gancho SessionStart: conta à conversa nova o estado do projeto e o que falta, para ela retomar sem perguntar.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resumoDoPainel} from './regras.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const texto = resumoDoPainel(raiz);
if (texto) console.log(JSON.stringify({hookSpecificOutput: {hookEventName: 'SessionStart', additionalContext: texto}}));
