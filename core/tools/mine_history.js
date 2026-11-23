// Part of cheap_stack. Counts what you keep asking Claude Code, from ~/.claude/history.jsonl, so /cheap-setup can fit the stack to you.
// Prompts that look like they hold a secret are never printed or written (reuses the secret hook's detector).
// The detector is keyword-based: a bare password with no "pass:" / "token=" in front of it is not caught.
// Usage: node mine_history.js [--days 60] [--out [dir]] [--history <path>]   |   node mine_history.js --selftest
//   --out with no dir writes to ~/.claude/cheap_stack/tmp (private folder; delete it after reading)
const fs = require('fs'), path = require('path'), os = require('os');
const hookFile = [path.join(__dirname, '..', '..', 'hooks'), path.join(__dirname, '..', 'hooks'), path.join(os.homedir(), '.claude', 'hooks')]
  .map(d => path.join(d, 'block-secrets-in-prompt.js')).find(f => fs.existsSync(f));
if (!hookFile) { console.log('block-secrets-in-prompt.js not found. Run install.sh from the cheap_stack repo first.'); process.exit(1); }
const { findSecret } = require(hookFile);

const PATTERNS = {
  'save the session ("update whats necessary", "take notes")': /update (whats|what's|what is|whtas|wats) (necessary|necessray|needed)|take notes?|continue (tomorrow|later|next time)|lets stop here/i,
  'resume ("what did we do yesterday")': /what (did|have) we do(ne)?|where (did )?we (leave|left) off|do you remember|last time we/i,
  'verification asks ("did you test", "are you sure")': /did you (test|verify|check|reproduce)|have you (test|verif|check|reproduc)|are you sure|double.?check|100 ?%|prove (it|that)/i,
  'status pings ("how long", "is it done")': /how long|still (not done|running|working)|is it (done|finished)|what.?s the status|\beta\b/i,
  'drafts for other people': /write (a |an )?(short |quick )?(message|mail|email|reply|comment|answer)|what (should|can) i (reply|write|say|answer)|reply to \w+/i,
  'explain / simplify': /explain|i don.?t (understand|get it)|simpl(e|ify|er)|too (long|many words|technical)/i,
  'language corrections ("english please")': /(in )?english please|answer in english|(speak|write) english/i,
  'why questions': /\bwhy (is|was|does|did|do|are)\b|what.?s this commit|is (it|this) (really )?(needed|necessary)/i,
  'commit / push': /\bcommit\b|\bpush\b/i,
  'parallel / other sessions': /parallel|other (claude |agent )?session|spawn/i,
};

const norm = p => p.replace(/\[Pasted text #\d+[^\]]*\]/g, ' ').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const safe = p => findSecret(p) ? '[prompt withheld: it looked like it held a secret]' : p.replace(/\s+/g, ' ').trim();

function mine(rows) {
  const counts = Object.fromEntries(Object.keys(PATTERNS).map(k => [k, 0]));
  const projects = {}, short = {};
  let secrets = 0, clears = 0;
  for (const r of rows) {
    const p = r.display;
    if (/^\/clear\b/.test(p)) clears++;
    if (findSecret(p)) secrets++;
    for (const [k, re] of Object.entries(PATTERNS)) if (re.test(p)) counts[k]++;
    const proj = path.basename(String(r.project || '?').replace(/\\/g, '/'));
    projects[proj] = (projects[proj] || 0) + 1;
    const n = norm(p);
    if (n && !p.startsWith('/') && n.split(' ').length <= 8 && !findSecret(p)) short[n] = (short[n] || 0) + 1;
  }
  return { counts, projects, short, secrets, clears };
}

if (process.argv[2] === '--selftest') {
  const assert = require('assert');
  assert.strictEqual(norm('Update whats necessary! [Pasted text #3 +12 lines]'), 'update whats necessary');
  assert(safe('login pass : Qw7fakeTestOnly9').startsWith('[prompt withheld'));
  const m = mine([{ display: 'update whtas necessary', project: 'C:\\w\\shop' }, { display: 'did you test it?', project: '/w/shop' },
    { display: 'pass : Qw7fakeTestOnly9', project: 'x' }, { display: '/clear', project: 'x' }]);
  assert.strictEqual(m.counts['save the session ("update whats necessary", "take notes")'], 1);
  assert.strictEqual(m.counts['verification asks ("did you test", "are you sure")'], 1);
  assert.strictEqual(m.secrets, 1); assert.strictEqual(m.clears, 1); assert.strictEqual(m.projects.shop, 2);
  console.log('selftest ok'); process.exit(0);
}

const arg = (name, def) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : def; };
const has = name => process.argv.includes(name);
const days = Number(arg('--days', 60));
const file = arg('--history', path.join(os.homedir(), '.claude', 'history.jsonl'));
const since = Date.now() - days * 864e5;
if (!fs.existsSync(file)) { console.log(`No prompt history at ${file} yet. Use Claude Code for a while, then run this again.`); process.exit(0); }
const rows = [];
for (const l of fs.readFileSync(file, 'utf8').split('\n')) {
  let r; try { r = JSON.parse(l); } catch { continue; }
  if (!r || typeof r !== 'object') continue;
  if ((r.timestamp || 0) >= since && String(r.display || '').trim()) rows.push(r);
}
if (!rows.length) { console.log(`No prompts in the last ${days} days in ${file}.`); process.exit(0); }
const m = mine(rows);
const day = t => new Date(t).toISOString().slice(0, 10);
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
console.log(`# Prompt history: ${rows.length} prompts, ${day(rows[0].timestamp)} to ${day(rows.at(-1).timestamp)}\n`);
console.log('## Projects'); for (const [k, v] of top(m.projects, 10)) console.log(`${String(v).padStart(6)}  ${k}`);
console.log('\n## Patterns (rough keyword counts)');
for (const [k, v] of Object.entries(m.counts).sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(6)}  ${k}`);
console.log(`${String(m.clears).padStart(6)}  /clear`);
console.log(`${String(m.secrets).padStart(6)}  prompts that looked like they held a secret (not shown)`);
console.log('\n## Short prompts you repeat (your rituals)');
for (const [k, v] of top(m.short, 25).filter(([, v]) => v >= 4)) console.log(`${String(v).padStart(6)}  "${k}"`);

const outArg = arg('--out');
const out = has('--out') ? (outArg && !outArg.startsWith('--') ? outArg : path.join(os.homedir(), '.claude', 'cheap_stack', 'tmp')) : null;
if (out) {
  fs.mkdirSync(out, { recursive: true, mode: 0o700 });
  const lines = rows.map(r => `${day(r.timestamp)} [${path.basename(String(r.project || '?').replace(/\\/g, '/'))}] ${safe(r.display)}`);
  const per = Math.ceil(lines.length / Math.min(3, Math.ceil(lines.length / 1800))), files = [];   // at most 3 files
  for (let i = 0; i * per < lines.length; i++) {
    const f = path.join(out, `prompts_${i + 1}.txt`);
    fs.writeFileSync(f, lines.slice(i * per, (i + 1) * per).join('\n'));
    files.push(f);
  }
  console.log(`\nWrote ${files.length} file(s) for a full read. Secret-looking prompts are withheld, but other private data`);
  console.log(`(hosts, names) is still in them: delete ${out} when done.\n${files.join('\n')}`);
}
