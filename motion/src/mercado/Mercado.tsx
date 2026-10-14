import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Celular } from "./Celular";
import { Tela, Toque } from "./Tela";
import { cor, fonte } from "./tema";
import alvos from "../alvos.json";

// Loop do card do Mercado no portfólio: home → feed → produto → loja → marca.
// Telas capturadas do app no ar (mercado-iota-ten.vercel.app), com o filtro
// Hortifrúti no feed. As lojas de teste ficam de fora do vídeo.
export const DURACAO_MERCADO = 480;

const suave = Easing.bezier(0.65, 0, 0.35, 1);
const saida = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Quando cada tela entra no celular, em quadros.
const ENTRA = { home: 0, feed: 120, produto: 232, loja: 340, marca: 408 } as const;

// Centro dos alvos de toque, em px CSS da tela (medidos no app com Playwright).
const TOQUE_FEED = { x: alvos.feed_banana.x + alvos.feed_banana.width / 2, y: alvos.feed_banana.y - 60 };
const TOQUE_WHATS = { x: alvos.produto_whats.x + alvos.produto_whats.width / 2, y: alvos.produto_whats.y + alvos.produto_whats.height / 2 };

const CELULAR = { x: 96, y: 60 };

const LEGENDAS = [
  { de: ENTRA.home, ate: ENTRA.feed, rotulo: "Vitrine digital", titulo: ["A feira do bairro", "no celular."], apoio: "Mercadinho, padaria e açougue publicam produto com foto e preço. Sem app para instalar." },
  { de: ENTRA.feed, ate: ENTRA.produto, rotulo: "Perto de você", titulo: ["Ofertas pela", "localização."], apoio: "Categorias, distância e o preço real de cada loja do bairro." },
  { de: ENTRA.produto, ate: ENTRA.loja, rotulo: "Sem intermediário", titulo: ["Um toque e", "já é conversa."], apoio: "O botão abre o WhatsApp do comerciante, com o produto na mensagem." },
  { de: ENTRA.loja, ate: ENTRA.marca, rotulo: "Para o comerciante", titulo: ["Cada loja com", "a sua vitrine."], apoio: "Link próprio e QR Code para colar na porta — quem passa já vê o catálogo." },
] as const;

const Legenda: React.FC<{ frame: number; i: number }> = ({ frame, i }) => {
  const l = LEGENDAS[i];
  const dentro = interpolate(frame, [l.de + 8, l.de + 26], [0, 1], { ...clamp, easing: saida });
  const fora = interpolate(frame, [l.ate - 4, l.ate + 8], [1, 0], clamp);
  if (frame < l.de || frame > l.ate + 8) return null;
  return (
    <div style={{ position: "absolute", left: 560, top: 0, bottom: 0, width: 560, display: "flex", flexDirection: "column", justifyContent: "center", opacity: Math.min(dentro, fora) }}>
      <div style={{ fontFamily: fonte.mono, fontSize: 18, letterSpacing: 2.4, textTransform: "uppercase", color: cor.primaria, translate: `0px ${(1 - dentro) * 16}px` }}>
        {String(i + 1).padStart(2, "0")} · {l.rotulo}
      </div>
      <div style={{ fontFamily: fonte.display, fontSize: 62, lineHeight: 1.02, color: cor.tinta, marginTop: 18, translate: `0px ${(1 - dentro) * 24}px` }}>
        {l.titulo[0]}
        <br />
        <span style={{ color: cor.primaria }}>{l.titulo[1]}</span>
      </div>
      <div style={{ fontFamily: fonte.corpo, fontSize: 26, lineHeight: 1.4, color: cor.tintaSuave, marginTop: 22, maxWidth: 500, translate: `0px ${(1 - dentro) * 30}px` }}>{l.apoio}</div>
    </div>
  );
};

const Marca: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - ENTRA.marca;
  const entra = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: saida });
  return (
    <AbsoluteFill style={{ background: cor.papel, opacity: interpolate(f, [0, 12], [0, 1], clamp), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: fonte.display, fontSize: 132, color: cor.tinta, letterSpacing: -2, scale: String(0.94 + 0.06 * entra) }}>
        mercado<span style={{ color: cor.primaria }}>.</span>
      </div>
      <div style={{ fontFamily: fonte.corpo, fontSize: 32, color: cor.tintaSuave, marginTop: 8, opacity: entra }}>A vitrine digital do comércio local.</div>
      <div style={{ display: "flex", gap: 12, marginTop: 44, opacity: interpolate(f, [10, 26], [0, 1], clamp) }}>
        {["Next.js", "TypeScript", "Firebase", "Stripe", "Claude API"].map((t) => (
          <span key={t} style={{ fontFamily: fonte.mono, fontSize: 18, letterSpacing: 1.6, textTransform: "uppercase", color: cor.tinta, border: `2px solid ${cor.tinta}`, borderRadius: 6, padding: "8px 14px", background: cor.acento, boxShadow: `3px 3px 0 ${cor.tinta}` }}>
            {t}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Mercado: React.FC = () => {
  const frame = useCurrentFrame();

  // Home: rola da dobra até o "Como funciona".
  const rolagemHome = interpolate(frame, [22, 112], [0, 1300], { ...clamp, easing: suave });
  // Feed entra por cima da home (troca de rota com fade).
  const feed = interpolate(frame, [ENTRA.feed, ENTRA.feed + 12], [0, 1], clamp);
  // Produto empurra da direita, como a navegação do app.
  const produto = interpolate(frame, [ENTRA.produto, ENTRA.produto + 16], [390, 0], { ...clamp, easing: saida });
  const loja = interpolate(frame, [ENTRA.loja, ENTRA.loja + 12], [0, 1], clamp);
  // Leve aproximação na loja, para a cena não ficar parada.
  const zoomLoja = interpolate(frame, [ENTRA.loja, ENTRA.marca], [1, 1.035], clamp);

  // O loop começa e termina no papel: a emenda fica invisível.
  const abre = interpolate(frame, [0, 10], [1, 0], clamp);
  const fecha = interpolate(frame, [DURACAO_MERCADO - 14, DURACAO_MERCADO - 1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: cor.papel }}>
      {/* Listras do papel, como o fundo de "listras" do app, bem discretas */}
      <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(135deg, transparent 0 22px, rgba(244, 227, 192, 0.55) 22px 44px)` }} />

      <Celular x={CELULAR.x} y={CELULAR.y}>
        <Tela arquivo="home.webp" rolagem={rolagemHome} />
        {frame >= ENTRA.feed ? <Tela arquivo="feed.webp" style={{ opacity: feed }} /> : null}
        <Toque frame={frame} em={ENTRA.produto - 16} x={TOQUE_FEED.x} y={TOQUE_FEED.y} />
        {frame >= ENTRA.produto ? <Tela arquivo="produto.webp" style={{ translate: `${produto}px 0px`, boxShadow: "-12px 0 24px rgba(31,20,10,0.18)" }} /> : null}
        <Toque frame={frame} em={ENTRA.loja - 34} x={TOQUE_WHATS.x} y={TOQUE_WHATS.y} />
        {frame >= ENTRA.loja ? <Tela arquivo="loja.webp" style={{ opacity: loja, scale: String(zoomLoja), transformOrigin: "50% 30%" }} /> : null}
      </Celular>

      {LEGENDAS.map((_, i) => (
        <Legenda key={i} frame={frame} i={i} />
      ))}

      {frame >= ENTRA.marca ? <Marca frame={frame} /> : null}

      <AbsoluteFill style={{ background: cor.papel, opacity: Math.max(abre, fecha), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
