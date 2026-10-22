// Dados de demonstração do Party Ranking, criados pela API pública.
// Rode com o servidor do partyrank-vercel no ar e um banco local vazio:
//   TURSO_DATABASE_URL=file:demo.db TURSO_AUTH_TOKEN=local bun run server/migrate.ts
//   TURSO_DATABASE_URL=file:demo.db TURSO_AUTH_TOKEN=local bun run server/server.ts
//   DEMO_DB=/caminho/para/demo.db node captura/partyrank-demo.mjs
// A gravação muda o banco (dá notas), então recrie o banco antes de gravar de novo.
const API = `${process.env.PARTYRANK_URL || 'http://localhost:8000'}/api.php`;
const call = async (method, action, body, token, qs = '') => {
  const r = await fetch(`${API}?action=${action}${qs}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: method === 'GET' ? undefined : JSON.stringify(body || {}),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`${action}: ${JSON.stringify(j)}`);
  return j;
};
const PW = 'demo-partyrank';
const PEOPLE = [['felipe', '😎'], ['ana', '🦊'], ['bruno', '🎸'], ['carol', '🌸'], ['diego', '🐙'], ['larissa', '🍉'], ['marcos', '🎧']];
const U = {};
for (const [name, photo] of PEOPLE) {
  const r = await call('POST', 'register', { username: name, password: PW, photo });
  U[name] = { id: r.user.id, token: r.token };
}
const names = Object.keys(U);
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const score = (base) => Math.max(0, Math.min(10, Math.round((base + (rnd() - 0.5) * 3) * 2) / 2));

async function songset(name, host, songs, { rate = 1, conclude = false, open = true, comments = [] } = {}) {
  const ss = (await call('POST', 'songsets', { name }, U[host].token)).songset;
  const ids = [];
  for (let i = 0; i < songs.length; i++) {
    const [vid, song_name, artist, base] = songs[i];
    const who = names[i % names.length];
    const r = await call('POST', 'songs', { songset_id: ss.id, video_id: vid, url: `https://www.youtube.com/watch?v=${vid}`, song_name, artist, timestamp: 30 }, U[who].token);
    ids.push([r.song.id, base]);
  }
  if (open) await call('POST', 'toggle_rating_open', { id: ss.id }, U[host].token);
  for (const n of open ? names : []) {
    for (const [id, base] of ids) {
      if (rnd() > rate) continue;
      await call('POST', 'rate', { song_id: id, rating: score(base) }, U[n].token);
    }
  }
  for (const [idx, who, text] of comments) await call('POST', 'song_comment', { song_id: ids[idx][0], comment: text }, U[who].token);
  if (conclude) await call('POST', 'toggle_concluded', { id: ss.id }, U[host].token);
  return ss.id;
}

const festa = await songset('Hits da Festa 🎉', 'felipe', [
  ['OPf0YbXqDm0', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 9.1],
  ['kJQP7kiw5Fk', 'Despacito', 'Luis Fonsi ft. Daddy Yankee', 7.6],
  ['JGwWNGJdvx8', 'Shape of You', 'Ed Sheeran', 7.9],
  ['9bZkp7q19f0', 'Gangnam Style', 'PSY', 6.8],
  ['4NRXx6U8ABQ', 'Blinding Lights', 'The Weeknd', 9.3],
  ['pRpeEdMmmQ0', 'Waka Waka', 'Shakira', 8.2],
  ['CevxZvSJLk8', 'Roar', 'Katy Perry', 6.9],
  ['hT_nvWreIhg', 'Counting Stars', 'OneRepublic', 8.0],
  ['09R8_2nJtjg', 'Sugar', 'Maroon 5', 7.4],
  ['e-ORhEE9VVg', 'Blank Space', 'Taylor Swift', 8.5],
  ['fRh_vgS2dFE', 'Sorry', 'Justin Bieber', 6.4],
  ['dQw4w9WgXcQ', 'Never Gonna Give You Up', 'Rick Astley', 8.8],
], { conclude: true, comments: [[4, 'ana', 'abriu a pista inteira 🔥'], [11, 'bruno', 'fui rickrollado de novo'], [0, 'carol', 'impossível ficar parado'], [3, 'diego', 'clássico das formaturas']] });

const rock = await songset('Rock Clássico 🤘', 'bruno', [
  ['fJ9rUzIMcZQ', 'Bohemian Rhapsody', 'Queen', 9.6],
  ['hTWKbfoikeg', 'Smells Like Teen Spirit', 'Nirvana', 8.7],
  ['1w7OgIMMRc4', "Sweet Child O' Mine", "Guns N' Roses", 9.0],
  ['tAGnKpE4NCI', 'Nothing Else Matters', 'Metallica', 8.6],
  ['kXYiU_JCYtU', 'Numb', 'Linkin Park', 8.3],
  ['btPJPFnesV4', 'Eye of the Tiger', 'Survivor', 7.8],
], { rate: 0.6 });

const oitenta = await songset('Anos 80 ✨', 'carol', [
  ['djV11Xbc914', 'Take On Me', 'a-ha', 9],
  ['Zi_XLOBDo_Y', 'Billie Jean', 'Michael Jackson', 9],
], { open: false });

const tl = (await call('POST', 'tierlist', { name: 'Clipes mais icônicos', tiers: [
  { name: 'S', color: '#FF4D6D' }, { name: 'A', color: '#FF9F1C' }, { name: 'B', color: '#FFD60A' }, { name: 'C', color: '#4CC9F0' }, { name: 'D', color: '#8D99AE' },
] }, U.felipe.token)).tierlist;
const full = await call('GET', 'tierlist', null, U.felipe.token, `&id=${tl.id}`);
const tiers = (full.tiers || full.tierlist?.tiers || []).map((t) => t.id);
const clips = [['dQw4w9WgXcQ', 'Never Gonna Give You Up', 0], ['9bZkp7q19f0', 'Gangnam Style', 0], ['fJ9rUzIMcZQ', 'Bohemian Rhapsody', 0], ['djV11Xbc914', 'Take On Me', 1], ['Zi_XLOBDo_Y', 'Billie Jean', 1], ['OPf0YbXqDm0', 'Uptown Funk', 1], ['hTWKbfoikeg', 'Teen Spirit', 2], ['CevxZvSJLk8', 'Roar', 3], ['fRh_vgS2dFE', 'Sorry', 2], ['kJQP7kiw5Fk', 'Despacito', 2]];
for (const [vid, name, tier] of clips) {
  const item = (await call('POST', 'tierlist_item', { tierlist_id: tl.id, image_url: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, name }, U.felipe.token)).item;
  for (const n of names) {
    const t = Math.max(0, Math.min(4, tier + (rnd() < 0.25 ? 1 : rnd() < 0.15 ? -1 : 0)));
    await call('POST', 'tierlist_placement', { tierlist_id: tl.id, item_id: item.id, tier_id: tiers[t] }, U[n].token);
  }
}
// O host só vê o resultado depois do vídeo do pódio gerado (no GitHub Actions,
// que não roda aqui). Marca o vídeo como pronto direto no banco local.
if (process.env.DEMO_DB) {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(process.env.DEMO_DB);
  db.prepare(`INSERT INTO video_jobs (id, user_id, songset_id, songset_name, status, output_url)
              VALUES ('demo', ?, ?, 'Hits da Festa 🎉', 'done', 'https://example.invalid/demo.mp4')`).run(U.felipe.id, festa);
  db.close();
}
console.log(`demo pronta: songsets ${festa}, ${rock}, ${oitenta} e tierlist ${tl.id}`);
