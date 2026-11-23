# Example project rules

Rules that belong to one project, not to the profile. Each sits at the top of that project's CLAUDE.md or in its memory.
From the author's setup, anonymized.

## Data-upload repo: CLAUDE.md

```markdown
## Before any shop or master-list write, or master-list comparison

Open and follow these two memory files first, every time: `default-value-stamping-trap.md` (required checks before every
write) and `ml-audit-scope-traps.md` (traps that fake master-list-vs-shop numbers). The master list is the source of truth;
never write to it unless the user says so.
```

Why: about 45 prompts were "follow the master list 100%" or "did you verify it against the master list?".

## Shop repo memory: the BI query notes

```markdown
**Check before handing over a BI query:** the parts must add up to the total (e.g. total = available + used + expired, or
say why not); the date range matches the data's real min/max; the sort order matches the agreed convention and 30/90/365
blocks come in that order; old and new shop are combined when the chart needs both; spot-check 3 rows. The PostgreSQL
variant cannot be run here: check its MySQL twin and say that the BI version was not run. Suggest a chart title.
```

Why: wrong totals, wrong month order and missing old-shop data were found only after pasting into the BI tool.
