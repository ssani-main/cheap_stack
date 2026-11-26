#!/bin/bash
# Installs the Antigravity CLI (agy) edition of cheap_stack into ~/.gemini/config/.
# Safe to run again: unchanged files are skipped, changed ones are backed up first.
# Usage: bash antigravity/install.sh [--force]
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${ANTIGRAVITY_HOME:-$HOME/.gemini}"
TS="$(date +%Y%m%d-%H%M%S)"
FORCE=""; [ "${1:-}" = "--force" ] && FORCE=1

put() {
  mkdir -p "$(dirname "$2")"
  if [ -f "$2" ] && cmp -s "$1" "$2"; then echo "  same     $2"; return; fi
  if [ -f "$2" ] && [ -z "$FORCE" ] && ! grep -q 'cheap_stack' "$2"; then
    echo "  SKIP     $2 exists and is not from cheap_stack (move it away, or run with --force)"; return
  fi
  [ -f "$2" ] && cp "$2" "$2.bak-$TS" && echo "  backup   $2.bak-$TS"
  cp "$1" "$2" && echo "  install  $2"
}

echo "Installing cheap_stack (Antigravity edition) into $DEST"
for d in "$SRC"/skills/*/; do
  s="$(basename "$d")"
  put "$d/SKILL.md" "$DEST/config/skills/$s/SKILL.md"
done

put "$SRC/tools/agy-statusline.js" "$DEST/config/tools/agy-statusline.js"
put "$SRC/tools/agy-statusline.cmd" "$DEST/config/tools/agy-statusline.cmd"
chmod +x "$DEST/config/tools/agy-statusline.js" 2>/dev/null || true

if [ ! -f "$DEST/GEMINI.md" ]; then
  put "$SRC/templates/GEMINI.md" "$DEST/GEMINI.md"
else
  echo "  keep     $DEST/GEMINI.md (already exists; template at $SRC/templates/GEMINI.md)"
fi

echo
echo "Done. Start a new Antigravity CLI (agy) session to load the skills."
echo "Optional live quota statusline:"
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    echo "  /statusline $(cygpath -w "$DEST/config/tools/agy-statusline.cmd")"
    ;;
  *)
    echo "  /statusline $DEST/config/tools/agy-statusline.js"
    ;;
esac
