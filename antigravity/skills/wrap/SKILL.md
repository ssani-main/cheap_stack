---
name: wrap
description: >-
  Use when the user says "update whats necessary" (any spelling), "take notes",
  "so we can continue tomorrow / at home / next time", "lets stop here", or
  before /compact, to save session state; and when they ask "what did we do
  yesterday / last time", "do you remember", "where did we leave off", or
  "go back to where we left off", to resume it.
---

# Wrap (Antigravity Edition)

Save and resume work in the places your global `~/.gemini/GEMINI.md` profile names under session notes (or the project's existing `MEMORY.md` / `docs/<topic>/NOTES.md`). Never create a new notes file just for wrap, and never write session state into a tracked shared file (`README.md`, committed `GEMINI.md` / `CLAUDE.md`) without asking.

## Save ("update whats necessary", "take notes")

Often said mid-work: do these steps, then continue with whatever else the same prompt asks.

1. **Time:** Only if your profile names a time-tracking command for this project. Log each unlogged block (start = time noted when the block began, never earlier than the last logged end). Check existing entries first to avoid overlaps, and verify the tool confirmed the entry.
2. **Notes (edit in place):** Update only existing note files with status icons (`✅` done, `▶` in progress, `⏸` paused) and the state line defined in your profile (e.g. branch + commit, pushed or not, deployed where, who was told). Never edit read-only systems — draft text in chat for the user to post.
3. **Running processes:** List background tasks, local servers, browser sessions, and subagents. Stop them **only** when the prompt explicitly says "shut down", "kill", "close everything", or "done for today / going home". Never kill a running deploy, import, or DB write — list it and ask.
4. **Git:** Show current branch and status. Commit or push only if the same prompt asks.
5. **Resume block in chat:**
   ```text
   Done:    <what changed this block>
   State:   <branch/commit; pushed? deployed where? who was told?>
   Running: <what is still running, or nothing>
   Next:    <first step next time>
   Notes:   <file paths updated>
   Time:    <entries logged, or "not tracked">
   ```

## Resume ("what did we do yesterday?")

1. If your profile tracks time for this project, note the start time (`HH:MM`) first.
2. Read the project's existing notes (`MEMORY.md`, `docs/<topic>/NOTES.md`, etc.).
3. Verify claims against git (`git fetch`, `git log --oneline --since=<date>`, `git status`, `git branch -r --contains <sha>` — if pushes are squashed or rebased, check the commit subject or diff on the remote branch; never re-push to "fix" it).
4. Reply with: where work stopped, what is verified vs. still open, and the next step. If several items are open, list them numbered and let the user pick.

<!-- part of cheap_stack -->
