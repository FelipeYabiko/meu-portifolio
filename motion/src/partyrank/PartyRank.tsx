import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Clipe } from "../comum/Clipe";
import { Cursor } from "../comum/Cursor";
import { Janela } from "../comum/Janela";
import cliques from "./cliques.json";
import { cor, fonte } from "./tema";

// Loop do card do Party Ranking no portfólio: landing 3D → avaliar uma música →
// revelar o pódio → tier list → marca. Gravações do app rodando com dados de
// demonstração (captura/partyrank-demo.mjs e captura/gravar-partyrank.sh).
export const DURACAO_PARTYRANK = 600;

const saida = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Cada parte: quando entra (quadro), qual gravação e de que segundo dela começa.
const PARTES = [
  { entra: 0, arquivo: "pr_landing", de: 0.3, rotulo: "Ranking coletivo", titulo: ["Ranqueie o som", "da galera."], apoio: "Songsets colaborativos: cada um adiciona música e todo mundo vota." },
  { entra: 120, arquivo: "pr_avaliar", de: 2.5, rotulo: "Avaliação", titulo: ["Nota de 0 a 10,", "com o clipe na tela."], apoio: "A ordem é embaralhada por jurado, pra ninguém saber quem colocou o quê." },
  { entra: 260, arquivo: "pr_resultado", de: 2.0, rotulo: "Resultado", titulo: ["A média vira", "o pódio."], apoio: "E o vídeo do resultado é renderizado no GitHub Actions, com FFmpeg." },
  { entra: 400, arquivo: "pr_tier", de: 2.6, rotulo: "Tier lists", titulo: ["Cada um monta", "a sua."], apoio: "Arrasta, solta e o app calcula o consenso do grupo." },
] as const;
const MARCA = 500;
const CLIQUES = cliques as Record<string, { t: number; x: number; y: number }[]>;

const Legenda: React.FC<{ frame: number; i: number }> = ({ frame, i }) => {
  const p = PARTES[i];
  const ate = i < PARTES.length - 1 ? PARTES[i + 1].entra : MARCA;
  if (frame < p.entra || frame > ate + 8) return null;
  const dentro = interpolate(frame, [p.entra + 8, p.entra + 26], [0, 1], { ...clamp, easing: saida });
  const fora = interpolate(frame, [ate - 4, ate + 8], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 54, opacity: Math.min(dentro, fora) }}>
      <div style={{ fontFamily: fonte.mono, fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: cor.amarelo, translate: `0px ${(1 - dentro) * 16}px` }}>
        // {String(i + 1).padStart(2, "0")} · {p.rotulo}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40, marginTop: 14 }}>
        <div style={{ fontFamily: fonte.display, fontWeight: 700, fontSize: 70, lineHeight: 0.95, textTransform: "uppercase", color: cor.texto, translate: `0px ${(1 - dentro) * 24}px` }}>
          {p.titulo[0]}
          <br />
          <span style={{ color: cor.amarelo }}>{p.titulo[1]}</span>
        </div>
        <div style={{ fontFamily: fonte.corpo, fontSize: 23, lineHeight: 1.45, color: cor.textoSuave, maxWidth: 430, translate: `0px ${(1 - dentro) * 30}px` }}>{p.apoio}</div>
      </div>
    </div>
  );
};

const Logo: React.FC<{ tamanho: number }> = ({ tamanho }) => (
  <div style={{ display: "flex", alignItems: "center", gap: tamanho * 0.22, fontFamily: fonte.display, fontWeight: 600, fontSize: tamanho, lineHeight: 1, textTransform: "uppercase" }}>
    <i style={{ width: tamanho * 0.5, height: tamanho * 0.5, borderRadius: `${tamanho * 0.06}px ${tamanho * 0.06}px ${tamanho * 0.06}px ${tamanho * 0.22}px`, background: cor.amarelo }} />
    <span style={{ color: cor.texto }}>
      Party<span style={{ color: cor.amarelo }}>Rank</span>
    </span>
  </div>
);

const Marca: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - MARCA;
  const entra = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: saida });
  return (
    <AbsoluteFill style={{ background: cor.fundo, opacity: interpolate(f, [0, 12], [0, 1], clamp), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ scale: String(0.94 + 0.06 * entra) }}>
        <Logo tamanho={128} />
      </div>
      <div style={{ fontFamily: fonte.corpo, fontSize: 30, color: cor.textoSuave, marginTop: 20, opacity: entra }}>Vote, ranqueie e renderize o pódio.</div>
      <div style={{ display: "flex", gap: 12, marginTop: 44, opacity: interpolate(f, [10, 26], [0, 1], clamp) }}>
        {["Preact", "Three.js", "Bun + Turso", "GitHub Actions", "FFmpeg"].map((t) => (
          <span key={t} style={{ fontFamily: fonte.mono, fontSize: 17, letterSpacing: 1.4, textTransform: "uppercase", color: cor.fundo, background: cor.amarelo, borderRadius: 4, padding: "8px 14px" }}>
            {t}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const PartyRank: React.FC = () => {
  const frame = useCurrentFrame();
  const janelaY = interpolate(frame, [0, 26], [300, 0], { ...clamp, easing: saida });
  const zoom = interpolate(frame, [0, MARCA], [1, 1.03], clamp);
  const abre = interpolate(frame, [0, 10], [1, 0], clamp);
  const fecha = interpolate(frame, [DURACAO_PARTYRANK - 14, DURACAO_PARTYRANK - 1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: cor.fundo }}>
      {/* Grade discreta do fundo do app */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${cor.linha} 1px, transparent 1px), linear-gradient(90deg, ${cor.linha} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <Janela
        x={60}
        y={262}
        largura={1080}
        fundo={cor.fundo}
        barra={cor.elevado}
        sombra={`0 30px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07), 0 0 120px rgba(255,205,17,0.08)`}
        style={{ translate: `0px ${janelaY}px`, scale: String(zoom), transformOrigin: "50% 0%" }}
      >
        {PARTES.map((p, i) => {
          const ate = i < PARTES.length - 1 ? PARTES[i + 1].entra : MARCA;
          // Troca de tela com um fade curto por cima da anterior.
          const op = i === 0 ? 1 : interpolate(frame, [p.entra, p.entra + 10], [0, 1], clamp);
          const tempo = (frame - p.entra) / 30 + p.de;
          return (
            <Sequence key={p.arquivo} from={p.entra} durationInFrames={ate - p.entra + 12} layout="none">
              <div style={{ position: "absolute", inset: 0, opacity: op }}>
                <Clipe arquivo={`partyrank/${p.arquivo}.mp4`} de={p.de} />
                <Cursor tempo={tempo} cliques={(CLIQUES[p.arquivo] || []).filter((c) => c.t > p.de)} cor={cor.texto} borda={cor.fundo} />
              </div>
            </Sequence>
          );
        })}
      </Janela>

      {PARTES.map((_, i) => (
        <Legenda key={i} frame={frame} i={i} />
      ))}

      {frame >= MARCA ? <Marca frame={frame} /> : null}

      <AbsoluteFill style={{ background: cor.fundo, opacity: Math.max(abre, fecha), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
