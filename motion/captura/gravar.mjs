// Grava uma página via screencast do Chrome (CDP) e gera um clipe 30 fps.
// Uso: node captura/gravar.mjs <nome> <url> <largura> <altura> '<plano-json>' [pasta-saida]
//
// Plano: { lento, dsf, toque, storage: {chave: valor}, css, youtube, passos: [...] }
//   passos: { espera: ms } | { rola: px | "fim" | "seletor", dur: ms } | { clica: "seletor" }
//
// O relógio da página (JS, rAF e animações CSS) corre `lento` vezes mais devagar
// enquanto grava; depois o vídeo é acelerado de volta. Assim cenas pesadas em
// Three.js saem fluidas mesmo numa máquina sem GPU.
// Os cliques ficam em <saida>/<nome>.cliques.json (segundos do clipe e posição
// em px CSS), para o Remotion desenhar o cursor.
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [, , nome, url, W, H, planoJson, saida = "public/clips"] = process.argv;
const plano = JSON.parse(planoJson);
const K = plano.lento || 0.25;
const dsf = plano.dsf || 1;
const pasta = path.join(".quadros", nome);
fs.rmSync(pasta, { recursive: true, force: true });
fs.mkdirSync(pasta, { recursive: true });
fs.mkdirSync(saida, { recursive: true });

const browser = await chromium.launch({ args: ["--ignore-gpu-blocklist", "--use-angle=swiftshader"] });
const ctx = await browser.newContext({
  viewport: { width: +W, height: +H },
  deviceScaleFactor: dsf,
  hasTouch: !!plano.toque,
  isMobile: !!plano.toque,
});

await ctx.addInitScript(({ K, storage, css }) => {
  const agora = performance.now.bind(performance), d0 = Date.now(), p0 = agora();
  performance.now = () => agora() * K;
  Date.now = () => d0 + (agora() - p0) * K;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => raf(() => cb(performance.now()));
  const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
  window.setTimeout = (fn, d, ...a) => st(fn, (d || 0) / K, ...a);
  window.setInterval = (fn, d, ...a) => si(fn, (d || 0) / K, ...a);
  for (const [k, v] of Object.entries(storage || {})) localStorage.setItem(k, v);
  if (css) document.addEventListener("DOMContentLoaded", () => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  });
}, { K, storage: plano.storage, css: plano.css });

// Sem player do YouTube no headless: mostra a capa do vídeo com o botão de play,
// como o YouTube faz antes de tocar.
if (plano.youtube) {
  await ctx.route(/youtube(-nocookie)?\.com\/embed\//, (r) => {
    const id = r.request().url().split("/embed/")[1].split(/[?&]/)[0];
    r.fulfill({
      contentType: "text/html",
      body: `<html><body style="margin:0;background:#000 url(https://i.ytimg.com/vi/${id}/hqdefault.jpg) center/cover"><div style="position:absolute;left:50%;top:50%;translate:-50% -50%;width:68px;height:48px;border-radius:14px;background:#f00;display:grid;place-items:center"><div style="border-left:20px solid #fff;border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:5px"></div></div></body></html>`,
    });
  });
}

const page = await ctx.newPage();
await page.mouse.move(+W + 50, +H + 50).catch(() => {});
const cdp = await ctx.newCDPSession(page);
const quadros = [];
cdp.on("Page.screencastFrame", (f) => {
  quadros.push({ t: f.metadata.timestamp, data: f.data });
  cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send("Animation.enable");
await cdp.send("Animation.setPlaybackRate", { playbackRate: K });
const espera = (ms) => page.waitForTimeout(ms / K);
const cliques = [];

await page.goto(url, { waitUntil: "domcontentloaded" });
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: +W * dsf, maxHeight: +H * dsf, everyNthFrame: 1 });

for (const p of plano.passos || []) {
  if (p.espera) await espera(p.espera);
  if (p.rola !== undefined) {
    await page.evaluate(async ({ rola, dur }) => {
      const alvo = rola === "fim"
        ? document.documentElement.scrollHeight - innerHeight
        : typeof rola === "string"
          ? document.querySelector(rola).getBoundingClientRect().top + scrollY - 80
          : rola;
      const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      const lenis = window.DEPS && window.DEPS.lenis;
      if (lenis) {
        await new Promise((r) => lenis.scrollTo(alvo, { duration: dur / 1000, easing: ease, onComplete: r }));
        return;
      }
      const de = scrollY, t0 = performance.now();
      await new Promise((r) => {
        const passo = () => {
          const k = Math.min(1, (performance.now() - t0) / dur);
          scrollTo(0, de + (alvo - de) * ease(k));
          k < 1 ? requestAnimationFrame(passo) : r();
        };
        passo();
      });
    }, { rola: p.rola, dur: p.dur || 1200 });
  }
  if (p.clica) {
    const el = page.locator(p.clica).first();
    await el.waitFor({ state: "visible" });
    const box = await el.boundingBox();
    cliques.push({ t: Date.now() / 1000, x: box.x + box.width / 2, y: box.y + box.height / 2 });
    await el.click();
  }
}
const fim = Date.now() / 1000;
await cdp.send("Page.stopScreencast");
await browser.close();

// Quadros com a duração real de cada um (no tempo da página) → 30 fps constantes.
const t0 = quadros[0].t;
let lista = "";
quadros.forEach((q, i) => {
  const arq = `${String(i).padStart(5, "0")}.jpg`;
  fs.writeFileSync(path.join(pasta, arq), Buffer.from(q.data, "base64"));
  // Página parada não gera quadro: o último dura até o fim da gravação.
  const d = ((i < quadros.length - 1 ? quadros[i + 1].t : fim) - q.t) * K;
  lista += `file '${arq}'\nduration ${d.toFixed(4)}\n`;
});
// O concat do ffmpeg ignora a duração da última entrada se ela não se repetir.
lista += `file '${String(quadros.length - 1).padStart(5, "0")}.jpg'\n`;
fs.writeFileSync(path.join(pasta, "lista.txt"), lista);
execFileSync("ffmpeg", [
  "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(pasta, "lista.txt"),
  "-vf", "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p",
  "-c:v", "libx264", "-crf", "15", "-preset", "medium", "-movflags", "+faststart",
  path.join(saida, `${nome}.mp4`),
]);
if (cliques.length) {
  fs.writeFileSync(
    path.join(saida, `${nome}.cliques.json`),
    JSON.stringify(cliques.map((c) => ({ t: +((c.t - t0) * K).toFixed(3), x: Math.round(c.x), y: Math.round(c.y) })), null, 2) + "\n",
  );
}
const dur = (fim - t0) * K;
console.log(`${nome}: ${quadros.length} quadros, ${dur.toFixed(1)} s, ${(quadros.length / dur).toFixed(0)} fps efetivos`);
fs.rmSync(pasta, { recursive: true, force: true });
