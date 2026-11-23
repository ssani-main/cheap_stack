# cheap_stack profile

<!-- Example: the author's real profile with names, companies, servers and paths replaced. Copy what fits, or run
     /cheap-setup to build your own from your history. -->

## Me
- Name for sign-offs: Alex
- Answer me in: English (German only in drafts for other people)
- When the answer is technical, give the simple version first, then the technical one.
- Anything that runs longer than about a minute (scripts, deploys, imports, reindex, batches) reports progress by itself:
  done/total, rate and an ETA where it can be counted, otherwise the current phase and elapsed time.

## Messages (draft skill)
- Languages: German and English, German first. Ticket comments: one language, the ticket's.
- Colleagues: casual, "Hi Anna," … "Grüße / Regards, Alex". Explain the why in a sentence or two, reassure, say what to
  do, what comes next.
- Customers, external companies, the agency's management: "Sie", "Guten Tag Frau/Herr X," … "Viele Grüße, Alex".
- Out of scope: letters to authorities (a separate skill handles those).

## Session notes (wrap skill)
- Where state lives: the project memory `MEMORY.md` "Current work" lines plus their `project_*.md` (only where that section
  exists); `docs/<topic>/NOTES.md` (START HERE); in the data-upload repo: the ticket's `ticket.json`.
- State line to keep: branch + commit; pushed or not; on TEST or not; on PROD or not; agency developer told or not.

## Time tracking (wrap skill)
- Work projects only (shop repo, data-upload repo, company website):
  `python ~/tools/timelog.py <ticket folder | -> <start> <end> "<what>" [--task ...]`.
  It has no overlap check: look at the entries already in ticket.json first.

## Read-only systems
- The task board (never write), the production shop (read-only unless asked for a specific write), the agency's modules
  (report, don't edit).

## Credentials
- Credentials folder: ~/.creds (read its README first)
- Never print, echo or paste a secret. Scripts read the files themselves.

## Evidence sources (why skill)
- Jira (Atlassian MCP), the task board (read-only), mail (mail MCP), project memory (`project_*.md`, `deploy-guide-*.md`),
  `docs/<ticket>/`, the data-upload repo's `tickets/`.
- Runtime, read only: `~/.creds/bin/prod_ssh.sh` and `run_sql.sh prod` (output masked).
  Magento: plugins, observers and crons are wired in `etc/*.xml` and layout XML.
