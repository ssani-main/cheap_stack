# Evidence

What cheap_stack was built from: one person's prompt history, and a full read of pstack. Run `/cheap-setup` to get the same
kind of numbers for yourself.

## The author's prompt history, 12 weeks

About 5,250 prompts. Three read-only sub-agents each read one third, every line, with secrets redacted first. Counts are
rough (reading plus keyword counts); where a later recount disagreed, the recount is shown.

**Where the work was:** one shop repo about 60%, a data-upload repo 8%, the rest spread over about 30 side projects.

| Pattern | About | Notes |
|---|---|---|
| "update whats necessary" | 240 | End of nearly every block, often mid-session |
| `/clear` | 233 | After almost every finished task, so every task starts cold |
| "did you test / are you sure / 100% true / reproduce locally" | 215 | Daily |
| Drafting replies to colleagues | 50 to 185 | Narrow search 50, agent estimate 185 |
| "how long / still not done" | 175 | Long runs gave no progress or ETA |
| BI and SQL queries | 160 | Recount; mostly in two months, rare after |
| "take notes, continue tomorrow" | 105 | |
| "explain simply / I don't understand" | 90 | |
| "what did we do yesterday" | 66 | |
| "fable review" | 47 | Within two weeks of adopting a review loop |
| "follow the master list 100%" | 45 | The data-upload repo |
| "English please" | 21 | The agent answered in German |
| Time tracking forgotten | 21 | |

The repeated short prompts were the clearest signal: "update whats necessary" (103 times in its two spellings), "so what
now", "how is it now", "still not done", "how long is it gonna be", "english please". `mine_history.js` finds these by
itself.

## pstack: what was taken and what was left

[pstack](https://github.com/cursor/plugins/tree/main/pstack) (a Cursor plugin by poteto, v0.9.0): a router skill with 15
playbooks, 20 principle skills and 13 workflow skills, about 4,000 lines.

| pstack part | Verdict | Reason |
|---|---|---|
| poteto-mode router and playbooks | Left | Overhead (todo list first, cite every principle) that did not match the history |
| how | Rule | Its output shape and "simple first" became a profile line; multi-explorer and multi-model critics dropped |
| why | Taken | Its confidence tiers are the best part of pstack; cut to one agent |
| architect, arena | Left | They need several model families; Claude Code has one |
| interrogate | Ideas taken | Lead-judgment buckets and "trace the call path" went into fable-review-loop |
| reflect | Idea taken | Its filter for what goes into notes is used by wrap |
| figure-it-out | Idea taken | The VERIFIED / NOT VERIFIED / INCONCLUSIVE verdict words |
| show-me-your-work | Left | Existing notes and a time tracker already were the trail |
| unslop | Partly | Plain-speech rules for drafts; its em-dash and colon bans left out |
| setup-pstack (model per role) | Left | Nothing to configure: one reviewer, model set in its agent file |
| automate-me (mine transcripts) | Taken, reshaped | Became `/cheap-setup` + `mine_history.js` |
| Principles | Mostly covered | Ponytail already holds laziness, subtract first, root cause, prove it works |
| "encode lessons in structure" | Applied | Why secrets got a hook and a filter instead of more text |

## Dropped on purpose

- A BI-query skill: about 160 prompts, but almost none in the last month, and the rules fit in project notes.
- An explain skill: a fifth of all prompts were concept questions, too broad for a skill to trigger on; a profile line
  catches it better.
- A separate resume skill: merged into wrap, because it reads the same places.
- A new notes file for wrap: a fourth notes location would drift and clash between parallel sessions.
