# shop repo

<!-- Example ship routine for a Magento shop worked on together with an outside agency. It lives as a gitignored
     CLAUDE.md in the repo root, so it never reaches the agency's shared repo. Built from core/templates/ship.md. -->

Local file (ignored by .gitignore). Never stage or push it.

## Ship a code change

For code changes in this repo only. Not for data uploads, PROD data fixes, read-only checks or config questions.
The hard rules in this project's memory still apply; this routine only puts them in order.

1. **Reproduce locally first** (the local sandbox: two storefronts on ports 8080/8081, developer mode; agent-browser first,
   Playwright for scripts). Can't reproduce it: say so and stop. Don't guess a fix.
2. **Fix the root cause** with the smallest change. A "might help" change is a hypothesis: revert it unless the evidence
   backs it. The cause is in one of the agency's modules: don't edit it, report it for the agency developer.
3. **Test locally as a customer and as an admin**: the flows the change touches plus one neighbouring flow. Show the
   failing-before and passing-after output. Admin scripts block save/delete routes first.
4. **Larger change** (more than one file or any checkout, login, price, licence or cron logic): run fable-review-loop, fix
   the confirmed findings, retest.
5. **Report** a verdict: VERIFIED, NOT VERIFIED or INCONCLUSIVE (inconclusive is not a pass). Say where it was tested,
   what else it touches (other modules, the agency's code, cron, other websites) and what was not tested.
6. **Stop and ask.** No commit and no push until the user says so in that message.
7. **On "push":** `git fetch`, and if origin/stage moved since you started, put the change on top of it first. Then one
   squashed commit with the subject style `TICKET-123 Area: what`, no AI trailers, never master. `git push origin`
   publishes to the agency's shared repo: say so before pushing.
8. **Report "pushed to stage <sha>, not deployed"** and stop. TEST deploy and TEST tests only when asked in that message;
   before a TEST deploy, check no deploy is running (`~/.creds/bin/test_ssh.sh "pgrep -af 'deploy|setup:|di:compile'"`).
   PROD only when asked.
9. **wrap records the state line**: pushed? on TEST? on PROD? agency developer told?
