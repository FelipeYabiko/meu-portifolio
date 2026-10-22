import React from "react";
import { Easing, interpolate } from "remotion";

export type Clique = { t: number; x: number; y: number };

const suave = Easing.bezier(0.65, 0, 0.35, 1);
const VIAGEM = 0.55; // segundos que o cursor leva até cada clique

// Cursor desenhado por cima da gravação (o headless não tem cursor). `tempo` é o
// segundo atual do clipe; os cliques vêm do captura/gravar.mjs, em px CSS.
export const Cursor: React.FC<{ tempo: number; cliques: readonly Clique[]; cor: string; borda: string }> = ({ tempo, cliques, cor, borda }) => {
  if (!cliques.length) return null;
  const pontos = [{ t: -10, x: cliques[0].x + 260, y: cliques[0].y + 220 }, ...cliques];
  let x = pontos[pontos.length - 1].x;
  let y = pontos[pontos.length - 1].y;
  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1];
    const b = pontos[i];
    if (tempo < b.t) {
      const k = interpolate(tempo, [b.t - VIAGEM, b.t], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave });
      x = a.x + (b.x - a.x) * k;
      y = a.y + (b.y - a.y) * k;
      break;
    }
  }
  // Aperto e onda no instante de cada clique.
  const ultimo = [...cliques].reverse().find((c) => tempo >= c.t);
  const desde = ultimo ? tempo - ultimo.t : 99;
  const aperto = desde < 0.18 ? 0.86 : 1;
  const onda = desde < 0.5 ? desde / 0.5 : null;
  return (
    <>
      {onda !== null && ultimo ? (
        <div
          style={{
            position: "absolute",
            left: ultimo.x - 30,
            top: ultimo.y - 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            border: `3px solid ${cor}`,
            scale: String(0.4 + onda * 1.1),
            opacity: 1 - onda,
          }}
        />
      ) : null}
      <svg width="34" height="34" viewBox="0 0 24 24" style={{ position: "absolute", left: x - 6, top: y - 3, scale: String(aperto), transformOrigin: "6px 3px", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.35))" }}>
        <path d="M5 2.5 L5 19.5 L9.4 15.4 L12.3 21.6 L15.2 20.3 L12.4 14.2 L18.4 14.2 Z" fill={cor} stroke={borda} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};
