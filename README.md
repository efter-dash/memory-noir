# Memory Noir — The Case of Us

A complete browser mystery about shared memories, with a rainy 3D detective office, a collaborative corkboard, and a memory dossier to keep.

## Play

Choose **Try the solo mystery** to play immediately. Inspect the six glowing objects, or use **Examine objects**. Pin clues, add theories, and connect two cards with red thread. When the evidence fits, submit who, what, and where.

For friends, choose **Open a new case**. Enter your name and three pieces of a real memory, or host the ready-made case. Share the room code. Once a detective joins, begin the ten-minute investigation.

The storyteller can flicker the lamp, send resonance pulses, and deliver two telegram hints. Detectives propose a theory and vote. In a custom case the storyteller decides whether the team recovered the memory; the sample case is checked automatically. The timer and verdict are enforced by the server.

At the reveal, **Keep the memory dossier** downloads a PNG containing the story, proof, theories, and participants. Sound is opt-in.

The hosted Site starts **owner-private**. Friends need Site access as well as a room code. This project does not silently change sharing permissions.

## Included

- Procedural Three.js room: orbit, zoom, rain, particles, lighting, animated fan, six raycastable evidence props.
- A complete sample case, The Midnight Lockout, and custom three-prompt memory cases.
- Four-character rooms, 2–8 players, role separation, reconnect in the same tab, presence and shared cursors.
- Shared evidence, draggable/keyboard-movable pins, notes, and red-thread connections.
- Private storyteller controls, two hint charges, synchronized timer, voting and reveal.
- Responsive interface, dialog keyboard focus, reduced-motion support, evidence menu fallback.
- Downloadable PNG dossier and procedurally synthesized ambience.
- Server-side D1 persistence and optimistic revision checks to prevent lost simultaneous edits.

## Run locally

Requires Node 22.13+ and npm.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_daily_mad_thinker.sql
npm start -- --port 4173
```

Apply the migration only once per local database. Then open http://127.0.0.1:4173. For development after initializing the database, `npm run dev` provides hot reload.

```sh
node --test tests/game.test.mjs
npx tsc --noEmit
node tests/api.test.mjs
```

The API integration test requires a running local server and creates an isolated synthetic test case with three sessions. `TEST_ORIGIN` can select another test origin. Do not point it at an unrelated service.

## Architecture

React + TypeScript, Three.js, Vinext/Vite, Cloudflare Workers, D1, Drizzle schema migrations. `/api/room` accepts bounded JSON commands with a per-tab random bearer token. The server checks roles, strips private truth and tokens from detective responses, and retries conflicting room updates. Player names and clues are rendered as text.

The database stores one versioned JSON room record. Clients poll every 1.5 seconds while visible. Room codes locate a lobby; session tokens authorize a player's subsequent actions. Rooms become inaccessible after 24 hours; expiry is not physical deletion. This is a private first release, not a hardened public matchmaking service. Public hosting should add rate limits, record retention/cleanup, moderation, and room-code brute-force protection.

## Deliberate differences from the concept

- Hosting-compatible polling replaces WebSockets; presence is approximate, not frame-synchronous.
- A deterministic noir template generator replaces a paid LLM call. The proof and false lead are personalized; remaining clues are atmospheric prompts. No API keys or paid AI calls are needed.
- One office theme and one authored sample case are included.
- Audio is synthesized rain, drone and chimes; the tape provides a written transcript. There are no recorded voice memos or licensed jazz tracks.
- Dossiers export PNG images, not PDF. Mobile CSS and keyboard access are included; physical phone testing is still needed.
- No postprocessing bloom or smooth inspection camera zoom: atmospheric lighting and an inspection card provide the current presentation.

## Main files

- `components/game/Game.tsx` — game UI and session lifecycle
- `components/game/Room.tsx` — complete procedural 3D room
- `components/game/audio.ts` — browser audio
- `lib/game.ts` — case composition, permissions, voting, state transitions
- `app/api/room/route.ts` — D1 room API and optimistic updates
- `db/schema.ts`, `drizzle/` — persistent schema and migration
- `tests/` — logic and multi-session integration tests

No credentials belong in this repository. `.sites-runtime`, local databases, build output and dependencies are ignored.
