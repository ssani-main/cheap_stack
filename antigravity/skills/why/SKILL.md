---
name: why
description: >-
  Use when the user asks why code, a setting, or a number is the way it is:
  "why is this here", "why was this built like that", "whats this commit",
  "is this commit really necessary", "who changed this and why", "where does
  this code or setting come from", "why was this decided". Answers from
  evidence (git, tickets, notes, logs) with confidence tags. Not for debugging
  errors or explaining how code works.
---

# Why (Antigravity Edition)

Find the reason behind code, a config value, or a number strictly from evidence. Code shows *what* it does, never *why* it exists.

## 1. Anchor
Name the target (`file:line`, symbol, config path, or value) and pull its history:
- `git blame -L <a>,<b> <file>`
- `git log --follow --format='%h %ad %an %s' --date=short -- <file>`
- `git log -S '<string>'` and `git show <sha>` for key commits.
Note who authored it and any ticket IDs in commit messages.

## 2. Search All Relevant Sources (Read-Only)
- **Git:** commit bodies, neighboring commits, all branches (`git log --all`).
- **Local notes:** `docs/`, `NOTES.md`, `MEMORY.md`, ticket folders.
- **Trackers / Mail (if MCP available):** tickets, comments, mail. Never quote passwords or keys found in tickets or mail.
- **Runtime (read-only):** logs or single named non-secret config values through your profile's read-only helpers. Never print env files or full settings tables (`SELECT *`).
- Check config-wired entry points (dependency injection, event listeners, crons, routes, layout XML) in addition to direct callers.
- If multiple sources need deep parallel digging, delegate read-only searches via `invoke_subagent(TypeName="research")` and pass along all read-only boundaries.

## 3. Tag Every Claim by Confidence
- **Direct:** Explicitly stated in a commit body, ticket, mail, or comment. Cite it.
- **Supported:** Multiple indirect clues align. Cite each.
- **Inferred:** Reasonable reading without an explicit statement ("likely" / "seems"). Show the chain.
- **Speculative:** Possible, thin evidence. Say so.
- **Unknown:** Searched and not found. Name what was searched.

Never use "because" without a citation. Treat the user's own hypothesis as something to test, not a given.

## 4. Reply Format
- **Answer:** 2–3 plain sentences first.
- **What we found:** Direct and Supported claims with citations (`sha`, ticket ID, `file:line`, note path).
- **Likely:** Inferred claims and reasoning.
- **What we don't know:** Gaps and who could answer them.
- **Searched:** One line per source checked, including empty ones.
- For *"is this needed?"*: give a verdict of **needed**, **not needed**, or **unclear** plus what breaks without it. Only say "not needed" at Direct or Supported confidence.

<!-- part of cheap_stack -->
