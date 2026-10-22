import React from "react";

// Janela de app desktop: a gravação (1440×900 px CSS) desenhada na largura `largura`.
export const GRAVACAO_L = 1440;
export const GRAVACAO_A = 900;

export const Janela: React.FC<{
  x: number;
  y: number;
  largura: number;
  fundo: string;
  barra: string;
  sombra: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, largura, fundo, barra, sombra, style, children }) => {
  const k = largura / GRAVACAO_L;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: largura,
        borderRadius: 14,
        overflow: "hidden",
        background: barra,
        boxShadow: sombra,
        ...style,
      }}
    >
      <div style={{ height: 30, display: "flex", alignItems: "center", gap: 8, paddingLeft: 14 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <i key={c} style={{ width: 11, height: 11, borderRadius: 6, background: c }} />
        ))}
      </div>
      <div style={{ position: "relative", width: largura, height: GRAVACAO_A * k, overflow: "hidden", background: fundo }}>
        <div style={{ position: "absolute", inset: 0, width: GRAVACAO_L, height: GRAVACAO_A, scale: String(k), transformOrigin: "0 0" }}>
          {children}
        </div>
      </div>
    </div>
  );
};
