#!/usr/bin/env bash
# Grava as cenas do Party Ranking em public/partyrank/.
# Antes: rode o partyrank-vercel com um banco local e os dados de demonstração
# (ver captura/partyrank-demo.mjs e o README).
set -e
cd "$(dirname "$0")/.."
U=${PARTYRANK_URL:-http://localhost:8000}
OUT=public/partyrank
G="node captura/gravar.mjs"

TOKEN=$(curl -s -X POST "$U/api.php?action=login" -H 'Content-Type: application/json' \
  -d '{"username":"felipe","password":"demo-partyrank"}' | node -e 'process.stdin.on("data",d=>console.log(JSON.parse(d).token))')
USER='{\"id\":1,\"username\":\"felipe\",\"photo\":\"😎\",\"is_admin\":0,\"is_super_admin\":0}'
LOGADO="\"storage\":{\"currentUser\":\"$USER\",\"sessionToken\":\"$TOKEN\"},\"youtube\":true"

$G pr_landing "$U/" 1440 900 '{"passos":[{"espera":4500},{"rola":900,"dur":3500},{"espera":1000}]}' $OUT
$G pr_avaliar "$U/" 1440 900 "{\"lento\":0.5,$LOGADO,\"passos\":[{\"espera\":1500},{\"clica\":\".ss-card:has-text('Rock')\"},{\"espera\":1500},{\"clica\":\"button:visible:has-text('Continuar')\"},{\"espera\":1500},{\"rola\":320,\"dur\":900},{\"espera\":500},{\"clica\":\".pip:text-is('9')\"},{\"espera\":2000}]}" $OUT
$G pr_resultado "$U/" 1440 900 "{\"lento\":0.5,$LOGADO,\"passos\":[{\"espera\":1200},{\"clica\":\".ss-card:has-text('Hits da Festa')\"},{\"espera\":1200},{\"clica\":\"text=Resultados >> visible=true\"},{\"espera\":1200},{\"clica\":\"button:has-text('Ver resultados')\"},{\"espera\":2500},{\"rola\":700,\"dur\":2500},{\"espera\":1000}]}" $OUT
$G pr_tier "$U/" 1440 900 "{\"lento\":0.5,$LOGADO,\"passos\":[{\"espera\":1000},{\"clica\":\"text=Tierlists >> visible=true\"},{\"espera\":1000},{\"clica\":\".ss-card:has-text('Clipes'), :text('Clipes mais icônicos')\"},{\"espera\":4500}]}" $OUT

# Cliques de cada gravação → src/partyrank/cliques.json (o Remotion desenha o cursor).
node -e '
const fs = require("fs"); const o = {};
for (const n of ["pr_avaliar", "pr_resultado", "pr_tier"]) o[n] = JSON.parse(fs.readFileSync(`public/partyrank/${n}.cliques.json`));
fs.writeFileSync("src/partyrank/cliques.json", JSON.stringify(o, null, 2) + "\n");'
