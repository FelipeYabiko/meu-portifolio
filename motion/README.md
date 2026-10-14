# Motions dos cards de projeto

Os vídeos em loop dos cards do portfólio (`img/*.mp4` e `img/*.webm`, 4:3,
1200×900, sem áudio). O site carrega cada um só quando o card chega perto da
tela, pausa fora dela e respeita "reduzir movimento" (ver `initProjectVideos`
em `app.js`).

## Mercado — Remotion (`src/mercado`)

Telas capturadas do app no ar (`mercado-iota-ten.vercel.app`) num celular de
390×844 a 3×, em `public/mercado/`. O feed usa o filtro Hortifrúti, para as
lojas de teste ficarem de fora. As posições dos toques estão em
`src/alvos.json`, medidas no app com Playwright.

```bash
cd motion
npm install
npm run dev              # Remotion Studio
npm run render:mercado   # out/mercado-master.mp4
```

## FONAR — recorte do vídeo da banca (`fonar/`)

O loop sai do vídeo da banca (`fonar-landing`, branch `felipe/videoBanca`,
`video/`): seis trechos recortados no aparelho, com fade entre eles.

```bash
# no fonar-landing/video
npx remotion render FonarBanca out/fonar-banca-16x9.mp4
# aqui
python3 fonar/build.py ../fonar-landing/video/out/fonar-banca-16x9.mp4 out/fonar-master.mp4
```

Os trechos e recortes estão em `fonar/segs.txt`.

## Do master para o site

```bash
ffmpeg -i out/NOME-master.mp4 -c:v libx264 -preset veryslow -crf 27 -profile:v high \
  -pix_fmt yuv420p -movflags +faststart -an ../img/NOME.mp4
ffmpeg -i out/NOME-master.mp4 -c:v libvpx-vp9 -crf 44 -b:v 0 -row-mt 1 -an ../img/NOME.webm
```

O pôster (`img/NOME-poster.webp`) é um quadro do master. É o que aparece
antes do vídeo carregar e para quem pediu menos movimento.
