// UserPromptSubmit hook: block prompts that look like they contain a password, key or token, so the secret never
// reaches the model. Never prints the matched value. Escape hatch: put #nosecretcheck anywhere in the prompt.
// Self-test: node block-secrets-in-prompt.js --selftest
const PLACEHOLDER = /^(\*+|x{3,}|\.{3,}|<[^>]*>?|\[[^\]]*\]?|\{[^}]*\}?|redacted|changeme|example\S*)$/i;

function findSecret(text) {
  // keyword followed by ":" "=" "is" "ist" and a value that has a letter and a digit/symbol (real secrets, not words)
  // (?<![a-z0-9]) instead of \b so DB_PASS / access_token / consumer_secret match; optional _suffix and quote for JSON/env.php
  const kw = /(?<![a-z0-9])(pass(?:word|wort)?|passwd|pwd|pw|kennwort|token|api[ _-]?key|secret|client[ _-]?secret|app[ _-]?password|consumer[ _-]?key|[is]key)(?:_\w+)?["']?\s*(?:=>|:|=|\bis\b|\bist\b)\s*["']?(?<v>[^\s"',;]{6,})/gi;
  for (const m of text.matchAll(kw)) {
    const v = m.groups.v;
    if (!PLACEHOLDER.test(v) && /[A-Za-z]/.test(v) && /[\d\W_]/.test(v)) return `"${m[1]}" followed by a value`;
  }
  if (/\b[a-z][a-z0-9+.-]*:\/\/[^\s\/:@]*:[^\s@\/]{4,}@/i.test(text)) return 'a user:password@host URL';
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) return 'a private key';
  if (/\b(ghp_|gho_|github_pat_|glpat-|sk-ant-|sk-|xox[abpr]-|AKIA|AIza)[A-Za-z0-9_-]{16,}/.test(text)) return 'an API token';
  return null;
}

if (require.main !== module) { module.exports = { findSecret }; return; }

if (process.argv[2] === '--selftest') {
  const assert = require('assert');
  const hits = ['ssh : web-user@1.2.3.4 , pass : Qw7fakeTestOnly9', 'password=Hunter2!x', 'mein Kennwort ist Ab12cd34',
    'mysql://root:s3cr3tpw@db:3306', '-----BEGIN OPENSSH PRIVATE KEY-----', 'token: ghp_abcdefghijklmnopqrstuvwx12',
    '"password": "Abc123xyz"', "'password' => 'Abc123xyz'", 'consumer_secret=Ab12cdEf34', 'access_token: Ab12cdEf34',
    'DB_PASS=Ab12cdEf34', 'secret_key: Ab12cdEf34', 'skey=Ab12cdEf34'];
  const misses = ['the password is in the folder', 'password: ********', 'pass: true', 'pw changed yesterday',
    'token: [REDACTED]', 'api key: <your key>', 'my password is changed', 'how do i rotate the password?',
    'what is the api key for?', 'see https://example.com/a:b@c? no', 'pass the test then push to stage',
    'url_key: some-product-123', 'whiskey: 1234567', 'SELECT password_hash FROM customer_entity LIMIT 5'];
  for (const h of hits) assert(findSecret(h), 'should block: ' + h.slice(0, 20));
  for (const m of misses) assert(!findSecret(m), 'should pass: ' + m);
  console.log(`selftest ok (${hits.length} blocked, ${misses.length} passed)`);
  return;
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => raw += d).on('end', () => {
  try {
    const prompt = String(JSON.parse(raw).prompt || '');
    if (prompt.includes('#nosecretcheck')) return;
    const what = findSecret(prompt);
    if (!what) return;
    let folder = 'a local file';
    try {
      const profile = require('fs').readFileSync(require('path').join(require('os').homedir(), '.claude', 'cheap_stack', 'profile.md'), 'utf8');
      const m = profile.match(/^- Credentials folder: *([^\r\n({]+?) *(\(|$)/m);
      if (m) folder = `your credentials folder ${m[1].trim()}`;
    } catch { /* no profile: generic hint */ }
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: `Blocked: this prompt looks like it contains a secret (${what}). It was not sent. ` +
        `Put the value into ${folder} and point me at the file instead. ` +
        'If this is a false alarm, add #nosecretcheck to the prompt.',
    }));
  } catch { /* fail open */ }
});
