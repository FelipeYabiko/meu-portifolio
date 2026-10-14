import React from "react";
import { Composition } from "remotion";
import "@fontsource/bowlby-one/400.css";
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/dm-mono/500.css";
import { Mercado, DURACAO_MERCADO } from "./mercado/Mercado";

// Cards de projeto do portfólio: 4:3, como .project-row__image (aspect-ratio 4/3).
export const Root: React.FC = () => (
  <Composition id="Mercado" component={Mercado} width={1200} height={900} fps={30} durationInFrames={DURACAO_MERCADO} />
);
