# cheap_stack profile

<!-- Written by /cheap-setup, loaded in every session through "@~/.claude/cheap_stack/profile.md" in ~/.claude/CLAUDE.md.
     Keep it short: every line costs context in every session. Delete a line to fall back to the skill's default. -->

## Me
- Name for sign-offs: {{NAME}}
- Answer me in: {{REPLY_LANGUAGE}}
- When the answer is technical, give the simple version first, then the technical one.
- Anything that runs longer than about a minute reports progress by itself: done/total, rate and an ETA where it can be
  counted, otherwise the current phase and elapsed time.

## Messages (draft skill)
- Languages: {{DRAFT_LANGUAGES}}
- Colleagues: {{COLLEAGUE_TONE}}
- Customers and outsiders: {{EXTERNAL_TONE}}
- Out of scope: {{DRAFT_OUT_OF_SCOPE}}

## Session notes (wrap skill)
- Where state lives: {{NOTES_PLACES}}
- State line to keep: {{STATE_LINE}}

## Time tracking (wrap skill)
- {{TIME_TRACKING}}

## Read-only systems
- {{READ_ONLY}}

## Credentials
- Credentials folder: {{CREDENTIALS_FOLDER}}
- Never print, echo or paste a secret. Scripts read the files themselves.

## Evidence sources (why skill)
- {{EVIDENCE_SOURCES}}
