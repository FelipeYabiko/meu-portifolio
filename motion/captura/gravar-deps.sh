#!/usr/bin/env bash
# Grava as cenas do site da Dep's em public/deps/.
# Antes: sirva o repositório site-deps em http://localhost:5173 (ex.: npx serve -l 5173 .)
set -e
cd "$(dirname "$0")/.."
U=${DEPS_URL:-http://localhost:5173}
OUT=public/deps
G="node captura/gravar.mjs"
# Sem aviso de cookies, sem pop-up de idade, sem o cursor do site e sem a faixa
# de "modo demonstração" do cardápio.
BASE='"storage":{"deps-cookies":"{\"ok\":true}","deps-age":"\"yes\""},"css":".cursor{display:none!important}[data-demo]{display:none!important}"'

$G home "$U/index.html" 1440 900 "{$BASE,\"passos\":[{\"espera\":6000},{\"rola\":2000,\"dur\":5000},{\"espera\":1500}]}" $OUT
for s in bebidas rotisseria pet; do
  $G $s "$U/$s.html" 1440 900 "{$BASE,\"passos\":[{\"espera\":4500},{\"rola\":\"#catalogo\",\"dur\":3500},{\"espera\":1500}]}" $OUT
done
$G m_cardapio "$U/cardapio.html" 390 844 "{$BASE,\"dsf\":2,\"toque\":true,\"passos\":[{\"espera\":2500},{\"rola\":1100,\"dur\":3500},{\"espera\":800}]}" $OUT
