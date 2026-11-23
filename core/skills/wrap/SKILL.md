---
name: wrap
description: Use when the user says "update whats necessary" (any spelling), "take notes", "so we can continue tomorrow / at home / next time", "lets stop here", or before /clear, to save the session state; and when they ask "what did we do yesterday / last time", "do you remember", "where did we leave off", "go back to where we left off", to resume it.
---

# Wrap

Save and resume work in the places the cheap_stack profile names under "Session notes". Never create a new notes file just
for wrap. No profile: use the project's existing notes (NOTES.md, project memory, a local CLAUDE.local.md), and mention once
that `/cheap-setup` can set this up. No notes place at all: say the block is not saved, and offer to start a
`CLAUDE.local.md`. Never write session state into a tracked, shared file (a committed CLAUDE.md, a README) without asking.

## Save ("update whats necessary", "take notes")

Often said mid-work. Do the steps, then carry on with whatever else the same prompt asks.

1. **Time**, only when the profile's "Time tracking" names a command for this project. Log each block not yet logged.
   Start = the time taken when this block began, never earlier than the last logged end. Skip time the user was away
   (separate blocks). Look at what is already logged first, because the tool may have no overlap check, so the same
   minutes are never logged twice. Check the tool confirmed the entry.
2. **Notes, edit-only, in the places from the profile.** Status icon ✅ done, ▶ in progress, ⏸ paused. Write the state line
   the profile asks for (for example branch + commit, pushed or not, deployed where, who was told) and point to the START
   HERE file. New note file only for a new work item. Edit in place with the Edit tool, never truncate-and-rewrite.
   Systems the profile lists as read-only get no updates: draft the text in chat for the user to post.
   Rule sections ("Hard rules", CLAUDE.md) get only lessons that will still hold in 6 months and change a future decision.
   If a script, hook or check could enforce it, propose that instead of adding text.
3. **Running things:** list background shells, local stacks, browser sessions and subagents. Stop them only when the prompt
   says shut down, kill or close everything, or done for today / going home. "Lets stop here" means stop working, not kill
   processes. Never kill a shell running a remote deploy, import or database write: list it and ask.
4. **Git:** show branch and status. Commit or push only when the same prompt asks, and then by the project's own rules.
5. **Reply** with a resume block in chat, not in a file:
   ```
   Done:    <what changed this block>
   State:   <the profile's state line, e.g. branch/commit; pushed? deployed where? who was told?>
   Running: <what is still running, or nothing>
   Next:    <first step next time>
   Notes:   <file paths updated>
   Time:    <entries logged, or "not tracked">
   ```

## Resume ("what did we do yesterday?")

1. If the profile tracks time for this project, take the start time (`date +%H:%M`) first.
2. Read the notes from the profile's places (project memory is usually already loaded), then the matching START HERE notes.
3. Check the claims that matter against git, not the notes alone: `git fetch`, then `git log --oneline --since=<date>`,
   `git status`, and for "pushed" items `git branch -r --contains <sha>`. If pushes are squashed or rebased, a missing SHA
   is not proof it wasn't pushed: compare the commit subject or the diff on the remote branch. Never re-push to "fix" it.
4. Reply: where we stopped, what is verified vs still open, the next step. Several open items: list them by number and let
   the user pick. Don't redo finished work.
