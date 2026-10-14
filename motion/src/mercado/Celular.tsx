import React from "react";
import { cor } from "./tema";

// Tela do celular em pixels CSS do app (viewport 390×844), desenhada na escala K.
export const TELA_L = 390;
export const TELA_A = 844;
export const K = 0.9;
const BORDA = 12;

export const Celular: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: TELA_L * K + BORDA * 2,
      height: TELA_A * K + BORDA * 2,
      borderRadius: 48,
      background: cor.tinta,
      padding: BORDA,
      boxSizing: "border-box",
      // Sombra "chunk" do próprio app, maior.
      boxShadow: `10px 10px 0 ${cor.primaria}`,
    }}
  >
    <div style={{ position: "relative", width: TELA_L * K, height: TELA_A * K, borderRadius: 36, overflow: "hidden", background: cor.papel }}>
      <div style={{ position: "absolute", inset: 0, width: TELA_L, height: TELA_A, scale: String(K), transformOrigin: "0 0" }}>{children}</div>
    </div>
  </div>
);
