---
name: fable-review-loop
description: Use when the user asks to audit, review or double-check finished work with a Fable sub-agent, says "spawn fable to review", "review loop", "audit what we did", or before calling a feature done, pushing or deploying it after larger changes.
---

# Fable review loop

## Overview
An independent reviewer on Fable reads the change and reports. It never changes anything.
You stay responsible: every finding is checked against the code by you before anything is
fixed, and every fix is tested before you report back.

## Steps

1. **Scope.** List the commits/files in scope. Run the existing tests yourself first, so the
   reviewer gets facts, not guesses.
2. **Brief** (the reviewer starts with zero context). Give, in this order:
   - what the feature does and why (one paragraph), the files and commits;
   - already fixed in earlier rounds (so they are not re-reported);
   - known and accepted limits (user decisions);
   - facts from testing (what was verified, where, test counts);
   - focus areas: what worries you most;
   - report format: real bugs ranked with `file:line`, failure scenario, confidence, smallest
     fix; then nice-to-haves; what was checked and fine; what needs running code.
3. **Spawn** with `subagent_type: fable-reviewer` (defined in `~/.claude/agents/fable-reviewer.md`:
   tools Read/Grep/Glob only, model fable, effort medium), `run_in_background: true`.
   If that type is not listed (agent files load at session start), use `Explore` with
   `model: fable`, `effort: medium`, and write "only Read, Grep, Glob; no Bash" into the brief.
   Tell the user that this fallback still has a shell.
4. **Verify each finding yourself.** Read the cited lines and the vendor/framework code behind
   the claim. Mark it confirmed, wrong, or accepted-by-user. Wrong findings are dropped with a
   one-line reason. A "what if X is null" finding only counts when you can trace a real call path
   that gets there. Reviewers pad thin reviews with nits: if every finding is a nit, the change is
   probably fine, say so.
5. **Fix** the confirmed bugs (the Act-on ones in step 7), smallest change, in the codebase's own patterns. New logic gets
   a unit test.
6. **Test**: unit tests, then the real app (local browser; TEST/stage only when the user asked
   for it there). Any data changed for a test is saved first and restored after, then checked
   against the backup.
7. **Report**: one line per finding — verdict, fix, how it was tested. Sort them into **Act on**
   (confirmed bugs, fixed now), **Consider** (real, cost unclear), **Noted** (valid but low value,
   and accepted-by-user ones) and **Dismissed** (wrong or missing context, with the reason, so the
   user can overrule). More than about 5 Act-on items usually means nits slipped in, but never
   demote a confirmed bug to fit that number. Then what was not checked. Ask before commit/push/deploy unless the user
   already said so.

## Common mistakes
| Mistake | Instead |
|---|---|
| Fixing what the reviewer says without reading the code | Step 4 for every finding, including "confirmed" ones |
| Reviewer with Edit/Write/Bash (general-purpose) | `fable-reviewer`, or Explore + no-Bash brief |
| Thin brief ("review my changes") | All six brief parts; the reviewer has no memory of the session |
| Re-reviewing the same findings each round | List earlier fixes in the brief |
| "Fixed" without a test run | Unit tests + app check before reporting |
| Restore script that silently failed | Check the restore against the backup and say if it failed |
| Testing a fix that sends mail (cron, order save) without checking where mail goes | Check the mail settings of that environment first; local/test copies often hold real servers and real staff lists |
| Trusting "plausible" findings about an external API | Ask the real API read-only (bad input, real edge case) before fixing or dismissing |

<!-- part of cheap_stack -->
