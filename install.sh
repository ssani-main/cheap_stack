#!/bin/bash
# Installs cheap_stack into ~/.claude. Safe to run again: unchanged files are skipped, changed ones are backed up first.
# Usage: bash install.sh [--force]    (then start a new Claude Code session and run /cheap-setup)
#   --force  also replace a skill or agent of the same name that is not from cheap_stack (it is backed up first)
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)/core"
DEST="${CHEAP_STACK_HOME:-$HOME/.claude}"
TS="$(date +%Y%m%d-%H%M%S)"
FORCE=""; [ "${1:-}" = "--force" ] && FORCE=1

NODE="$(command -v node || true)"
[ -z "$NODE" ] && [ -x /c/node/node.exe ] && NODE=/c/node/node.exe
[ -z "$NODE" ] && { echo "Node.js 16 or newer is required (the hook and the history tool run on it)."; exit 1; }
"$NODE" -e 'process.exit(+process.versions.node.split(".")[0] >= 16 ? 0 : 1)' || { echo "Node.js 16 or newer is required."; exit 1; }
command -v perl >/dev/null || echo "Warning: perl not found; mask_secrets.sh needs it (Git for Windows, macOS and Linux ship it)."
winpath() { if command -v cygpath >/dev/null; then cygpath -m "$1"; else printf '%s' "$1"; fi; }
# Hook command: plain "node" where it is on PATH (survives nvm/fnm version switches); an absolute path on Windows,
# where Claude Code's hook shell may not have the same PATH.
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) HOOK_NODE="$(winpath "$NODE")" ;; *) HOOK_NODE="node"; command -v node >/dev/null || HOOK_NODE="$NODE" ;; esac

put() {  # put <source> <dest>: copy, backing up a different existing file; never replace someone else's file unasked
  mkdir -p "$(dirname "$2")"
  if [ -f "$2" ] && cmp -s "$1" "$2"; then echo "  same     $2"; return; fi
  if [ -f "$2" ] && [ -z "$FORCE" ] && ! grep -q 'cheap_stack' "$2"; then
    echo "  SKIP     $2 exists and is not from cheap_stack (move it away, or run with --force)"; return
  fi
  [ -f "$2" ] && cp "$2" "$2.bak-$TS" && echo "  backup   $2.bak-$TS"
  cp "$1" "$2" && echo "  install  $2"
}

echo "Installing cheap_stack into $DEST"
for d in "$SRC"/skills/*/; do
  s="$(basename "$d")"
  if [ -d "$DEST/cheap_stack/disabled/$s" ]; then echo "  disabled $s (in $DEST/cheap_stack/disabled, left alone)"; continue; fi
  put "$d/SKILL.md" "$DEST/skills/$s/SKILL.md"
done
put "$SRC/agents/fable-reviewer.md" "$DEST/agents/fable-reviewer.md"
put "$SRC/hooks/block-secrets-in-prompt.js" "$DEST/hooks/block-secrets-in-prompt.js"
for f in mine_history.js mask_secrets.sh; do put "$SRC/tools/$f" "$DEST/cheap_stack/tools/$f"; done
for f in "$SRC"/templates/*; do put "$f" "$DEST/cheap_stack/templates/$(basename "$f")"; done

echo "Registering the secret-blocking hook in $DEST/settings.json"
"$NODE" - "$(winpath "$DEST")" "$HOOK_NODE" "$TS" <<'JS'
const fs = require('fs'), path = require('path');
const [dest, node, ts] = process.argv.slice(2);
const file = path.join(dest, 'settings.json');
const q = p => (/\s/.test(p) ? `"${p}"` : p);
const cmd = `${q(node.replace(/\\/g, '/'))} ${q(path.join(dest, 'hooks', 'block-secrets-in-prompt.js').replace(/\\/g, '/'))}`;
const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim() : '';
let s;
try { s = JSON.parse(raw || '{}'); } catch (e) {
  console.error(`  ERROR    ${file} is not plain JSON (${e.message}). Fix it, or add this hook by hand under hooks.UserPromptSubmit:`);
  console.error(`           { "hooks": [ { "type": "command", "command": ${JSON.stringify(cmd)}, "timeout": 10 } ] }`);
  process.exit(1);
}
const ups = ((s.hooks ??= {}).UserPromptSubmit ??= []);
if (ups.some(e => (e.hooks || []).some(h => String(h.command || '').includes('block-secrets-in-prompt.js')))) {
  console.log('  same     hook already registered'); process.exit(0);
}
if (fs.existsSync(file)) { fs.copyFileSync(file, `${file}.bak-${ts}`); console.log(`  backup   ${file}.bak-${ts}`); }
ups.unshift({ hooks: [{ type: 'command', command: cmd, timeout: 10 }] });
fs.writeFileSync(file, JSON.stringify(s, null, 2) + '\n');   // in place, so a symlinked settings.json stays a symlink
console.log(`  install  hook: ${cmd}`);
JS

echo "Self-tests"
"$NODE" "$DEST/hooks/block-secrets-in-prompt.js" --selftest
"$NODE" "$DEST/cheap_stack/tools/mine_history.js" --selftest
if command -v perl >/dev/null; then bash "$DEST/cheap_stack/tools/mask_secrets.sh" --selftest; fi

echo
echo "Done. Start a new Claude Code session and run /cheap-setup to fit the stack to you."
