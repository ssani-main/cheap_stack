# Example profile

This is the author's own setup with names, companies, servers and paths replaced. It shows what `/cheap-setup` produces
for one real person. Use it to see the shape; build your own with `/cheap-setup`, because your history is not theirs.

**Who:** a developer on a Magento shop run together with an outside agency, plus a data-upload repo, a company website
and a dozen side projects. Works in English, writes to colleagues in German and English. Runs 2 to 4 Claude Code sessions
at once and clears context after almost every task.

**What the history showed** (12 weeks, about 5,250 prompts):

| Pattern | About | Picked |
|---|---|---|
| "update whats necessary", "take notes" | 340 | wrap |
| `/clear`, then "what did we do yesterday?" | 233 / 66 | wrap (resume) |
| "did you test?", "are you sure?", "reproduce it locally" | 215 | ship for the shop repo |
| "how long?", "still not done?" | 175 | the long-run rule in the profile |
| messages for colleagues | 50 to 185 | draft |
| "whats this commit, is it needed?" | dozens | why |
| secret-looking prompts | some | the hook, and the mask on the server helpers |

| File | What it is |
|---|---|
| [profile.md](profile.md) | The profile (`~/.claude/cheap_stack/profile.md`) |
| [ship.CLAUDE.md](ship.CLAUDE.md) | The ship routine for the shop repo (a gitignored `CLAUDE.md` there) |
| [rules.md](rules.md) | Two project rules that don't belong in the profile |
