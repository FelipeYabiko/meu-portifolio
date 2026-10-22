import React from "react";
import { OffthreadVideo, staticFile } from "remotion";

// Gravação de tela (sem áudio), começando `de` segundos dentro do arquivo.
export const Clipe: React.FC<{ arquivo: string; de?: number; style?: React.CSSProperties }> = ({ arquivo, de = 0, style }) => (
  <OffthreadVideo
    src={staticFile(arquivo)}
    trimBefore={Math.round(de * 30)}
    muted
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }}
  />
);
