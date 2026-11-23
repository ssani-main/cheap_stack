# cheap_stack

A small Claude Code stack that fits itself to you. It reads your own prompt history, finds what you keep repeating ("did you
test it?", "what did we do yesterday?", "how long is it gonna be?"), and installs only the pieces that remove those repeats.

It has five skills (one of them sets the stack up for you), a routine for code changes, a hook that stops pasted secrets, a filter that hides secrets in server
output, and one profile file with everything personal.

"Cheap" is the point. [pstack](https://github.com/cursor/plugins/tree/main/pstack), which inspired it, is about 4,000 lines
and runs 10 to 15 sub-agents for one feature. cheap_stack is about 630 lines including the installer and the tests. The only sub-agent it starts on its own is one
reviewer for larger changes.

- [Quick start](#quick-start)
- [What's in it](#whats-in-it)
- [What to type](#what-to-type): the cheat sheet
- [A day with cheap_stack](#a-day-with-cheap_stack): one full example
- [Guide and examples](#guide-and-examples): each piece, with what you type and what you get back
- [Setup and your profile](#setup-and-your-profile), [Privacy](#privacy)
- [When something goes wrong](#when-something-goes-wrong), [Update and uninstall](#update-and-uninstall), [Test](#test)
- [docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md) (the inside of each piece), [docs/EVIDENCE.md](docs/EVIDENCE.md) (what
  it was built from), [profiles/example/](profiles/example/) (one real profile, anonymized)

## Quick start

You need Claude Code, Node.js and bash (on Windows: Git Bash, which also brings the Perl the output filter needs).

```bash
git clone https://github.com/ssani-main/cheap_stack.git
cd cheap_stack
bash install.sh
```

Then start a **new** Claude Code session (skills and hooks load at session start) and type:

```
/cheap-setup
```

It reads your last 60 days of prompts, shows what you repeat, recommends pieces, asks a few questions and writes your
profile. That's it. From then on you talk the way you always do.

## What's in it

| Piece | Kind | Removes the repeat |
|---|---|---|
| **wrap** | skill | "update whats necessary", "take notes", and "what did we do yesterday?" after `/clear` |
| **ship** | routine in a repo's `CLAUDE.local.md` | "did you test it?", "are you sure?", "don't push yet" |
| **why** | skill | "whats this commit, is it really needed?", answers that sound sure without evidence |
| **draft** | skill | "write a short message for my colleague", "make it shorter, write like I do" |
| **fable-review-loop** | skill + read-only reviewer agent | "review this before we ship" |
| **block-secrets-in-prompt** | hook | passwords and keys pasted into chat |
| **mask_secrets.sh** | output filter | keys printed by server output (crontab, env files, settings tables) |
| **profile** | one file | your name, languages, tone, notes places, time tracker, read-only systems |
| **/cheap-setup** | skill + `mine_history.js` | fitting all of the above to you, and measuring it later |

## What to type

You don't call most of it by name. Talk the way you always do and the matching piece starts by itself. You can also call a
skill directly: `/wrap`, `/why`, `/draft`, `/fable-review-loop`, `/cheap-setup`.

| You say | What starts | What you get |
|---|---|---|
| "update whats necessary", "take notes", "lets stop here" | wrap (save) | Notes updated, time logged (if you track it), a resume block |
| "what did we do yesterday?", "where did we leave off?" | wrap (resume) | Where you stopped, checked against git, and the next step |
| "fix this bug" / "TICKET-123" in a repo with ship | ship | Repro, fix, test, verdict, then it **asks** before pushing |
| "push it" (after a ship verdict) | ship | Commit by the repo's rules, push, "pushed, not deployed" |
| "whats this commit?", "is this really needed?" | why | An answer with evidence, marked by how sure it is |
| "write a message for Anna", "what should I reply?" | draft | A paste-ready message in your voice |
| "review this", "fable review it" | fable-review-loop | Findings checked against the code, fixed, sorted |
| a prompt with a password in it | the hook | Blocked before it is sent |
| "check the stack" (after a few weeks) | cheap-setup | Your counts now vs your baseline |

## A day with cheap_stack

This uses the [example profile](profiles/example/profile.md): Alex, a developer on a Magento shop run together with an
outside agency. The outputs follow real test runs in shape and length; names, tickets, code and numbers are made up.

**Morning, new session in the shop repo.**

> what did we do yesterday?

wrap reads the "Current work" lines in the project memory and the START HERE notes, runs `git fetch` and checks them
against git:

```
Friday: website filter for the supplier. stage 5e6f7a8b pushed and on TEST, not on PROD, agency developer not told.
        The agency pushed 2 commits to stage since then; your branch is 2 behind.
Open:   1. tell the agency developer   2. TEST scenario C not run yet
Next:   run scenario C on TEST, then the message. Which one first?
```

**A bug comes in.**

> TICKET-530 customers on the US site get a 500 when they open their address book. fix it

ship takes over. It reproduces the 500 locally first, finds the root cause, makes the smallest fix and tests as a customer
and as an admin. The change touches login logic, so it runs a Fable review. Then it stops:

```
VERIFIED locally: address book opens for US customers (500 before, 200 after, output below).
Touches: one module; no agency code changed. Not tested: TEST, PROD.
Fable review: 1 finding, fixed and retested.
Ready to commit. Push to stage? (origin is the agency's shared repo, so they will see it)
```

> yes push it

```
Pushed to stage a1b2c3d4 (1 squashed commit "TICKET-530 Address book: ..."), not deployed.
```

Nothing goes to TEST or PROD unless you ask for that too.

**Someone asks why.**

> whats this commit 9c0d1e2f . is it really necessary?

```
Keep it. 9c0d1e2f is yours (two months ago). It stops a crash in the shipping step when a saved address has no region.
[Direct] Cause: a third-party checkout module passes an object where a string is expected (Checkout/Plugin.php:125).
         Source: the commit body and your project note on the crash.
[Direct] Some live addresses still have no region (read-only count), so they would crash without it.
Unknown: whether the module's vendor plans a fix.
Verdict: needed.
```

**A colleague needs an update.**

> write a short message for anna: the address problem is fixed but only on TEST for now. she can ignore the error mails

```
Hi Anna,

das Adressproblem im Checkout ist behoben, aber vorerst nur auf TEST. Bis es live ist, kannst du die Fehlermails einfach
ignorieren. Ich sag Bescheid, sobald es auf PROD ist.

Grüße, Alex
```

```
Hi Anna,

the address problem in checkout is fixed, but only on TEST for now. You can ignore the error mails until it's live.
I'll let you know once it's on PROD.

Regards, Alex
```

It only writes the text. It never sends it or saves it as a mail draft.

**You paste a login by habit.**

> login as test admin, user admin pass : <a real password>

```
UserPromptSubmit operation blocked by hook:
Blocked: this prompt looks like it contains a secret ("pass" followed by a value). It was not sent. Put the value into
your credentials folder ~/.creds and point me at the file instead.
```

The password never reaches the model or the transcript.

**End of the day.**

> update whats necessary, done for today

```
Done:    TICKET-530 address book fix, pushed to stage
State:   stage a1b2c3d4 pushed; not on TEST; not on PROD; agency developer not told
Running: nothing (local stack stopped)
Next:    TEST deploy + scenario test when you say so; message to the agency developer
Notes:   memory/MEMORY.md (Current work), memory/project_ticket530.md
Time:    08:40-10:15, 10:30-12:05 logged
```

Tomorrow, "what did we do yesterday?" picks it up from there.

## Guide and examples

### wrap: save and resume a session

**Use it** at the end of a work block or a day, before `/clear`, and at the start of the next session.

**Save.** Say it the way you always do:
- "update whats necessary" (typos are fine: it fired on "update whtas necessary" in a test)
- "take notes so we can continue tomorrow"
- "update whats necessary, and lets go back to the other bug" (it saves, then carries on)

What it does:
1. **Time.** Logs time, if your profile names a time-tracking command for this project. One entry per block, without
   double-counting.
2. **Notes.** Updates only the places your profile names: a project memory line, a START HERE file, a ticket file.
3. **Running things.** Lists them, and stops them only when you say "shut down", "kill", "close everything" or "done for
   today". It never stops a running deploy, import or database write.
4. **Git.** Shows the branch and status. It doesn't commit or push unless the same prompt asks.
5. **Resume block.** Prints it in chat.

**Resume.** "what did we do yesterday?", "where did we leave off?". It reads the notes and checks them against git, so a note
that says "pushed" is confirmed, not trusted. With several open items it lists them by number and lets you pick.

**Don't expect** a new notes file. wrap never makes one, on purpose: it keeps your existing notes the single source.

### ship: a code change in one repo

**Use it** by asking for a fix or a ticket in a repo where `/cheap-setup` wrote the routine. It is loaded with the project,
so nothing has to trigger.

**The nine steps:**
1. Reproduce it locally.
2. Fix the root cause. Code owned by someone else is reported, not edited.
3. Test the way a real user would.
4. Run a review if the change is larger.
5. Give a verdict.
6. **Ask.**
7. On "push": commit by the repo's rules, and warn who will see it.
8. Report "pushed, not deployed".
9. wrap records the state.

| You say | It does |
|---|---|
| "TICKET-512 cart shows the wrong price, fix it" | All nine steps, and stops at "push?" |
| "i fixed it and tested locally, whats next?" | Review if needed, then the verdict, then asks |
| "push it" | Fetch, commit, push, "pushed, not deployed" |
| "deploy to TEST and test it there" | Checks no deploy is running, deploys, tests, reports |
| "put it on PROD" | Only on that exact ask |

**Verdicts:** VERIFIED (proven where it says), NOT VERIFIED (tested and it fails), INCONCLUSIVE (couldn't prove it; this is
not a pass).

**Where it lives:** `CLAUDE.local.md` in the repo root, gitignored, so it never reaches a shared repo. See
[profiles/example/ship.CLAUDE.md](profiles/example/ship.CLAUDE.md) for a filled one.

### why: where something came from

**Use it** for history, not debugging:
- "whats this commit 9c0d1e2f?"
- "is this module really needed?"
- "who changed the handling fee and why?"

| Tag | Means |
|---|---|
| Direct | Someone wrote the reason down (commit, ticket, mail); cited |
| Supported | Several clues point the same way; each cited |
| Inferred / Likely | A reasonable reading, nothing states it |
| Speculative | Possible, thin evidence |
| Unknown | Searched, not found; it says where it looked |

For "is this needed?" you get needed, not needed or unclear. "Not needed" only comes with strong evidence, because code wired
through config (plugins, events, crons) has no caller to find. It searches the sources in your profile's "Evidence sources",
read only.

**Not for** "why does the test fail" or "why does this number differ": that is debugging, and the normal flow handles it.

### draft: messages for other people

**Use it** for mails, chat replies and ticket comments:
- "write a short message for anna that ..."
- "what should i reply?" (paste the mail)
- "write a comment for TICKET-530"
- "explain this to my boss in german"

**What you get:**
- Short: four or five paragraphs, no headings.
- Tone, greeting, sign-off and languages from your profile.
- Each language in its own block, ready to copy.

It checks the facts against your notes and git, never says "live" for something on TEST, and says what it couldn't confirm.
It never sends anything.

**Variations:** "only german", "a bit more technical", "shorter", "more formal".

### fable-review-loop: a review before you call it done

**Use it** with "review this", "fable review it", "audit what we did", or let ship start it for larger changes. A read-only
reviewer on the Fable model reads the change and reports. Your session then checks every finding against the code, fixes
the confirmed ones, tests, and reports them as Act on, Consider, Noted or Dismissed. To use a different model, change
`model:` in `~/.claude/agents/fable-reviewer.md`.

### The secret blocker (hook)

Nothing to do. A prompt that looks like it contains a password, key or token is blocked before it is sent.

- **Instead:** put the value in a file in your credentials folder and say "use the login in test_accounts.txt".
- **False alarm:** add `#nosecretcheck` anywhere in the prompt.
- **What passes:** talking about passwords is fine ("the password is in the folder", "rotate the API key",
  `password: ********`).

### The output mask

For scripts that print server output. `/cheap-setup` can pipe them through `~/.claude/cheap_stack/tools/mask_secrets.sh`:

```
$ ./prod_ssh.sh "crontab -l"
*/5 * * * * php scanner --key=***masked*** --quiet
$ echo "SELECT path, value FROM core_config_data WHERE path LIKE 'twofactorauth%'" | ./run_sql.sh prod
{"path":"twofactorauth\/duo\/secret_key","value":"***masked***"}
```

Normal output (URLs, SKUs, `url_key`, git SHAs, log lines) is untouched. For binary output or a harmless column it hides by
mistake, the wrapper's raw switch skips it for one command.

## Setup and your profile

`/cheap-setup` runs in seven steps:
1. Check the install.
2. Read your history with `mine_history.js` and show the summary: projects, pattern counts, your most repeated short
   prompts. A deeper read by sub-agents is offered, and only runs on a yes.
3. Recommend the pieces whose signal is strong. You pick.
4. Ask a few questions, offering what it inferred, and write `~/.claude/cheap_stack/profile.md`. Then it adds one line to
   `~/.claude/CLAUDE.md` to load it: `@~/.claude/cheap_stack/profile.md`.
5. Optional: write a ship routine for the current repo.
6. Optional: pipe your server helpers through the mask.
7. Run the self-tests and save your counts as `~/.claude/cheap_stack/baseline.md`.

The profile is plain Markdown, about 40 lines. Edit it by hand any time. A deleted line falls back to the skill's default.
To see what one looks like, read [the example](profiles/example/profile.md). Run `/cheap-setup` again to update it, or say
"check the stack" after a few weeks to compare your counts with the baseline.

You can run the history tool on its own:

```bash
node ~/.claude/cheap_stack/tools/mine_history.js --days 90
```

## Privacy

- `mine_history.js` reads only `~/.claude/history.jsonl`, the prompts you typed. It runs locally.
- Prompts that look like they hold a secret are counted, never printed or written. The check is keyword-based: a bare
  password with no "pass:" or "token=" in front of it is not caught.
- What the setup session then reads (the summary, and the full prompts only if you say yes to a deep read) goes to the
  model like anything else in a Claude Code session. The deep-read files go to the private `~/.claude/cheap_stack/tmp/`
  and are deleted afterwards.
- Your profile stays in `~/.claude/cheap_stack/`. Nothing is uploaded or shared by the stack itself.

## When something goes wrong

| Problem | Fix |
|---|---|
| Nothing triggers | Start a new session; skills and hooks load at session start |
| wrap didn't start | Say "use wrap" or type `/wrap` |
| Resume says "not pushed" but you did push | Squashed pushes change the SHA; say "check the remote branch for <subject>" |
| ship pushed without asking | It shouldn't. Check `CLAUDE.local.md` still exists in the repo |
| why fired on a debugging question | Say "this is debugging, not history" |
| draft is too long or too formal | "shorter", "write as i usually write"; or fix the profile's Messages section |
| The hook blocked a harmless prompt | Add `#nosecretcheck` |
| The mask hid a column you need | Run that one command with the wrapper's raw switch |
| The agent doesn't know your name or tone | Check `~/.claude/CLAUDE.md` has the `@~/.claude/cheap_stack/profile.md` line |

## Update and uninstall

**Update:** `git pull && bash install.sh`. Your profile is never overwritten. A skill you edited by hand is backed up as
`SKILL.md.bak-<timestamp>` before the new one is copied, so you can merge your change back. Pieces you turned off in setup
(moved to `~/.claude/cheap_stack/disabled/`) stay off.

**Already have a skill called `wrap`, `why` or `draft`** (pstack has a `why`, for example)? The installer leaves any file
that isn't from cheap_stack alone and prints `SKIP`. Move yours away, or run `bash install.sh --force` to replace it
(it is backed up first).

**Uninstall:**
1. If setup piped any of your scripts through the mask, restore them from their backups first. Otherwise they break
   when the mask is gone.
2. Delete `~/.claude/skills/{wrap,why,draft,fable-review-loop,cheap-setup}`, `~/.claude/agents/fable-reviewer.md`,
   `~/.claude/hooks/block-secrets-in-prompt.js` and `~/.claude/cheap_stack/`.
3. Remove the hook entry from `~/.claude/settings.json` (a backup from install is next to it).
4. Remove the `@~/.claude/cheap_stack/profile.md` line from `~/.claude/CLAUDE.md`, and any section setup added to a
   `CLAUDE.local.md`.
5. Delete the `*.bak-<timestamp>` files the installer left, once you don't need them.

## Test

```bash
node core/hooks/block-secrets-in-prompt.js --selftest   # 13 blocked, 14 allowed
node core/tools/mine_history.js --selftest
bash core/tools/mask_secrets.sh --selftest              # 24 cases
CHEAP_STACK_HOME=/tmp/cs-test/.claude bash install.sh   # a dry install somewhere harmless; run it twice
```

End to end, the hook: `claude -p "test login pass : FakeZz9Test42"` must print "operation blocked by hook", and the value
must not appear in `~/.claude/history.jsonl`.

## Repo layout

```
install.sh              copies core/ into ~/.claude, registers the hook, runs the self-tests
core/skills/            wrap, why, draft, fable-review-loop, cheap-setup
core/agents/            fable-reviewer (read-only)
core/hooks/             block-secrets-in-prompt.js
core/tools/             mine_history.js, mask_secrets.sh
core/templates/         profile.md, ship.md (filled by /cheap-setup)
profiles/example/       one real profile, anonymized: profile, ship routine, project rules
docs/                   HOW-IT-WORKS.md, EVIDENCE.md
```

## Known gaps

- Other tools that receive every hook payload (some desktop apps register their own hooks) may still see a prompt the
  blocker stops. Check what else is registered under `UserPromptSubmit`.
- A multi-line secret in an env file only has its first line masked.
- The mask covers stdout only. For stderr, put `2>&1` inside the remote command.
- The skills were tested on one person's setup on Windows. macOS and Linux should work (bash, Node, Perl) but are untested.

## Credits

Built after reading [pstack](https://github.com/cursor/plugins/tree/main/pstack) by poteto in full.
[docs/EVIDENCE.md](docs/EVIDENCE.md) lists what was taken, reshaped or left, and why.
