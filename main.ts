// Leonida Trophy Atlas v2 — a make.fun gta6-trophy-guide-01 entry (Node 22, stdlib only).
// The entry itself is plain static files in app/ (index.html, style.css, app.js and the
// data/*.json files it fetches), served by any static server with app/ at its root and
// working with the network off. This program is only the hand-in step: it copies app/
// and screenshots/ next to this file into the output directory and writes dossier.json,
// the summary the judge reads, using the vendored make.fun library. That library file
// (vendor/makefun-frontend.ts) must stay exactly as shipped — the scorer requires the
// dossier to be byte-for-byte what its own copy of the library writes.
//
// Run locally to check the hand-in:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide itself while building it with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (from the kit's reference/gate.json): only text_max_bytes shapes
// the dossier text; the other limits refuse an entry the scorer would refuse — more than
// 4 screenshots, one over 256 KiB, or app/ past 993 files and directories / 48 MiB. app/
// counts beside /output's own 1000-entry cap, together with screenshots/ and dossier.json.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
