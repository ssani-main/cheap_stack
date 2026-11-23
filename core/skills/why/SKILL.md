---
name: why
description: Use when the user asks why code, a setting or a number is the way it is: "why is this here", "why was this built like that", "whats this commit", "is this commit really necessary", "who changed this and why", "where does this code or setting come from", "why was this decided". Answers from evidence (git, tickets, mail, notes, logs) with each claim marked by how sure it is. Not for a failing test, an error or a data mismatch (debug those), and not for how something works (explain that directly).
---

# Why

Find the reason behind code, a config value or a number, from evidence. The code shows what it does, never why it exists.

## 1. Anchor

Name the target: file and line range, symbols, config path or the number. Then pull its history:
`git blame -L <a>,<b> <file>`, `git log --follow --format='%h %ad %an %s' --date=short -- <file>`, `git log -S '<string>'`,
and `git show <sha>` for each commit that matters. Note who wrote it (the user, a colleague, an outside agency) and every
ticket ID in the messages.

## 2. Search every source that fits, and record what came back empty

Git always. Then the sources in the cheap_stack profile under "Evidence sources", all read only:
- **Git:** commit bodies, the commits around it, other branches (`git log --all`).
- **Ticket tracker** (via its MCP): the ticket and its comments.
- **Mail** (mail MCP) or the files the user points to. Never quote a password or key found in a mail or ticket.
- **Local notes:** project memory, `docs/<topic>/NOTES.md`, ticket folders.
- **Runtime:** logs, and single named non-secret config values, through the profile's read-only helpers. Never print files
  or tables that hold secrets (env files, settings tables with `SELECT *`). Assume output is not masked unless the profile
  says it is.

Systems the profile lists as read-only stay read-only. Do it yourself. Spawn read-only sub-agents only when several sources
each need a deep dig, and pass on the read-only list.

## 3. Mark how sure each claim is

- **Direct:** someone wrote down the reason (commit body, ticket, mail, code comment). Cite it.
- **Supported:** several indirect pieces point the same way. Cite each one.
- **Inferred:** a reasonable reading with nothing stating it. Use "likely" or "seems", and show the chain.
- **Speculative:** possible, thin evidence. Say so.
- **Unknown:** searched, not found. Say what was searched.

"Because" only goes next to a citation. The user's own guess is one hypothesis to check, not the answer. When two sources
disagree, show both. Finding nothing is not proof there was no reason.

## 4. Reply

- **Answer** in two or three plain sentences first.
- **What we found:** the Direct and Supported claims, each with its citation (sha, ticket ID, `file:line`, note file, mail
  subject and date).
- **Likely:** the Inferred claims with their reasoning.
- **What we don't know**, and who could answer it.
- **Searched:** one line per source, including the empty ones.
- For "is this needed?": a verdict of needed, not needed or unclear, plus what would break without it. Grep the code
  callers and also the config that wires code without a caller (dependency injection, event and cron config, routes,
  layout files). "Not needed" only at Direct or Supported; otherwise say "unclear". Removing it is a separate code change.
