# How it works

The inside of each piece: what it checks, in what order, and why it was built that way. For how to use it, see the
[README](../README.md).

## The profile

`~/.claude/cheap_stack/profile.md` holds everything personal: sign-off name, languages, tone per audience, where session
notes live, the time-tracking command, read-only systems, the credentials folder and the evidence sources. `/cheap-setup`
writes it. One line in `~/.claude/CLAUDE.md`, `@~/.claude/cheap_stack/profile.md`, loads it into every session, so the
skills can say "use the profile's Messages section" instead of carrying anyone's names.

Why one small file instead of settings per skill: the skills stay identical for everyone, and a profile line that is
deleted simply falls back to the skill's default. It is kept under about 40 lines because it costs context in every
session.

## wrap (skill)

**Save** does five things, in this order:
1. **Time.** Only when the profile names a time-tracking command for this project. One entry per block. The block starts
   when the work started, never before the last logged end, and skips time the user was away. It checks what is already
   logged first, because a simple tracker may have no overlap check.
2. **Notes.** Edits only the places the profile names (a project memory "Current work" line, a START HERE notes file, a
   ticket file). It never creates a new notes file: a second location drifts from the first, and two parallel sessions
   would overwrite a single fixed file. Read-only systems get no updates; wrap drafts the text in chat instead. Rule
   sections only get lessons that still hold in six months and change a future decision.
3. **Running things.** Lists shells, local stacks, browser sessions and sub-agents. Stops them only on "shut down", "kill",
   "close everything" or "done for today". "Lets stop here" means stop working, not kill processes, and it never kills a
   remote deploy, import or database write.
4. **Git.** Shows branch and status. No commit or push unless the same prompt asks.
5. **Resume block** in chat: done, state, running, next step, notes, time.

**Resume** reads the same places, then checks them against git (`git fetch` first). When pushes are squashed or rebased, a
missing SHA is compared by subject or diff, and it never re-pushes to "fix" it.

Design choice: "update whats necessary" is often said in the middle of work ("…and lets go back to the other bug"), so
save never assumes the session is over.

## ship (project routine)

**Why.** The most common correction in the author's history was some form of "did you test it?". Fixes came before the
repro, and the push rules were spread over notes the agent only sometimes opened.

**What.** Nine steps: reproduce locally, fix the root cause (code owned by others is reported, not edited), test the way a
real user would with before/after output, review larger changes, give a VERIFIED / NOT VERIFIED / INCONCLUSIVE verdict,
then **stop and ask**. On "push": fetch, commit by the repo's rules, warn who sees the push, report "pushed, not deployed".
Deploys only when asked.

**How.** It is a `CLAUDE.local.md` (or a gitignored `CLAUDE.md`) in the repo, not a skill. Claude Code always loads it
there, so nothing depends on a skill triggering, and it never reaches a shared repo. `/cheap-setup` fills
`core/templates/ship.md` for the repo, inferring what it can from git and asking the rest.

## why (skill)

Taken from [pstack](https://github.com/cursor/plugins/tree/main/pstack)'s `why`, cut down to one agent. It anchors the
question in git (`blame`, `log -S`, ticket IDs in commit messages), then searches the profile's evidence sources and records
which came back empty. Every claim is marked Direct, Supported, Inferred, Speculative or Unknown. "Because" only appears next
to a citation, the code is never evidence of its own intent, and the user's own guess is a hypothesis to check.

For "is this needed?" it also searches the config that wires code without a caller (dependency injection, events, cron,
routes, layout), and says "not needed" only with Direct or Supported evidence. It never prints env files or `SELECT *` from
settings tables, and it assumes output is not masked unless the profile says it is.

## draft (skill)

Short (four or five paragraphs), no headings, in the tone and languages the profile gives per audience, each language in
its own code block. It takes deploy state from the project's notes or git and never says "live" for something on a test
system. It only writes text: it never calls a mail, chat, ticket or board write tool, not even "save draft".

## fable-review-loop (skill) and fable-reviewer (agent)

The reviewer is a read-only sub-agent (Read, Grep, Glob only) on the Fable model at medium effort. Change `model:` in
`~/.claude/agents/fable-reviewer.md` to use another one. The skill makes the caller check every finding against the code
before fixing it. A "what if X is null" finding only counts with a traced call path. Findings are sorted into Act on,
Consider, Noted and Dismissed, and a confirmed bug is never demoted to keep the list short. Ideas taken from pstack's
`interrogate`.

## block-secrets-in-prompt (hook)

A `UserPromptSubmit` hook. Claude Code runs it before a prompt goes to the model. If the prompt looks like it holds a
secret, the hook returns `{"decision":"block"}` and the prompt is not sent. The message names the kind of match but never
the value, and points to the credentials folder from the profile.

What counts as a secret:
- A key word (`password`, `pass`, `pw`, `kennwort`, `token`, `api key`, `secret`, `consumer_key`, `ikey`/`skey`, also inside
  names like `DB_PASS`, `access_token`, `secret_key`), then `:`, `=`, `=>`, `is` or `ist`, then a value of 6+ characters with
  a letter and a digit or symbol. The last part keeps "the password is in the folder" or "pass: true" from blocking.
- `scheme://user:password@host`, `-----BEGIN … PRIVATE KEY-----`, and known token prefixes (`ghp_`, `sk-`, `AKIA`, …).

`#nosecretcheck` in the prompt skips the check. Any error in the hook lets the prompt through (fail open), so a bug can
never lock anyone out.

Tested on a real history of about 5,000 prompts: with the secrets redacted it blocks none of them, so normal talk about
passwords and keys passes. A 200,000-character paste takes 5 ms.

## mask_secrets.sh (output filter)

The hook only sees what is typed. Leaks also come from tool output: a server's `crontab -l`, env files, settings tables.
Piping a server helper's stdout through this filter masks: `key=value` style secrets (`--key=`, `'password' => '…'`,
`?token=`), JSON rows whose `path` names a key/secret/pass/pwd/token setting, every value of a settings query whose SQL names
such a path, `user:pass@` URLs, `mysql -p…`, `curl -u user:pass`, Bearer tokens and private-key blocks. It leaves
`url_key`, `meta_keyword`, `Key_name`, URLs, git SHAs and normal log lines alone.

It is Perl (Git for Windows, macOS and Linux ship it) because sed cannot tell `secret_key` from `url_key`, and it runs
unbuffered so long commands still stream. The wrapper keeps the exit code with `set -o pipefail` and offers a raw escape for
binary output. Masking is cosmetic, not a security boundary: an agent that reads the files directly still sees everything.
It stops accidental prints, which is how most leaks into a chat happen.

## cheap-setup (skill) and mine_history.js

`mine_history.js` reads `~/.claude/history.jsonl` (the prompts you typed, nothing else) for the last N days. It prints
prompts per project, rough counts for a fixed set of patterns, and the short prompts you repeat most, which are your
rituals. It reuses the hook's detector: a prompt that looks like it holds a secret is counted, never printed or written.
It runs locally; only what the setup session then reads goes to the model, as in any session.

`/cheap-setup` shows that summary, recommends the pieces whose signal is strong, asks a few questions (offering what it
inferred), writes the profile, adds the import line to `~/.claude/CLAUDE.md` after a backup, and can write a ship routine
for the current repo and wrap server helpers in the mask. It saves the counts as `baseline.md`, so "check the stack" weeks
later can compare and point at pieces that never fire.

## install.sh

Copies `core/` into `~/.claude` (skills, agent, hook) and `~/.claude/cheap_stack/` (tools, templates). Unchanged files are
skipped; a changed file is backed up as `<file>.bak-<timestamp>` before it is replaced. It registers the hook as the first
`UserPromptSubmit` entry in `settings.json` with this machine's Node and home paths, after a backup, only if it is not there
yet. It ends with the self-tests. Running it twice changes nothing. `CHEAP_STACK_HOME=<dir>` installs somewhere else, which
is how it was tested.
