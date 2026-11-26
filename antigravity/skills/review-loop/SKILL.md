---
name: review-loop
description: >-
  Use when the user asks to audit, review, or double-check finished work,
  says "review this", "review loop", "audit what we did", or before calling
  a larger feature/fix done, pushing, or deploying (e.g. multi-file changes or
  checkout, login, price, licence, or cron logic).
---

# Review Loop (Antigravity Edition)

An independent read-only reviewer inspects the change with zero prior context and reports findings. You verify every finding against the actual code, fix confirmed bugs, re-test, and report.

## Steps

1. **Scope & baseline tests:** List the commits/files in scope and run existing tests first so the reviewer gets real facts, not guesses.
2. **Write a complete brief** (the reviewer has zero session memory):
   - What the change does and why (1 paragraph), plus exact files/commits.
   - Issues already fixed in earlier rounds (so they aren't re-reported).
   - Known/accepted limits (explicit user decisions).
   - Verification facts (what was tested, where, pass/fail counts).
   - Focus areas / highest risks.
   - Requested output: real bugs ranked with `file:line`, failure scenario, confidence, smallest fix; nice-to-haves; what was checked and looks good; what requires live execution.
3. **Spawn read-only reviewer:** Call `invoke_subagent` with:
   - `TypeName: "research"` (built-in read-only sandbox, no write tools, no network)
   - `Model: "pro"` (for deeper independent review)
   - `Role: "Independent Code Reviewer"`
4. **Verify every finding yourself:** Read the cited lines and surrounding framework/vendor code. Mark each finding **confirmed**, **wrong**, or **accepted-by-user**.
   - Drop wrong findings with a one-line reason.
   - Only count a "what if X is null" finding if a real call path reaches it.
   - If every finding is a nit, say the change looks solid.
5. **Fix confirmed bugs:** Make the smallest idiomatic fix and add a unit test for new logic.
6. **Re-test:** Run unit tests and verify in the real app (local first; test/staging only if asked). If a test mutates data, back up first, restore afterwards, and verify the restore.
7. **Report clearly:** One line per finding, grouped into:
   - **Act on** (confirmed bugs, fixed and tested)
   - **Consider** (real trade-off, cost unclear)
   - **Noted** (low-value valid points + accepted-by-user)
   - **Dismissed** (wrong or missing context, with reason)
   List what was *not* checked, then stop and ask before committing, pushing, or deploying (unless already authorized).

<!-- part of cheap_stack -->
