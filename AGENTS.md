# Hazeyn / Hakikat / Afyon Hakikat accounting

This is the authoritative main application source. Codex and Claude share these files.
For work in this local workspace read `../../turizm-ortak/AGENTS.md`, `PROJECT.md` and `HANDOFF.md` in that same folder first. Do not copy or merge customer records with Hisam.

- Preserve the public marketing site and all three company partitions.
- Run `npm test` and `npm run test:public` for application changes.
- Main-branch pushes auto-deploy; do not push to main just to exchange code with Claude.
- Never commit `.env*`, live DB exports, customer backups or credentials. `data/db.json` / `public/data/db.json` are public marketing seeds, not a destination for live accounting records.
- Register the writer in the shared workspace, inspect Git status first, update shared HANDOFF.md and commit only reviewed files. Preserve untracked work left by previous tasks.
- If this repository is cloned alone, the shared tools may not be present. These company isolation, testing and source-only rules still apply; locate the shared workspace before cross-project work.
