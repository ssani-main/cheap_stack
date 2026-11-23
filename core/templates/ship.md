## Ship a code change

<!-- cheap_stack ship routine. Lives in CLAUDE.local.md (or a gitignored CLAUDE.md) so it never reaches the shared repo.
     /cheap-setup fills the {{...}} parts for this repo. -->

For code changes in this repo only. Not for data fixes, read-only checks or config questions.

1. **Reproduce it locally first** ({{LOCAL_ENV}}). Can't reproduce it: say so and stop. Don't guess a fix.
2. **Fix the root cause** with the smallest change. A "might help" change is a hypothesis: revert it unless the evidence
   backs it. {{DO_NOT_TOUCH}}
3. **Test locally** the way a real user would: {{TEST_AS}}. Cover the flows the change touches plus one neighbouring flow.
   Show the failing-before and passing-after output.
4. **Larger change** (more than one file, or any {{RISKY_AREAS}} logic): run fable-review-loop, fix the confirmed findings,
   retest.
5. **Report** a verdict: VERIFIED, NOT VERIFIED or INCONCLUSIVE (inconclusive is not a pass). Say where it was tested,
   what else it touches and what was not tested.
6. **Stop and ask.** No commit and no push until the user says so in that message.
7. **On "push":** `git fetch`, and if {{PUSH_TARGET}} moved since you started, put the change on top of it first. Then:
   {{COMMIT_RULES}}. {{PUSH_WARNING}}
8. **Report "pushed to {{PUSH_TARGET}} <sha>, not deployed"** and stop. Deploys only when asked in that message:
   {{DEPLOY_LADDER}}.
9. **wrap records the state line.**
