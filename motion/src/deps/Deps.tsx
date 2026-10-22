import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Clipe } from "../comum/Clipe";
import { Janela } from "../comum/Janela";
import { cor, fonte } from "./tema";

// Loop do card do Dep's no portfólio: home 3D → as três casas → cardápio da mesa
// no celular → marca. Gravações do site-deps (captura/gravar-deps.sh).
export const DURACAO_DEPS = 530;

const suave = Easing.bezier(0.65, 0, 0.35, 1);
const saida = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Quando cada parte começa, em quadros.
const ENTRA = { home: 0, casas: 140, mesa: 290, marca: 420 } as const;
const CASAS = ["bebidas", "rotisseria", "pet"] as const;
const POR_CASA = 50;

const LEGENDAS = [
  { de: ENTRA.home, ate: ENTRA.casas, rotulo: "Home", titulo: ["Três casas,", "uma cena 3D."], apoio: "Bebidas, rotisseria e petshop na Praia dos Namorados, com Three.js e GSAP." },
  { de: ENTRA.casas, ate: ENTRA.mesa, rotulo: "Catálogo", titulo: ["Cada casa com", "a sua cara."], apoio: "Catálogo por casa e sacola que fecha o pedido direto no WhatsApp." },
  { de: ENTRA.mesa, ate: ENTRA.marca, rotulo: "Na mesa", titulo: ["O QR Code abre", "o cardápio."], apoio: "O dono cadastra produto e monta a promoção do dia num painel próprio, com Supabase." },
] as const;

const Legenda: React.FC<{ frame: number; i: number }> = ({ frame, i }) => {
  const l = LEGENDAS[i];
  if (frame < l.de || frame > l.ate + 8) return null;
  const dentro = interpolate(frame, [l.de + 8, l.de + 26], [0, 1], { ...clamp, easing: saida });
  const fora = interpolate(frame, [l.ate - 4, l.ate + 8], [1, 0], clamp);
  // As duas primeiras ficam em cima da janela; a do celular fica ao lado, como no Mercado.
  const lado = i === 2;
  return (
    <div
      style={{
        position: "absolute",
        ...(lado ? { left: 560, top: 0, bottom: 0, width: 560, justifyContent: "center" } : { left: 60, right: 60, top: 56 }),
        display: "flex",
        flexDirection: "column",
        opacity: Math.min(dentro, fora),
      }}
    >
      <div style={{ fontFamily: fonte.mono, fontSize: 18, letterSpacing: 2.4, textTransform: "uppercase", color: cor.laranja, translate: `0px ${(1 - dentro) * 16}px` }}>
        {String(i + 1).padStart(2, "0")} · {l.rotulo}
      </div>
      <div style={{ display: "flex", flexDirection: lado ? "column" : "row", alignItems: lado ? "flex-start" : "flex-end", justifyContent: "space-between", gap: lado ? 22 : 40, marginTop: 14 }}>
        <div style={{ fontFamily: fonte.display, fontWeight: 800, fontSize: 60, lineHeight: 1, letterSpacing: -2.4, color: cor.tinta, translate: `0px ${(1 - dentro) * 24}px` }}>
          {l.titulo[0]}
          <br />
          <span style={{ color: cor.laranja }}>{l.titulo[1]}</span>
        </div>
        <div style={{ fontFamily: fonte.display, fontSize: 24, lineHeight: 1.4, color: cor.tintaSuave, maxWidth: lado ? 470 : 440, translate: `0px ${(1 - dentro) * 30}px` }}>{l.apoio}</div>
      </div>
    </div>
  );
};

// "Dep's" com o apóstrofo trocado pelos três tracinhos, como no site.
const Logo: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <div style={{ display: "flex", alignItems: "flex-start", fontFamily: fonte.display, fontWeight: 800, fontSize: tamanho, lineHeight: 1, letterSpacing: -tamanho * 0.05, color: cor.tinta }}>
    <span>Dep</span>
    <span style={{ display: "flex", flexDirection: "column", gap: tamanho * 0.035, marginTop: tamanho * 0.06, marginInline: tamanho * 0.025 }}>
      {[cor.ambar, cor.laranja, cor.verde].map((c) => (
        <i key={c} style={{ width: tamanho * 0.075, height: tamanho * 0.09, borderRadius: tamanho * 0.04, background: c }} />
      ))}
    </span>
    <span>s</span>
  </div>
);

const Marca: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - ENTRA.marca;
  const entra = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: saida });
  return (
    <AbsoluteFill style={{ background: cor.papel, opacity: interpolate(f, [0, 12], [0, 1], clamp), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ scale: String(0.94 + 0.06 * entra) }}>
        <Logo tamanho={170} />
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 18, fontFamily: fonte.display, fontWeight: 800, fontSize: 46, letterSpacing: -1.8, opacity: entra }}>
        <span style={{ color: cor.ambar }}>Gela.</span>
        <span style={{ color: cor.laranja }}>Assa.</span>
        <span style={{ color: cor.verde }}>Cuida.</span>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 44, opacity: interpolate(f, [10, 26], [0, 1], clamp) }}>
        {["Three.js", "GSAP", "Supabase", "Vercel"].map((t) => (
          <span key={t} style={{ fontFamily: fonte.mono, fontSize: 18, letterSpacing: 1.6, textTransform: "uppercase", color: cor.tinta, border: `2px solid ${cor.tinta}`, borderRadius: 999, padding: "8px 18px" }}>
            {t}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Deps: React.FC = () => {
  const frame = useCurrentFrame();

  // Janela entra subindo e sai descendo quando o celular chega.
  const janelaY = interpolate(frame, [0, 26, ENTRA.mesa, ENTRA.mesa + 22], [300, 0, 0, 760], { ...clamp, easing: [saida, suave, suave] });
  const celularY = interpolate(frame, [ENTRA.mesa + 8, ENTRA.mesa + 34], [900, 0], { ...clamp, easing: saida });
  // Aproximação lenta, para a cena não ficar parada.
  const zoom = interpolate(frame, [0, ENTRA.mesa], [1, 1.03], clamp);

  // O loop começa e termina no papel: a emenda fica invisível.
  const abre = interpolate(frame, [0, 10], [1, 0], clamp);
  const fecha = interpolate(frame, [DURACAO_DEPS - 14, DURACAO_DEPS - 1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: cor.papel }}>
      {frame < ENTRA.mesa + 24 ? (
        <Janela
          x={60}
          y={262}
          largura={1080}
          fundo={cor.papel}
          barra="#FBF8F2"
          sombra="0 30px 80px rgba(20,18,16,0.22), 0 8px 20px rgba(20,18,16,0.12)"
          style={{ translate: `0px ${janelaY}px`, scale: String(zoom), transformOrigin: "50% 0%" }}
        >
          <Sequence from={ENTRA.home} durationInFrames={ENTRA.casas - ENTRA.home + 14} layout="none">
            <Clipe arquivo="deps/home.mp4" de={2.9} />
          </Sequence>
          {CASAS.map((c, i) => {
            const de = ENTRA.casas + i * POR_CASA;
            // Cada casa empurra a anterior da direita, como trocar de página.
            const x = interpolate(frame, [de, de + 16], [1440, 0], { ...clamp, easing: saida });
            return (
              <Sequence key={c} from={de} durationInFrames={i === CASAS.length - 1 ? ENTRA.mesa - de + 24 : POR_CASA + 16} layout="none">
                <div style={{ position: "absolute", inset: 0, translate: `${x}px 0px`, boxShadow: "-20px 0 40px rgba(20,18,16,0.25)" }}>
                  <Clipe arquivo={`deps/${c}.mp4`} de={3} />
                </div>
              </Sequence>
            );
          })}
        </Janela>
      ) : null}

      {frame >= ENTRA.mesa ? (
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 60,
            width: 390 * 0.9 + 24,
            height: 844 * 0.9 + 24,
            padding: 12,
            boxSizing: "border-box",
            borderRadius: 48,
            background: cor.tinta,
            boxShadow: `10px 10px 0 ${cor.ambar}`,
            translate: `0px ${celularY}px`,
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 36, overflow: "hidden", background: cor.papel }}>
            <Sequence from={ENTRA.mesa} layout="none">
              <Clipe arquivo="deps/m_cardapio.mp4" de={0.4} />
            </Sequence>
          </div>
        </div>
      ) : null}

      {LEGENDAS.map((_, i) => (
        <Legenda key={i} frame={frame} i={i} />
      ))}

      {frame >= ENTRA.marca ? <Marca frame={frame} /> : null}

      <AbsoluteFill style={{ background: cor.papel, opacity: Math.max(abre, fecha), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
