# Leonida Trophy Atlas v2 — Platinum Planner

[![GTA 6 Trophy Guide bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/funtoons/gta6-trophy-guide-bot-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/funtoons/gta6-trophy-guide-bot-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI** — built for the [make.fun GTA 6 trophy guide bounty ($250)](https://make.fun/bounty/gta6-trophy-guide-01). Every trophy shows its official name, description and grade exactly as PlayStation publishes them, plus a guide written for this entry in our own words, with the source of each fact named beside it.

## What it does

- **Checklist tracker** — tick trophies off; progress is saved in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Full guide per trophy** — numbered steps (what, where, how, when it can be missed), difficulty 1–5, time estimate, story chapter, prerequisites, missable flag, and at least two cited sources per trophy (PowerPyx, KeenGamer, PlanetGTA6, Output Lag).
- **Filters** — by kind (story, missable, collectibles, activities, side, robberies, money, online — 0 online trophies, all 55 are single-player), grade, difficulty, chapter, earned-only, plus name search and sorting by difficulty, time or name.
- **Spoiler setting** — hides the names, descriptions and guides of the 12 story trophies until you earn them.
- **Platinum Planner** — hours left from your unticked trophies, broken down by category, the biggest remaining time sinks, and the full 100% Completion checklist (for A Long Road) with its required counts.
- **Roadmap** — 8 stages to the platinum (~200 hours) with clickable trophy chips that jump to the checklist.
- **Missable & warnings** — the one potentially missable trophy (Positive Mental Attitude, Chapter 1 balcony meditation), the cheat warning (cheats disable trophies and saving), and the manual-save advice (no mission replay, no New Game+).
- **Deep links** — `?trophy=`, `?filter=`, `?spoiler=`, `?view=` (checklist / roadmap / planner / missable).

Two trophies are still unconfirmed by every major guide (Bad Luck, I Guess and Ten Pin). Their entries say so honestly and give the best current lead instead of inventing a method.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — the app is plain static files under `app/` with no build step, and it works with the network off.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap
- KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap
- PlanetGTA6 — GTA 6 Trophies: All 55
- Output Lag — GTA 6 Trophy List
- GTA Zone — GTA 6 Trophies and Achievements

---

Built for [make.fun](https://make.fun) — referral code `mqqhsens`.
