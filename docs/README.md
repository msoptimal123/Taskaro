<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Taskaro — Handoff Index</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',system-ui,sans-serif;background:#F7F4F0;color:#1A1714;line-height:1.55;padding:40px 24px;min-height:100vh}
  .wrap{max-width:760px;margin:0 auto}
  h1{font-family:'DM Serif Display',serif;font-size:56px;font-weight:400;letter-spacing:-1.2px;line-height:1;margin-bottom:8px}
  .tag{display:inline-block;background:#C2692A;color:#fff;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:20px;margin-bottom:24px}
  .lead{font-size:18px;color:#4A4540;margin-bottom:40px;max-width:540px}
  .section{margin:48px 0 24px}
  .section-label{font-size:11px;font-weight:700;color:#9B968F;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px}
  .doc-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .doc{background:#FFF;border:1px solid #EDE9E2;border-radius:14px;padding:18px 20px;text-decoration:none;color:inherit;transition:all .15s;display:block}
  .doc:hover{border-color:#C2692A;box-shadow:0 4px 16px rgba(0,0,0,0.06);transform:translateY(-1px)}
  .doc-num{font-family:'DM Serif Display',serif;font-size:22px;color:#C2692A;margin-bottom:4px;line-height:1}
  .doc-title{font-size:15px;font-weight:600;margin-bottom:4px}
  .doc-desc{font-size:13px;color:#6B6560}
  .stack{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
  .chip{background:#F0EDE8;color:#4A4540;font-size:12px;padding:5px 10px;border-radius:8px;font-weight:500}
  .start-card{background:#1A1714;color:#FFF;border-radius:18px;padding:28px 24px;margin-top:48px}
  .start-card h2{font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;margin-bottom:8px;letter-spacing:-0.5px}
  .start-card p{color:rgba(255,255,255,0.7);font-size:14px;margin-bottom:16px}
  .start-card code{display:block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:14px 16px;font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#FFF;overflow-x:auto}
  footer{margin-top:64px;padding-top:24px;border-top:1px solid #EDE9E2;font-size:13px;color:#9B968F;text-align:center}
  @media(max-width:560px){.doc-grid{grid-template-columns:1fr}h1{font-size:42px}}
</style>
</head>
<body>
<div class="wrap">
  <span class="tag">Developer Handoff · v1</span>
  <h1>Taskaro</h1>
  <p class="lead">Voice-first task manager for solo tradespeople in Slovenian. Complete spec to hand off to Claude Desktop and build the production web app.</p>

  <div class="stack">
    <span class="chip">Next.js 14</span>
    <span class="chip">TypeScript</span>
    <span class="chip">Tailwind</span>
    <span class="chip">Supabase</span>
    <span class="chip">Web Speech API</span>
    <span class="chip">Whisper</span>
    <span class="chip">Claude API</span>
  </div>

  <div class="section">
    <div class="section-label">📖 Read in order</div>
    <div class="doc-grid">
      <a class="doc" href="README.md"><div class="doc-num">01</div><div class="doc-title">README</div><div class="doc-desc">Project overview, MVP scope, stack rationale</div></a>
      <a class="doc" href="architecture.md"><div class="doc-num">02</div><div class="doc-title">Architecture</div><div class="doc-desc">Folder structure, file org, conventions, image handling</div></a>
      <a class="doc" href="database-schema.md"><div class="doc-num">03</div><div class="doc-title">Database Schema</div><div class="doc-desc">All Postgres tables, RLS policies, migrations</div></a>
      <a class="doc" href="voice-flow.md"><div class="doc-num">04</div><div class="doc-title">Voice Flow</div><div class="doc-desc">Web Speech + Whisper + Claude parser spec</div></a>
      <a class="doc" href="screen-specs.md"><div class="doc-num">05</div><div class="doc-title">Screen Specs</div><div class="doc-desc">Every screen's behavior, data, edge cases</div></a>
      <a class="doc" href="flows.md"><div class="doc-num">06</div><div class="doc-title">Critical Flows</div><div class="doc-desc">Rezervacija→Projekt, solo task move, attachments</div></a>
      <a class="doc" href="design-tokens.md"><div class="doc-num">07</div><div class="doc-title">Design Tokens</div><div class="doc-desc">Colors, typography, spacing, components</div></a>
      <a class="doc" href="api-design.md"><div class="doc-num">08</div><div class="doc-title">API Design</div><div class="doc-desc">Server actions, endpoints, env vars</div></a>
    </div>
  </div>

  <div class="section">
    <div class="section-label">🎨 Visual reference</div>
    <a class="doc" href="prototype/Taskaro Draft 2.html"><div class="doc-num">▶︎</div><div class="doc-title">Interactive prototype (Draft 2)</div><div class="doc-desc">Open in browser to see the design. All screens connected, voice flow simulated, completion animations.</div></a>
  </div>

  <div class="start-card">
    <h2>Ready to build?</h2>
    <p>Open Claude Desktop, start a new chat, attach this entire handoff folder, and paste the prompt from:</p>
    <code>handoff/claude-desktop-prompt.md</code>
    <p style="margin-top:16px;color:rgba(255,255,255,0.5);font-size:13px">Claude will scaffold the project, set up Supabase, and build phase-by-phase. You confirm each phase before proceeding.</p>
  </div>

  <footer>Generated from Taskaro design prototype · Maj 2026</footer>
</div>
</body>
</html>
