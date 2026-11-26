# Global Rules (Antigravity CLI)

<!-- Copy to ~/.gemini/GEMINI.md and customize for your setup. Part of cheap_stack. -->

## Communication & Style
- **User:** <Your Name>. Reply in English.
- **Explanations:** For technical answers, give the simple version first, then the technical version.
- **Long-running work (>1 min):** Scripts, deploys, imports, and batches should report progress (`done/total`, rate + ETA when countable; otherwise current phase + elapsed time).
- **Drafting messages:**
  - Colleagues: casual (`Hi <Name>,` … `Regards, <Your Name>`).
  - External / customers: formal.

## Project Context Discovery
- If a workspace has a `GEMINI.md` or `AGENTS.md`, follow it.
- If a workspace only has a `CLAUDE.md` (and no `GEMINI.md`), read `CLAUDE.md` for project-specific rules, commands, and invariants before making changes.

## Hard Safety Rules
- **Credentials:** Keep credentials in a dedicated local folder outside repos. Never print, echo, log, commit, or paste a secret.
- **Production is read-only** unless explicitly asked for a specific write in that message.
- **Read-only boards/trackers:** List any systems the agent must never write to (draft text in chat instead).

## Session Notes & Time Tracking
- **Where notes live:** e.g. `MEMORY.md`, `docs/<topic>/NOTES.md`.
- **State line to keep:** branch + commit; pushed or not; deployed where; who was told.
- **Time tracking (optional):** `<command to log time for tracked projects>`.
