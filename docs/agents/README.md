# Codex agent map

Project custom agents live in `.codex/agents/`:

- `frontend.toml`
- `backend.toml`
- `bot.toml`
- `reviewer.toml`
- `security.toml`
- `teamlead.toml`

Scoped `AGENTS.md` files live next to code because Codex loads `AGENTS.md` by repository path, not by custom-agent name:

- `/AGENTS.md` — repository-wide product, architecture, security, testing rules.
- `/apps/miniapp/AGENTS.md` — frontend/Mini App rules.
- `/apps/api/AGENTS.md` — backend/API rules.
- `/apps/bot/AGENTS.md` — Telegram bot rules.

Reviewer, security and teamlead are cross-cutting roles, so their role-specific behavior belongs in their `.codex/agents/*.toml` files rather than artificial code directories.

Suggested orchestration prompt:

> Have teamlead plan the feature. Delegate implementation to frontend/backend/bot as appropriate. After integration, have reviewer inspect correctness and security inspect Telegram auth/privacy risks. Resolve P0/P1 findings before declaring done.
