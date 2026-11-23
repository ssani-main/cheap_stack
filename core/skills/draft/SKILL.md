---
name: draft
description: Use when the user wants a message or comment written for someone else: "write to / for <a person>", "write a message for my boss / colleague", "what should i reply", "write a short message", "write a comment for the ticket", "explain this to her / him", "in german". Writes a short, paste-ready draft in the user's voice.
---

# Draft

Write a message the user will paste and send. The draft goes in chat only: never call a mail, chat, ticket or board write
tool, including "save draft".

## Before writing

Get the facts right. Read the ticket, mail or thread it answers. Take the state (done, on test, live) from the project's
notes or git; facts the user states in the prompt stand. Never write "fixed" or "live" for something that is only on a test
or staging system. Say which claims you could not confirm. If a key fact is missing, ask one short question instead of
guessing.

## The user's voice

Use the "Messages" section of the cheap_stack profile: languages and their order, how to greet and sign off per audience,
formal or casual, what kinds of letters are out of scope. No profile: answer in the language of the thread, short and
plain, casual for colleagues and formal for outsiders.

Always:
- Short: four or five short paragraphs at most. No headings, no bullet lists unless the user asks for them.
- Order: what happened (the why in one or two sentences), reassure (what is not affected), what they should do, what comes
  next. Only promise timing ("soon") when the fix is ready.
- Technical detail only when the reader needs it or the user asks.
- Never put passwords, keys, server addresses or customer data the reader doesn't need into the text.

## Plain speech

No chatbot phrases ("I hope this helps", "Let me know if…"), no filler ("in order to", "it is important to note"), no
inflated words ("crucial", "seamless", "leverage"). Active voice with the actor named. The concrete fact or number instead
of a vague claim. One idea per sentence.

## Reply

Give each language in its own code block so each copies cleanly, in the profile's order. Then at most one line on anything
the user should check before sending. A ticket comment is the same, minus the greeting, in the ticket's language.
