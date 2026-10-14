import React from "react";
import { Img, staticFile } from "remotion";
import { TELA_L } from "./Celular";

// Uma captura do app (1170 px = 390 CSS × 3), rolada `rolagem` px CSS.
export const Tela: React.FC<{ arquivo: string; rolagem?: number; style?: React.CSSProperties }> = ({ arquivo, rolagem = 0, style }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
    <Img src={staticFile(`mercado/${arquivo}`)} style={{ position: "absolute", left: 0, top: -rolagem, width: TELA_L }} />
  </div>
);

// Toque: um círculo que cresce e some, no ponto (x, y) em px CSS da tela.
export const Toque: React.FC<{ frame: number; em: number; x: number; y: number }> = ({ frame, em, x, y }) => {
  const t = (frame - em) / 14;
  if (t < 0 || t > 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 28,
        top: y - 28,
        width: 56,
        height: 56,
        borderRadius: 28,
        background: "rgba(31, 20, 10, 0.28)",
        scale: String(0.5 + t * 0.9),
        opacity: 1 - t,
      }}
    />
  );
};
