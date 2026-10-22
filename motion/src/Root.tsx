import React from "react";
import { Composition } from "remotion";
import "@fontsource/bowlby-one/400.css";
import "@fontsource/inter-tight/400.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource/bricolage-grotesque/400.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/antonio/600.css";
import "@fontsource/antonio/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/jetbrains-mono/400.css";
import { Mercado, DURACAO_MERCADO } from "./mercado/Mercado";
import { Deps, DURACAO_DEPS } from "./deps/Deps";
import { PartyRank, DURACAO_PARTYRANK } from "./partyrank/PartyRank";

// Cards de projeto do portfólio: 4:3, como .project-row__image (aspect-ratio 4/3).
export const Root: React.FC = () => (
  <>
    <Composition id="Mercado" component={Mercado} width={1200} height={900} fps={30} durationInFrames={DURACAO_MERCADO} />
    <Composition id="Deps" component={Deps} width={1200} height={900} fps={30} durationInFrames={DURACAO_DEPS} />
    <Composition id="PartyRank" component={PartyRank} width={1200} height={900} fps={30} durationInFrames={DURACAO_PARTYRANK} />
  </>
);
