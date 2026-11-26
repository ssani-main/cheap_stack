#!/usr/bin/env node
// cheap_stack Antigravity CLI statusline: model, context bar, 5h/7d quota + reset timer, credits, cwd.
const fs = require("fs");
const path = require("path");
const os = require("os");

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const MAGENTA = "\x1b[35m";

function pctColor(pct, invert = false) {
  const bad = invert ? 100 - pct : pct;
  if (bad >= 85) return RED;
  if (bad >= 60) return YELLOW;
  return GREEN;
}

function bar(pct, width = 8) {
  const clamped = Math.max(0, Math.min(100, pct));
  const filled = Math.round((clamped / 100) * width);
  return "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
}

function fmtTokens(n) {
  if (n == null || isNaN(n)) return "";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

function fmtReset(sec) {
  if (!sec || sec <= 0) return "";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return ` ${DIM}(${d}d${h}h)${RESET}`;
  if (h > 0) return ` ${DIM}(${h}h${m}m)${RESET}`;
  return ` ${DIM}(${m}m)${RESET}`;
}

let raw = "";
try {
  raw = fs.readFileSync(0, "utf8");
} catch {}

if (process.env.AGY_STATUSLINE_DEBUG === "1" && raw && raw.trim()) {
  try {
    fs.writeFileSync(path.join(os.tmpdir(), "agy-statusline-payload.json"), raw, "utf8");
  } catch {}
}

let data = {};
try {
  data = raw && raw.trim() ? JSON.parse(raw) : {};
} catch {
  process.stdout.write(`${DIM}agy statusline: waiting for data...${RESET}`);
  process.exit(0);
}

const parts = [];

const modelName =
  (data.model && (data.model.display_name || data.model.name || data.model.id)) ||
  (typeof data.model === "string" ? data.model : null);
if (modelName) {
  parts.push(`${CYAN}${modelName}${RESET}`);
}

const cw = data.context_window;
if (cw && typeof cw === "object") {
  const usedPct =
    typeof cw.used_percentage === "number"
      ? cw.used_percentage
      : cw.context_window_size > 0 && typeof cw.total_input_tokens === "number"
        ? (cw.total_input_tokens / cw.context_window_size) * 100
        : null;
  if (usedPct != null) {
    const c = pctColor(usedPct, false);
    const tokens =
      cw.context_window_size > 0 && cw.total_input_tokens != null
        ? ` ${DIM}(${fmtTokens(cw.total_input_tokens)}/${fmtTokens(cw.context_window_size)})${RESET}`
        : "";
    parts.push(`Ctx ${c}${bar(usedPct)} ${usedPct.toFixed(0)}%${RESET}${tokens}`);
  }
}

const q = data.quota;
if (q && typeof q === "object") {
  const isGemini = !modelName || /gemini/i.test(modelName);
  const prefix = isGemini ? "gemini" : "3p";
  const q5 = q[`${prefix}-5h`] || q["gemini-5h"] || q["3p-5h"];
  const q7 = q[`${prefix}-weekly`] || q["gemini-weekly"] || q["3p-weekly"];

  const fmtQuota = (label, obj) => {
    if (!obj || typeof obj.remaining_fraction !== "number") return null;
    const pct = Math.max(0, Math.min(100, obj.remaining_fraction * 100));
    const c = pctColor(pct, true);
    return `${label} ${c}${pct.toFixed(0)}%${RESET}${fmtReset(obj.reset_in_seconds)}`;
  };

  const s5 = fmtQuota("5h", q5);
  const s7 = fmtQuota("7d", q7);
  if (s5) parts.push(s5);
  if (s7) parts.push(s7);
}

const credits = data.credits ?? data.ai_credits;
if (typeof credits === "number") {
  parts.push(`${MAGENTA}Credits: ${credits}${RESET}`);
} else if (credits && typeof credits === "object" && credits.remaining != null) {
  parts.push(`${MAGENTA}Credits: ${credits.remaining}${RESET}`);
}

const cwd = (data.workspace && data.workspace.current_dir) || data.cwd;
if (cwd && typeof cwd === "string") {
  parts.push(`${DIM}${path.basename(cwd)}${RESET}`);
}

process.stdout.write(parts.join(` ${DIM}|${RESET} `));
