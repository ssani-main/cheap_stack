---
name: draft
description: >-
  Use when the user wants a message, email, or ticket comment written for
  someone else: "write to / for <person>", "write a message for my boss /
  colleague", "what should i reply", "write a short message", "write a comment
  for the ticket", "explain this to her / him", "in german". Writes a short,
  paste-ready draft in the user's voice without sending anything.
---

# Draft (Antigravity Edition)

Write a message for the user to copy and send. Output in chat only — never call mail, chat, ticket, or board write tools (including "save draft").

## 1. Verify Facts First
- Read the ticket, mail, or thread being answered and check actual state (local, test, live) in git or project notes.
- Facts stated by the user in the prompt stand.
- Never call something "fixed" or "live" if it is only on a test or staging environment.
- Note any claim you couldn't confirm; if a key fact is missing, ask one short question instead of guessing.

## 2. Voice & Rules
Use the messaging preferences in your `~/.gemini/GEMINI.md` profile (languages and order, greetings/sign-offs, casual vs. formal audiences). If not configured, answer in the thread's language — casual for colleagues, formal for external recipients.

Always:
- **Length & structure:** At most 4–5 short paragraphs. No headings and no bullet lists unless asked.
- **Flow:** What happened (1–2 sentences) → reassure what is unaffected → what they should do → what happens next. Only promise timing when a fix is ready.
- **Technical detail:** Only when the reader needs it or the user asks.
- **Security:** Never include passwords, keys, internal server addresses, or unnecessary customer data.

## 3. Plain Speech
- No chatbot fluff ("I hope this helps", "Let me know if you have any questions", "in order to", "it is important to note").
- No buzzwords ("crucial", "seamless", "leverage").
- Active voice, concrete facts/numbers, one idea per sentence.

## 4. Output
- Put each language in its own fenced code block for easy copying.
- Follow with at most one short line listing anything the user should double-check before sending. Ticket comments omit the greeting and use the ticket's language.

<!-- part of cheap_stack -->
