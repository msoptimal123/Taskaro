
// Taskaro App v2 — Draft 2
// Improvements: 1) Persistent voice FAB  2) Simplified dashboard  3) Unified voice capture
// 4) Harmonious colors  5) Completion feedback

// ── Data ─────────────────────────────────────────────────────────────────────
const DATA = {
  user: { name: "Janez" },
  tasks: [
    { id: 1, title: "Ogled hiše", type: "task", client: "Petrovič, Marko", clientId: 1, status: "Čaka", date: "2026-05-23", time: "15:00", location: "Dunajska 45, Ljubljana", reminder: "1 uro prej", notes: "Kopalnica + predsoba, ~22m². Želi porcelan, svetel ton." },
    { id: 2, title: "Pošlji ponudbo", type: "deadline", client: "Horvat", clientId: 2, status: "Čaka", date: "2026-05-24", time: null, notes: "Fasada — urgentno" },
    { id: 3, title: "Sestanek — Kranjc", type: "task", client: "Kranjc", clientId: 3, status: "Čaka", date: "2026-05-23", time: "13:00", location: "Pisarna" },
    { id: 4, title: "Keramika kopalnica", type: "task", client: "Novak, Janez", clientId: 4, status: "V teku", date: "2026-05-27", location: "Maribor" },
    { id: 5, title: "Sestanek — Horvat", type: "task", client: "Horvat", clientId: 2, status: "Končano", date: "2026-05-21", time: "9:00" },
    { id: 6, title: "Ogled — Kranjc", type: "task", client: "Kranjc", clientId: 3, status: "Končano", date: "2026-05-20" },
    { id: 7, title: "Ponudba — Novak", type: "deadline", client: "Novak", clientId: 4, status: "Končano", date: "2026-05-20", notes: "poslano" },
  ],
  projekti: [
    { id: 1, title: "Keramika kopalnica", clientId: 4, client: "Novak, Janez", start: "27. maj", end: "30. maj", location: "Maribor", status: "Aktivno", statusColor: "green", obseg: "18m²", taskiIds: [1, 2, 4], dokumenti: ["Ponudba.pdf", "Kopalnica.jpg"], color: "#2DB87A" },
    { id: 2, title: "Ogled — jan 2026", clientId: 4, client: "Novak, Janez", start: "jan 2026", status: "Končano", statusColor: "gray", taskiIds: [6], dokumenti: ["Ogled.pdf"], color: "#9CA3AF" },
    { id: 3, title: "Fasada Horvat", clientId: 2, client: "Horvat", start: "15. jul", end: "18. jul", status: "Rezervirano", statusColor: "amber", taskiIds: [2], dokumenti: [], color: "#8B5CF6" },
  ],
  stranke: [
    { id: 1, name: "Petrovič, Marko", initials: "PM", phone: "041 555 123", email: "marko@petrovič.si", projektiIds: [] },
    { id: 2, name: "Horvat", initials: "H", phone: "040 222 333", email: "info@horvat.si", projektiIds: [3] },
    { id: 3, name: "Kranjc", initials: "K", phone: "031 444 555", email: null, projektiIds: [] },
    { id: 4, name: "Novak, Janez", initials: "JN", phone: "041 123 456", email: "janez@novak.si", projektiIds: [1, 2] },
  ],
  ideje: [
    { id: 1, text: "Vprašati Petra za ceno ploščic 60×60 bela mat — primerjaj z Hornbach", date: "danes", time: "9:14" },
    { id: 2, text: "Za Horvat fasado — preveriti ali rabimo gradbeno dovoljenje za toplotno izolacijo", date: "včeraj", time: "17:32" },
    { id: 3, text: "Kupiti nov brusilnik — stari dela probleme na fugah", date: "21. maj", time: "11:05" },
    { id: 4, text: "Ideja: narediti standardno ponudbo za kopalnico do 10m² — da ne računam vsakič znova", date: "19. maj", time: "8:22" },
  ],
  todayEvents: [
    { id: 1, title: "Ogled — Kovač", time: "10:00", type: "task" },
    { id: 2, title: "Pošlji ponudbo — Novak", time: "do 17:00", type: "deadline" },
    { id: 3, title: "Sestanek — Kranjc", time: "14:00", type: "task" },
    { id: 4, title: "Fasada — Horvat", time: "cel dan", type: "rezervacija" },
  ],
};

// ── Color system ──────────────────────────────────────────────────────────────
// Improvement 4: harmonious palette — warm amber accent, distinct type colors
const C = {
  task:       "#3B82F6",  // blue
  deadline:   "#D97706",  // warm orange
  rezervacija:"#7C3AED",  // deep purple
  done:       "#9CA3AF",
  accent:     "#C2692A",  // warm amber-brown — doesn't clash with deadline red
  bg:         "#F7F4F0",  // warm off-white
  card:       "#FFFFFF",
  border:     "#EDE9E2",
  border2:    "#F0EDE8",
  text:       "#1A1714",
  muted:      "#9B968F",
  muted2:     "#6B6560",
  green:      "#16A34A",
};
const TYPE_BG = { task:"#EFF6FF", deadline:"#FEF3C7", rezervacija:"#F5F3FF" };
const TYPE_FG = { task:"#1D4ED8", deadline:"#92400E", rezervacija:"#5B21B6" };

// ── Shared components ─────────────────────────────────────────────────────────
function NavBar({ title, onBack, backLabel="nazaj", rightLabel, onRight, rightLabelStyle }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px 10px", borderBottom:`1px solid ${C.border2}`, background:C.bg }}>
      {onBack ? (
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted2, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:4, padding:0 }}>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke={C.muted2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {backLabel}
        </button>
      ) : <div style={{ width:60 }} />}
      <span style={{ fontWeight:600, fontSize:16, color:C.text, letterSpacing:"-0.2px" }}>{title}</span>
      {rightLabel ? (
        <button onClick={onRight} style={{ background:"none", border:"none", fontSize:15, fontWeight:600, cursor:"pointer", padding:0, color:C.accent, ...rightLabelStyle }}>{rightLabel}</button>
      ) : <div style={{ width:60 }} />}
    </div>
  );
}

function ColorDot({ type, size=8 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:C[type]||type, flexShrink:0 }} />;
}

function StatusBadge({ label, color }) {
  const bg = color==="green"?"#D1FAE5":color==="amber"?"#FEF3C7":color==="gray"?"#F3F4F6":"#F0EDE8";
  const fg = color==="green"?"#065F46":color==="amber"?"#92400E":color==="gray"?"#6B7280":C.muted2;
  return <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:20, background:bg, color:fg, fontSize:12, fontWeight:500 }}>{label}</span>;
}

function SectionHeader({ label, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", color:C.muted, textTransform:"uppercase" }}>{label}</span>
      {action && (
        <button onClick={onAction} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:20, padding:"4px 12px", fontSize:12, color:C.muted2, cursor:"pointer" }}>{action}</button>
      )}
    </div>
  );
}

// ── Improvement 5: Completion celebration ────────────────────────────────────
function CompletionBurst({ onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, []);
  const particles = Array.from({length: 8}, (_, i) => ({
    angle: i * 45,
    color: [C.task, C.accent, C.green, C.rezervacija, "#F59E0B"][i % 5],
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position:"absolute", width:8, height:8, borderRadius:"50%", background:p.color,
          animation:`burst-${i} 0.8s ease-out forwards`,
          transformOrigin:"center",
        }} />
      ))}
      <div style={{ fontSize:28, animation:"pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>✓</div>
      <style>{`
        @keyframes pop-in { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
        ${particles.map((p,i) => `
          @keyframes burst-${i} {
            0%{transform:translate(0,0) scale(1);opacity:1}
            100%{transform:translate(${Math.cos(p.angle*Math.PI/180)*60}px,${Math.sin(p.angle*Math.PI/180)*60}px) scale(0);opacity:0}
          }
        `).join('')}
      `}</style>
    </div>
  );
}

// ── Improvement 1 & 3: Voice FAB + Capture Modal ─────────────────────────────
// FAB is now inline in dashboard, not floating absolute
const VOICE_SUGGESTIONS = [
  "Jutri ob 10h ogled pri Novaku v Mariboru",
  "Pošlji ponudbo Horvat do petka",
  "Rezerviraj termin 15. julija za fasado",
  "Ideja: standardna ponudba za kopalnico",
  "Sestanek Kranjc v sredo ob 14h",
];

function VoiceFAB({ onCapture }) {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState("idle"); // idle | listening | processing | done
  const [transcript, setTranscript] = React.useState("");
  const [editedText, setEditedText] = React.useState("");
  const [parsed, setParsed] = React.useState(null);

  const startListening = () => {
    setMode("listening");
    setTranscript("");
    setEditedText("");
    setParsed(null);
    const suggestion = VOICE_SUGGESTIONS[Math.floor(Math.random() * VOICE_SUGGESTIONS.length)];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      const partial = suggestion.slice(0, i * 3);
      setTranscript(partial);
      if (i * 3 >= suggestion.length) {
        clearInterval(interval);
        setTranscript(suggestion);
        setEditedText(suggestion);
        setTimeout(() => {
          setMode("processing");
          setTimeout(() => {
            setParsed(parseVoice(suggestion));
            setMode("done");
          }, 700);
        }, 300);
      }
    }, 55);
  };

  const parseVoice = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("ideja") || lower.includes("standardna ponudba")) return { type: "ideja", text };
    if (lower.includes("rezerviraj") || lower.includes("rezervacij")) return { type: "rezervacija", title: text, time: "15. jul" };
    if (lower.includes("ponudbo") || lower.includes("do ")) return { type: "deadline", title: text, time: "petek" };
    return { type: "task", title: text, time: lower.includes("jutri") ? "jutri 10:00" : lower.includes("sredo") ? "sreda 14:00" : null };
  };

  const handleSave = () => {
    onCapture && onCapture(parsed);
    setOpen(false);
    setMode("idle");
    setTranscript("");
    setEditedText("");
    setParsed(null);
  };

  const typeColor = { task: C.task, deadline: C.deadline, rezervacija: C.rezervacija, ideja: C.accent };

  // Mic button only — no FAB positioning, used inline in dashboard
  const micBtnEl = (
    <div style={{ display:"flex", justifyContent:"center" }}>
      <div style={{ position:"relative" }}>
        <button onClick={() => { setOpen(true); setMode("idle"); setEditedText(""); setParsed(null); }} style={{
          width:72, height:72, borderRadius:"50%",
          background:`linear-gradient(135deg, #1A1714 0%, #2D2520 100%)`,
          border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 20px rgba(0,0,0,0.24), 0 1px 4px rgba(0,0,0,0.12)",
          transition:"transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.07)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(0,0,0,0.32)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.24)"; }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" stroke="white" strokeWidth="1.6"/>
            <path d="M5 11C5 14.87 8.13 18 12 18s7-3.13 7-7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M12 18V21M9 21H15" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Pulse ring */}
        <div style={{ position:"absolute", inset:-6, borderRadius:"50%", border:"1.5px solid rgba(26,23,20,0.1)", animation:"mic-idle-pulse 2.5s ease-out infinite", pointerEvents:"none" }} />
      </div>
    </div>
  );

  return (
    <>
      {micBtnEl}

      {/* Capture modal — simplified: no type selector, just transcribe+edit+confirm */}
      {open && (
        <div style={{ position:"absolute", inset:0, background:"rgba(26,23,20,0.55)", zIndex:100, display:"flex", flexDirection:"column", justifyContent:"flex-end" }} onClick={e => { if(e.target===e.currentTarget){setOpen(false);setMode("idle");} }}>
          <div style={{ background:C.bg, borderRadius:"24px 24px 0 0", paddingBottom:32 }}>
            {/* Handle */}
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 6px" }}>
              <div style={{ width:36, height:4, borderRadius:2, background:C.border }} />
            </div>
            <div style={{ padding:"4px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Nov vnos</span>
              <button onClick={()=>{setOpen(false);setMode("idle");}} style={{ background:"none", border:"none", color:C.muted, fontSize:13, cursor:"pointer" }}>Prekliči</button>
            </div>

            {/* Transcript / editable text area */}
            <div style={{ margin:"0 20px 14px", background:C.card, borderRadius:14, border:`1.5px solid ${mode==="listening"?C.deadline:mode==="done"?C.green:C.border}`, padding:"14px 16px", minHeight:90, transition:"border-color 0.3s" }}>
              {mode==="idle" && !editedText ? (
                <span style={{ color:C.muted, fontSize:15 }}>Pritisni mikrofon ali piši...</span>
              ) : (
                <textarea
                  value={mode==="listening" ? transcript : editedText}
                  onChange={e => setEditedText(e.target.value)}
                  readOnly={mode==="listening"}
                  style={{ width:"100%", border:"none", outline:"none", resize:"none", fontSize:15, color:C.text, lineHeight:1.55, background:"transparent", fontFamily:"'DM Sans',sans-serif", minHeight:70, boxSizing:"border-box" }}
                />
              )}
              {/* AI parsed preview */}
              {mode==="processing" && (
                <div style={{ display:"flex", gap:4, marginTop:8 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:C.accent, animation:`dot-bounce 0.8s ${i*0.15}s ease-in-out infinite` }} />)}
                  <span style={{ fontSize:12, color:C.muted, marginLeft:4 }}>AI razpoznava...</span>
                </div>
              )}
              {mode==="done" && parsed && (
                <div style={{ marginTop:10, padding:"8px 10px", background:TYPE_BG[parsed.type]||"#FEF3C7", borderRadius:8, borderLeft:`3px solid ${typeColor[parsed.type]||C.accent}`, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", color:TYPE_FG[parsed.type]||C.accent }}>{parsed.type}</span>
                  {parsed.time && <span style={{ fontSize:11, color:C.muted }}>· {parsed.time}</span>}
                  <span style={{ fontSize:11, color:C.muted, marginLeft:"auto" }}>AI zaznan · spremi ↑</span>
                </div>
              )}
            </div>

            {/* Bottom action row */}
            <div style={{ padding:"0 20px", display:"flex", gap:10, alignItems:"center" }}>
              {/* Mic button */}
              <button onClick={mode==="listening" ? ()=>{setMode("idle");} : startListening} style={{
                width:52, height:52, borderRadius:"50%", border:"none", cursor:"pointer", flexShrink:0,
                background: mode==="listening" ? "#DC2626" : "#2D2520",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: mode==="listening" ? "0 0 0 6px rgba(220,38,38,0.18)" : "none",
                transition:"all 0.2s",
              }}>
                {mode==="listening" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" fill="white"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="8" y="2" width="6" height="10" rx="3" stroke="white" strokeWidth="1.6"/>
                    <path d="M4 10C4 13.87 7.13 17 11 17s7-3.13 7-7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M11 17V20M8 20H14" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
              {/* Confirm / save */}
              <button
                onClick={() => { if(mode==="idle"&&editedText.trim()){setMode("processing");setTimeout(()=>{setParsed(parseVoice(editedText));setMode("done");},700);} else if(mode==="done"||editedText.trim()){handleSave();} }}
                disabled={mode==="listening"||mode==="processing"||(!editedText.trim()&&mode!=="done")}
                style={{
                  flex:1, height:52, borderRadius:14, border:"none", cursor:"pointer",
                  background: mode==="done" ? C.green : (editedText.trim()?C.text:"#E8E4DE"),
                  color: mode==="done"||editedText.trim() ? "#FFF" : C.muted,
                  fontSize:15, fontWeight:600, fontFamily:"'DM Sans',sans-serif",
                  transition:"all 0.2s",
                  opacity: mode==="listening"||mode==="processing" ? 0.5 : 1,
                }}>
                {mode==="done" ? "✓ Potrdi" : mode==="processing" ? "..." : "Shrani"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes mic-idle-pulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes dot-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>
    </>
  );
}

// ── Improvement 2: Simplified Dashboard ──────────────────────────────────────
function DashboardScreen({ navigate, onCompletion }) {
  const today = new Date();
  const dayName = ["Nedelja","Ponedeljek","Torek","Sreda","Četrtek","Petek","Sobota"][today.getDay()];
  const dateStr = `${today.getDate()}. ${["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"][today.getMonth()]}`;
  const [completedToday, setCompletedToday] = React.useState([]);
  const [danesOpen, setDanesOpen] = React.useState(true);
  const [reopenId, setReopenId] = React.useState(null);

  const handleComplete = (id) => {
    setCompletedToday(p => [...p, id]);
    onCompletion && onCompletion();
  };
  const handleCircleClick = (id) => {
    if (completedToday.includes(id)) setReopenId(id);
    else handleComplete(id);
  };
  const confirmReopen = () => {
    setCompletedToday(p => p.filter(x => x !== reopenId));
    setReopenId(null);
  };

  const upcoming = DATA.tasks.filter(t => t.status !== "Končano" && t.date >= "2026-05-24").slice(0, 2);
  const doneCount = completedToday.length;
  const totalCount = DATA.todayEvents.length;

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, position:"relative" }}>
      {/* Reopen confirmation dialog */}
      {reopenId!==null && (
        <div style={{ position:"absolute", inset:0, background:"rgba(26,23,20,0.45)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 32px" }}>
          <div style={{ background:C.card, borderRadius:20, padding:"24px 20px", width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:8 }}>Znova odpri nalogo?</div>
            <div style={{ fontSize:14, color:C.muted, lineHeight:1.5, marginBottom:20 }}>Naloga bo označena kot aktivna.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setReopenId(null)} style={{ flex:1, padding:"13px", borderRadius:12, background:"#F0EDE8", border:"none", fontSize:14, fontWeight:600, color:C.muted2, cursor:"pointer" }}>Prekliči</button>
              <button onClick={confirmReopen} style={{ flex:1, padding:"13px", borderRadius:12, background:C.text, border:"none", fontSize:14, fontWeight:600, color:"#FFF", cursor:"pointer" }}>Znova odpri</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{ padding:"24px 20px 16px" }}>
        <div style={{ fontSize:12, color:C.muted, marginBottom:2 }}>{dayName}, {dateStr}</div>
        <div style={{ fontSize:30, fontWeight:700, color:C.text, letterSpacing:"-0.6px", fontFamily:"'DM Serif Display',serif", lineHeight:1.15 }}>Janez</div>
      </div>

      {/* Mic FAB — centered below greeting */}
      <div style={{ padding:"8px 20px 16px" }}>
        <VoiceFAB onCapture={(parsed)=>{ if(parsed?.type==="ideja") navigate("notes"); else navigate("taski"); }} />
      </div>

      {/* Today section */}
      <div style={{ padding:"0 20px 8px" }}>
        <button onClick={() => setDanesOpen(o => !o)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", padding:"4px 0 8px" }}>
          <span style={{ fontSize:14, fontWeight:600, color:C.text }}>
            <span style={{ color:C.text, fontWeight:700 }}>{totalCount - doneCount}</span> <span style={{ color:C.muted, fontWeight:500 }}>odprtih taskov danes</span>
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform:danesOpen?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}>
            <path d="M4 6L8 10L12 6" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {danesOpen && DATA.todayEvents.map(ev => {
          const done = completedToday.includes(ev.id);
          return (
            <div key={ev.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid ${C.border2}` }}>
              <button onClick={() => handleCircleClick(ev.id)} style={{
                width:26, height:26, borderRadius:"50%", flexShrink:0, cursor:"pointer",
                border: done ? "none" : `1.5px solid ${C.border}`,
                background: done ? C.green : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.25s",
              }}>
                {done && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <div style={{ width:3, height:32, borderRadius:2, background:C[ev.type]||C.task, flexShrink:0 }} />
              <div style={{ flex:1 }} onClick={() => navigate("task-detail", {taskId:ev.id})}>
                <div style={{ fontSize:15, fontWeight:500, color:done?C.muted:C.text, textDecoration:done?"line-through":"none", cursor:"pointer" }}>{ev.title}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{ev.time}</div>
              </div>
              {ev.type==="deadline" && !done && (
                <span style={{ fontSize:11, fontWeight:600, color:TYPE_FG.deadline, background:TYPE_BG.deadline, borderRadius:20, padding:"2px 8px" }}>!</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming preview */}
      <div style={{ padding:"8px 20px 100px" }}>
        <SectionHeader label="Prihajajoče" action="Vse →" onAction={() => navigate("taski")} />
        {upcoming.map(task => (
          <div key={task.id} onClick={() => navigate("task-detail",{taskId:task.id})} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:`1px solid ${C.border2}`, cursor:"pointer" }}>
            <div style={{ width:3, height:28, borderRadius:2, background:C[task.type]||C.task, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{task.title} — {task.client?.split(",")[0]}</div>
              <div style={{ fontSize:12, color:C.muted }}>{task.date?.split("-").slice(1).join(". ")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Taski ─────────────────────────────────────────────────────────────
function TaskiScreen({ navigate, onCompletion }) {
  const [filter, setFilter] = React.useState("Danes");
  const filters = ["Danes","Prihajajoči","Končani"];
  const today = "2026-05-23";
  const getFiltered = () => {
    if (filter==="Danes") return DATA.tasks.filter(t => t.date===today && t.status!=="Končano");
    if (filter==="Prihajajoči") return DATA.tasks.filter(t => t.date>today && t.status!=="Končano");
    return DATA.tasks.filter(t => t.status==="Končano");
  };
  const tasks = getFiltered();
  const groups = {};
  tasks.forEach(t => { if(!groups[t.date]) groups[t.date]=[]; groups[t.date].push(t); });
  const groupArr = Object.entries(groups).sort(([a],[b]) => a.localeCompare(b));
  const fmt = d => { const p=d.split("-"); return `${parseInt(p[2])}. ${["JAN","FEB","MAR","APR","MAJ","JUN","JUL","AVG","SEP","OKT","NOV","DEC"][parseInt(p[1])-1]}`; };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.3px" }}>Taski</span>
      </div>
      <div style={{ display:"flex", gap:8, padding:"8px 20px 16px" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"7px 16px", borderRadius:20, fontSize:14, fontWeight:500,
            background:filter===f?C.text:"#F0EDE8", color:filter===f?"#FFF":C.muted2,
            border:"none", cursor:"pointer", transition:"all 0.15s",
          }}>{f}</button>
        ))}
      </div>
      <div style={{ padding:"0 20px 120px" }}>
        {groupArr.length===0 ? (
          <div style={{ textAlign:"center", padding:"48px 0", color:C.muted, fontSize:14 }}>Ni nalog</div>
        ) : groupArr.map(([date, ts]) => (
          <div key={date} style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.08em", marginBottom:4 }}>{fmt(date)}</div>
            {ts.map(task => (
              <div key={task.id} onClick={() => navigate("task-detail",{taskId:task.id})} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 0", borderBottom:`1px solid ${C.border2}`, cursor:"pointer" }}>
                <div style={{ width:3, height:32, borderRadius:2, background:C[task.type]||C.task, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:500, color:task.status==="Končano"?C.muted:C.text, textDecoration:task.status==="Končano"?"line-through":"none" }}>
                    {task.title}{task.client&&!task.title.includes(task.client.split(",")[0])?` — ${task.client.split(",")[0]}`:""}
                  </div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{task.time||""}{task.location?` · ${task.location}`:""}</div>
                </div>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#C8C3BB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Task Detail ───────────────────────────────────────────────────────
function TaskDetailScreen({ navigate, params, onCompletion }) {
  const task = DATA.tasks.find(t => t.id===(params?.taskId||1)) || DATA.tasks[0];
  const [done, setDone] = React.useState(task.status==="Končano");
  const [showReopenDialog, setShowReopenDialog] = React.useState(false);

  const handleCircleClick = () => {
    if (!done) { setDone(true); onCompletion&&onCompletion(); }
    else { setShowReopenDialog(true); }
  };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, position:"relative" }}>
      {/* Reopen confirmation dialog */}
      {showReopenDialog && (
        <div style={{ position:"absolute", inset:0, background:"rgba(26,23,20,0.45)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 32px" }}>
          <div style={{ background:C.card, borderRadius:20, padding:"24px 20px", width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:8 }}>Znova odpri nalogo?</div>
            <div style={{ fontSize:14, color:C.muted, lineHeight:1.5, marginBottom:20 }}>Naloga bo označena kot aktivna in se bo pojavila v tvojem seznamu.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowReopenDialog(false)} style={{ flex:1, padding:"13px", borderRadius:12, background:"#F0EDE8", border:"none", fontSize:14, fontWeight:600, color:C.muted2, cursor:"pointer" }}>Prekliči</button>
              <button onClick={()=>{setDone(false);setShowReopenDialog(false);}} style={{ flex:1, padding:"13px", borderRadius:12, background:C.text, border:"none", fontSize:14, fontWeight:600, color:"#FFF", cursor:"pointer" }}>Znova odpri</button>
            </div>
          </div>
        </div>
      )}
      <NavBar title="Task" onBack={() => navigate("taski")} backLabel="nazaj"
        rightLabel="Uredi"
        rightLabelStyle={{ fontSize:15, fontWeight:600, color:C.accent }}
        onRight={() => {}} />
      <div style={{ padding:"20px 20px 32px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", gap:12, alignItems:"flex-start", flex:1 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:TYPE_BG[task.type]||"#F0EDE8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:2 }}>
              <div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${C[task.type]||C.task}` }} />
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:C.text, letterSpacing:"-0.3px", lineHeight:1.2 }}>{task.title}</div>
              <div style={{ display:"flex", gap:6, marginTop:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:TYPE_FG[task.type]||C.muted2, background:TYPE_BG[task.type]||"#F0EDE8", borderRadius:20, padding:"2px 10px" }}>{task.type}</span>
                <StatusBadge label={done?"Končano":task.status} color={done?"green":task.status==="V teku"?"amber":"gray"} />
              </div>
            </div>
          </div>
          <button onClick={handleCircleClick} style={{
            width:34, height:34, borderRadius:"50%", flexShrink:0, marginTop:4, cursor:"pointer",
            border: done?"none":`1.5px solid ${C.border}`,
            background: done ? C.green : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s",
          }}>
            {done && <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5L5.5 10L13 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
        </div>

        {[
          { label:"Datum in čas", value:`${task.date?.split("-").slice(1).reverse().join(". ")} ${task.date?.split("-")[0]}${task.time?`, ${task.time}`:""}` },
          task.client && { label:"Stranka", value:task.client, isLink:true, onClick:()=>navigate("stranka-detail",{strankaId:task.clientId}) },
          task.location && { label:"Lokacija", value:task.location },
          task.reminder && { label:"Opomnik", value:task.reminder },
        ].filter(Boolean).map((row,i) => (
          <div key={i} style={{ padding:"13px 0", borderBottom:`1px solid ${C.border2}` }}>
            <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{row.label}</div>
            {row.isLink ? (
              <button onClick={row.onClick} style={{ background:"none", border:"none", padding:0, cursor:"pointer", color:C.green, fontSize:15, fontWeight:500 }}>{row.value} →</button>
            ) : (
              <div style={{ fontSize:15, color:C.text }}>{row.value}</div>
            )}
          </div>
        ))}

        {task.notes && (
          <div style={{ padding:"13px 0", borderBottom:`1px solid ${C.border2}` }}>
            <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Opombe</div>
            <div style={{ fontSize:15, color:C.text, lineHeight:1.5 }}>{task.notes}</div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:28 }}>
          <button style={{ flex:1, padding:"14px", borderRadius:12, background:"#F0EDE8", border:"none", fontSize:15, fontWeight:600, color:C.muted2, cursor:"pointer" }}>Prestavi</button>
          <button style={{ flex:1, padding:"14px", borderRadius:12, background:"#FEE2E2", border:"none", fontSize:15, fontWeight:600, color:"#EF4444", cursor:"pointer" }}>Briši</button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Projekti ──────────────────────────────────────────────────────────
function ProjektiScreen({ navigate }) {
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"16px 20px 8px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.3px" }}>Projekti</span>
      </div>
      <div style={{ padding:"8px 20px 120px" }}>
        <SectionHeader label="Aktivni" />
        {DATA.projekti.filter(p=>p.status==="Aktivno").map(p => <ProjectCard key={p.id} projekt={p} onClick={()=>navigate("projekt-detail",{projektId:p.id})} />)}
        <div style={{ marginTop:20 }}><SectionHeader label="Rezervirani" /></div>
        {DATA.projekti.filter(p=>p.status==="Rezervirano").map(p => <ProjectCard key={p.id} projekt={p} onClick={()=>navigate("projekt-detail",{projektId:p.id})} />)}
        <div style={{ marginTop:20 }}><SectionHeader label="Zaključeni" /></div>
        {DATA.projekti.filter(p=>p.status==="Končano").map(p => <ProjectCard key={p.id} projekt={p} onClick={()=>navigate("projekt-detail",{projektId:p.id})} />)}
      </div>
    </div>
  );
}

function ProjectCard({ projekt, onClick }) {
  return (
    <div onClick={onClick} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"13px 16px", marginBottom:9, cursor:"pointer", display:"flex", gap:12, alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ width:4, height:44, borderRadius:4, background:projekt.color, flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{projekt.title}</div>
        <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{projekt.start}{projekt.end&&` – ${projekt.end}`}{projekt.obseg&&` · ${projekt.obseg}`}</div>
        <div style={{ fontSize:12, color:C.muted }}>{projekt.taskiIds.length} taski · {projekt.dokumenti.length} dokumenti</div>
      </div>
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#C8C3BB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}

// ── Screen: Projekt Detail ────────────────────────────────────────────────────
function ProjektDetailScreen({ navigate, params }) {
  const projekt = DATA.projekti.find(p=>p.id===(params?.projektId||1)) || DATA.projekti[0];
  const tasks = DATA.tasks.filter(t => projekt.taskiIds.includes(t.id));
  const [dialog, setDialog] = React.useState(null); // 'close' | 'attach' | 'edit' | null
  const [toast, setToast] = React.useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 2200); };
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, position:"relative" }}>
      {dialog && (
        <div style={{ position:"absolute", inset:0, background:"rgba(26,23,20,0.45)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 32px" }}>
          <div style={{ background:C.card, borderRadius:20, padding:"24px 20px", width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:8 }}>
              {dialog==='close' && 'Zaključi projekt?'}
              {dialog==='attach' && 'Dodaj prilogo'}
              {dialog==='edit' && 'Uredi projekt'}
            </div>
            <div style={{ fontSize:14, color:C.muted, lineHeight:1.5, marginBottom:20 }}>
              {dialog==='close' && `„${projekt.title}“ bo označen kot zaključen in premaknjen v arhiv.`}
              {dialog==='attach' && 'Izberi datoteko ali sliko, ki jo želiš dodati k projektu.'}
              {dialog==='edit' && 'Ime, datumi, lokacija in obseg projekta.'}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDialog(null)} style={{ flex:1, padding:"13px", borderRadius:12, background:"#F0EDE8", border:"none", fontSize:14, fontWeight:600, color:C.muted2, cursor:"pointer" }}>Prekliči</button>
              <button onClick={()=>{const m={close:'Projekt zaključen',attach:'Priloga dodana',edit:'Spremembe shranjene'}[dialog];setDialog(null);showToast(m);}} style={{ flex:1, padding:"13px", borderRadius:12, background:C.text, border:"none", fontSize:14, fontWeight:600, color:"#FFF", cursor:"pointer" }}>{dialog==='attach'?'Izberi':dialog==='edit'?'Shrani':'Zaključi'}</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position:"absolute", left:"50%", bottom:24, transform:"translateX(-50%)", background:"rgba(26,23,20,0.92)", color:"#FFF", padding:"10px 18px", borderRadius:20, fontSize:13, fontWeight:500, zIndex:60, whiteSpace:"nowrap" }}>{toast}</div>
      )}
      <NavBar title="Projekt" onBack={()=>navigate("projekti")} rightLabel="Uredi" rightLabelStyle={{ color:C.accent, fontWeight:600 }} onRight={()=>setDialog('edit')} />
      <div style={{ padding:"20px 20px 32px" }}>
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          <div style={{ width:4, borderRadius:4, background:projekt.color, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.3px" }}>{projekt.title}</div>
            <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>{projekt.start}{projekt.end&&` – ${projekt.end}`}{projekt.location&&` · ${projekt.location}`}</div>
            <div style={{ marginTop:8 }}><StatusBadge label={projekt.status} color={projekt.statusColor} /></div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
          {[{v:tasks.length,l:"taski"},{v:projekt.dokumenti.length,l:"dokumenti"},{v:projekt.obseg||"—",l:"obseg"}].map(s => (
            <div key={s.l} style={{ background:"#F0EDE8", borderRadius:12, padding:"13px 10px", textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:700, color:C.text }}>{s.v}</div>
              <div style={{ fontSize:11, color:C.muted }}>{s.l}</div>
            </div>
          ))}
        </div>
        <SectionHeader label="Taski" action="+ dodaj" />
        {tasks.map(task => (
          <div key={task.id} onClick={()=>navigate("task-detail",{taskId:task.id})} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:`1px solid ${C.border2}`, cursor:"pointer" }}>
            <div style={{ width:3, height:28, borderRadius:2, background:C[task.type]||C.task, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:500, color:task.status==="Končano"?C.muted:C.text, textDecoration:task.status==="Končano"?"line-through":"none" }}>{task.title}</div>
              <div style={{ fontSize:12, color:C.muted }}>{task.date?.split("-").slice(1).reverse().join(". ")} · {task.status}</div>
            </div>
            <div style={{ width:22, height:22, borderRadius:"50%", border:task.status==="Končano"?"none":`1.5px solid ${C.border}`, background:task.status==="Končano"?C.green:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {task.status==="Končano"&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          </div>
        ))}
        <div style={{ marginTop:20 }}>
          <SectionHeader label="Dokumenti" action="+ dodaj" onAction={()=>setDialog('attach')} />
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {projekt.dokumenti.map((doc,i)=>(
              <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 13px", display:"flex", gap:7, alignItems:"center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="9" height="12" rx="1.5" stroke={C.muted} strokeWidth="1.2"/><path d="M3 4h5M3 6.5h5M3 9h3" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{ fontSize:12, fontWeight:500, color:C.text }}>{doc}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:28 }}>
          <button onClick={()=>setDialog('close')} style={{ flex:2, padding:"14px", borderRadius:12, background:C.text, border:"none", fontSize:15, fontWeight:600, color:"#FFF", cursor:"pointer" }}>Zaključi projekt</button>
          <button onClick={()=>showToast('Projekt izbrisan')} style={{ flex:1, padding:"14px", borderRadius:12, background:"#FEE2E2", border:"none", fontSize:15, fontWeight:600, color:"#EF4444", cursor:"pointer" }}>Briši</button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Stranke ───────────────────────────────────────────────────────────
function StrankeScreen({ navigate }) {
  const [search, setSearch] = React.useState("");
  const filtered = DATA.stranke.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"16px 20px 8px" }}>
        <span style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.3px" }}>Stranke</span>
      </div>
      <div style={{ padding:"8px 20px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, background:"#F0EDE8", borderRadius:12, padding:"10px 14px" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke={C.muted} strokeWidth="1.5"/><path d="M11 11L14 14" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Išči stranke..." style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:14, color:C.text }} />
        </div>
      </div>
      <div style={{ padding:"4px 20px 120px" }}>
        {filtered.map(s=>(
          <div key={s.id} onClick={()=>navigate("stranka-detail",{strankaId:s.id})} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:`1px solid ${C.border2}`, cursor:"pointer" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"#E8E4DE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:13, fontWeight:600, color:C.muted2 }}>{s.initials}</span>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.text }}>{s.name}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{s.phone}</div>
            </div>
            {s.projektiIds.length>0&&<span style={{ fontSize:11, color:C.green, fontWeight:600 }}>{s.projektiIds.length} proj.</span>}
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#C8C3BB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Stranka Detail ────────────────────────────────────────────────────
function StrankaDetailScreen({ navigate, params }) {
  const stranka = DATA.stranke.find(s=>s.id===(params?.strankaId||4)) || DATA.stranke[3];
  const projekti = DATA.projekti.filter(p=>stranka.projektiIds.includes(p.id));
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(stranka.name);
  const [phone, setPhone] = React.useState(stranka.phone);
  const [email, setEmail] = React.useState(stranka.email||"");
  const [toast, setToast] = React.useState(null);
  const save = () => { setEditing(false); setToast("Spremembe shranjene"); setTimeout(()=>setToast(null),2000); };
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg, position:"relative" }}>
      {toast && (
        <div style={{ position:"absolute", left:"50%", bottom:24, transform:"translateX(-50%)", background:"rgba(26,23,20,0.92)", color:"#FFF", padding:"10px 18px", borderRadius:20, fontSize:13, fontWeight:500, zIndex:60, whiteSpace:"nowrap" }}>{toast}</div>
      )}
      <NavBar title="Stranka" onBack={()=>navigate("stranke")} rightLabel={editing?"Shrani":"Uredi"} rightLabelStyle={{ color:C.accent, fontWeight:600 }} onRight={()=>editing?save():setEditing(true)} />
      <div style={{ padding:"20px 20px 32px" }}>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:20 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:"#E8E4DE", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:18, fontWeight:600, color:C.muted2 }}>{stranka.initials}</span>
          </div>
          <div>
            {editing ? (
              <>
                <input value={name} onChange={e=>setName(e.target.value)} style={{ fontSize:20, fontWeight:700, color:C.text, border:`1.5px solid ${C.accent}`, borderRadius:8, padding:"4px 8px", background:"#FFF", outline:"none", width:200, fontFamily:"'DM Sans',sans-serif" }} />
                <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:4 }}>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Telefon" style={{ fontSize:13, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 8px", background:"#FFF", outline:"none", width:200, fontFamily:"'DM Sans',sans-serif" }} />
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ fontSize:13, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 8px", background:"#FFF", outline:"none", width:200, fontFamily:"'DM Sans',sans-serif" }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:20, fontWeight:700, color:C.text }}>{name}</div>
                <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{phone}{email&&` · ${email}`}</div>
              </>
            )}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:28 }}>
          {[["Klici","phone"],["Email","email"]].map(([l])=>(
            <button key={l} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:12, background:"#F0EDE8", border:"none", fontSize:14, fontWeight:500, color:C.muted2, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        <SectionHeader label="Projekti" action="+ nov" />
        {projekti.map(p=><ProjectCard key={p.id} projekt={p} onClick={()=>navigate("projekt-detail",{projektId:p.id})} />)}
        {projekti.length===0&&<div style={{ color:C.muted, fontSize:14, textAlign:"center", padding:"24px 0" }}>Ni projektov</div>}
      </div>
    </div>
  );
}

// ── Screen: Notes (renamed from Ideje) ────────────────────────────────────
function NotesScreen({ navigate }) {
  const [notes, setNotes] = React.useState(DATA.ideje);
  const [recording, setRecording] = React.useState(false);
  const handleDelete = id => setNotes(notes.filter(n=>n.id!==id));
  const handleMicClick = () => {
    setRecording(true);
    setTimeout(() => {
      const samples = ["Preveri ceno keramike pri novem dobavitelju","Poklicati Petra za ponedeljkov ogled","Kupiti nov set svedrov"];
      const txt = samples[Math.floor(Math.random()*samples.length)];
      setNotes(p => [{id:Date.now(),text:txt,date:"danes",time:new Date().toLocaleTimeString("sl",{hour:"2-digit",minute:"2-digit"})},...p]);
      setRecording(false);
    }, 1400);
  };
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"16px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.3px" }}>Notes</span>
        <button onClick={handleMicClick} disabled={recording} style={{
          width:44, height:44, borderRadius:"50%", border:"none", cursor:"pointer",
          background: recording ? "#DC2626" : `linear-gradient(135deg, #1A1714 0%, #2D2520 100%)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: recording ? "0 0 0 6px rgba(220,38,38,0.18)" : "0 2px 10px rgba(0,0,0,0.18)",
          transition:"all 0.2s",
        }}>
          {recording ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" fill="white"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" stroke="white" strokeWidth="1.6"/>
              <path d="M5 11C5 14.87 8.13 18 12 18s7-3.13 7-7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M12 18V21M9 21H15" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>
      <div style={{ padding:"4px 20px 100px" }}>
        {notes.map((note, i) => (
          <div key={note.id} style={{ padding:"13px 0", borderBottom:`1px solid ${C.border2}`, display:"flex", gap:10, alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:"#C8C3BB", marginBottom:4 }}>{note.date} · {note.time}</div>
              <div style={{ fontSize:14, color:C.text, lineHeight:1.55 }}>{note.text}</div>
            </div>
            <button onClick={()=>handleDelete(note.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:2, flexShrink:0, marginTop:16 }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#D0CBC3" strokeWidth="1.3"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M1 4h14" stroke="#D0CBC3" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
        {notes.length===0 && (
          <div style={{ textAlign:"center", padding:"48px 0", color:C.muted, fontSize:14 }}>Ni zapiskov. Pritisni mikrofon za dodajanje.</div>
        )}
      </div>
    </div>
  );
}

// Keep IdejeScreen alias for backward compat
function IdejeScreen({ navigate }) { return <NotesScreen navigate={navigate} />; }

// ── Screen: Koledar ───────────────────────────────────────────────────────────
const DAY_TASKS_CAL = {
  16: [{ id:1, title:"Rezervacija poteče — Horvat", time:"10:00", type:"rezervacija", note:"Potrdi ali sprosti fasada jul", urgent:true }],
  23: [{ id:2, title:"Ogled hiše — Petrovič", time:"15:00", type:"task", note:"Dunajska 45" }, { id:3, title:"Sestanek — Kranjc", time:"13:00", type:"task", note:"Pisarna" }],
  24: [{ id:4, title:"Pošlji ponudbo — Horvat", time:"do 17:00", type:"deadline", note:"Fasada", urgent:true }],
  27: [{ id:5, title:"Keramika kopalnica — Novak", time:"cel dan", type:"task", note:"Maribor · 4 dni" }],
};
const TYPE_COLORS_CAL = { task:C.task, deadline:"#D97706", rezervacija:C.rezervacija };

function KoledarScreen({ navigate }) {
  const [selectedDay, setSelectedDay] = React.useState(16);
  const [currentMonth, setCurrentMonth] = React.useState(4);
  const [dropOpen, setDropOpen] = React.useState(true);
  const months = ["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"];
  const year = 2026;
  const firstDay = new Date(year, currentMonth, 1).getDay();
  const daysInMonth = new Date(year, currentMonth+1, 0).getDate();
  const startOffset = (firstDay+6)%7;
  const eventDays = { 16:["rezervacija"], 23:["task","task"], 24:["deadline"], 27:["task"] };
  const tasks = DAY_TASKS_CAL[selectedDay] || [];
  const dayNames = ["Ned","Pon","Tor","Sre","Čet","Pet","Sob"];
  const selDayName = dayNames[new Date(year,currentMonth,selectedDay).getDay()];

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.bg }}>
      <div style={{ padding:"16px 20px 4px" }}>
        <span style={{ fontSize:22, fontWeight:700, color:C.text, letterSpacing:"-0.3px" }}>Koledar</span>
      </div>
      {/* Compact legend */}
      <div style={{ display:"flex", gap:14, padding:"6px 20px 4px" }}>
        {[["Task",C.task],["Deadline",C.deadline],["Rezervacija",C.rezervacija]].map(([l,col])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:col }} />
            <span style={{ fontSize:11, color:C.muted }}>{l}</span>
          </div>
        ))}
      </div>
      {/* Calendar */}
      <div style={{ margin:"10px 20px 0", background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px 8px" }}>
          <button onClick={()=>setCurrentMonth(m=>Math.max(0,m-1))} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:C.muted, fontSize:18 }}>‹</button>
          <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{months[currentMonth]} {year}</span>
          <button onClick={()=>setCurrentMonth(m=>Math.min(11,m+1))} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:C.muted, fontSize:18 }}>›</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 8px" }}>
          {["P","T","S","Č","P","S","N"].map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:11, color:C.muted, fontWeight:600, padding:"4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 8px 10px" }}>
          {Array.from({length:startOffset}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth}).map((_,i)=>{
            const day=i+1;
            const isSel=day===selectedDay;
            const isToday=day===4&&currentMonth===4;
            const dots=eventDays[day]||[];
            return (
              <div key={day} onClick={()=>setSelectedDay(day)} style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"3px 0", cursor:"pointer" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:isSel?C.text:isToday?"#F0EDE8":"transparent", fontSize:13, fontWeight:isSel||isToday?700:400, color:isSel?"#FFF":C.text, transition:"all 0.15s" }}>{day}</div>
                <div style={{ display:"flex", gap:2, marginTop:2, height:5 }}>
                  {dots.slice(0,3).map((t,ci)=><div key={ci} style={{ width:4, height:4, borderRadius:"50%", background:TYPE_COLORS_CAL[t]||C.task }}/>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Day task dropdown */}
      <div style={{ margin:"12px 20px 0", background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <button onClick={()=>setDropOpen(o=>!o)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", background:"none", border:"none", cursor:"pointer" }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, textAlign:"left" }}>{selDayName}, {selectedDay}. {months[currentMonth]}</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:1 }}>{tasks.length===0?"Ni nalog":`${tasks.length} nalog${tasks.length===1?"a":tasks.length<5?"e":""}`}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform:dropOpen?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}>
            <path d="M4 6L8 10L12 6" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {dropOpen && (
          <div style={{ borderTop:`1px solid ${C.border2}` }}>
            {tasks.length===0 ? (
              <div style={{ padding:"20px 16px", textAlign:"center", color:C.muted, fontSize:13 }}>Ni nalog za ta dan</div>
            ) : tasks.map((task,i)=>(
              <div key={task.id} onClick={()=>navigate("task-detail",{taskId:task.id})} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderBottom:i<tasks.length-1?`1px solid #F7F5F2`:"none", cursor:"pointer", background:task.urgent?TYPE_BG[task.type]:"transparent" }}>
                <div style={{ width:38, flexShrink:0, textAlign:"right" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:task.urgent?TYPE_FG[task.type]:C.muted }}>{task.time}</span>
                </div>
                <div style={{ width:2, height:32, background:TYPE_COLORS_CAL[task.type], borderRadius:2, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:task.urgent?TYPE_FG[task.type]:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{task.title}</div>
                  {task.note&&<div style={{ fontSize:12, color:task.urgent?TYPE_FG[task.type]:C.muted, marginTop:2 }}>{task.note}</div>}
                </div>
                <span style={{ fontSize:10, fontWeight:600, color:TYPE_FG[task.type], background:TYPE_BG[task.type], borderRadius:20, padding:"2px 7px", flexShrink:0 }}>{task.type}</span>
              </div>
            ))}
            {tasks.some(t=>t.urgent&&t.type==="rezervacija")&&(
              <div style={{ padding:"10px 16px 12px", borderTop:`1px solid ${C.border2}`, display:"flex", gap:8 }}>
                <button style={{ flex:1, padding:"10px", borderRadius:10, background:C.rezervacija, border:"none", fontSize:13, fontWeight:600, color:"#FFF", cursor:"pointer" }}>Potrdi termin</button>
                <button style={{ flex:1, padding:"10px", borderRadius:10, background:"transparent", border:`1.5px solid ${C.rezervacija}`, fontSize:13, fontWeight:600, color:C.rezervacija, cursor:"pointer" }}>Sprosti</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ height:100 }}/>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function NotesIcon({ size=20, color="#B5B0A8" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="13" height="18" rx="2.5" stroke={color} strokeWidth="1.5"/><path d="M7 7h8M7 11h8M7 15h5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M16 2v4l2-2-2-2z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/></svg>;
}
function HomeIcon({ size=22, color="#B5B0A8" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V15H8V20H4C3.45 20 3 19.55 3 19V9.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}
function CheckSquareIcon({ size=20, color="#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5"/><path d="M7 11L10 14L15 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CalendarIcon({ size=20, color="#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="1.5"/><path d="M7 2V5M15 2V5M2 9H20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function FolderIcon({ size=20, color="#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><path d="M2 7C2 5.34 3.34 4 5 4h3.17c.55 0 1.06.22 1.44.59L11 6h6c1.66 0 3 1.34 3 3v8c0 1.66-1.34 3-3 3H5c-1.66 0-3-1.34-3-3V7z" stroke={color} strokeWidth="1.5"/></svg>;
}
function UsersIcon({ size=20, color="#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><circle cx="8" cy="8" r="3.5" stroke={color} strokeWidth="1.5"/><path d="M2 18c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M16 6c1.38 0 2.5 1.12 2.5 2.5S17.38 11 16 11M20 18c0-2.76-1.79-5.1-4.27-5.82" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────
function TabBar({ activeScreen, navigate }) {
  const tabs = [
    { screen:"dashboard", Icon:HomeIcon, label:null },
    { screen:"taski", Icon:CheckSquareIcon, label:"Taski" },
    { screen:"koledar", Icon:CalendarIcon, label:"Kol." },
    { screen:"projekti", Icon:FolderIcon, label:"Projekti" },
    { screen:"stranke", Icon:UsersIcon, label:"Stranke" },
    { screen:"notes", Icon:NotesIcon, label:"Notes" },
  ];
  return (
    <div style={{ display:"flex", borderTop:`1px solid ${C.border}`, background:C.bg, padding:"8px 0 6px" }}>
      {tabs.map(tab => {
        const isActive = activeScreen===tab.screen || (tab.screen==="dashboard" && !["taski","koledar","projekti","stranke","notes"].includes(activeScreen));
        return (
          <button key={tab.screen} onClick={()=>navigate(tab.screen)} style={{
            flex:1, background:"none", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            padding:"4px 0",
          }}>
            <tab.Icon size={20} color={isActive?C.text:"#B5B0A8"} />
            {tab.label
              ? <span style={{ fontSize:9, color:isActive?C.text:"#B5B0A8", fontWeight:isActive?700:400, letterSpacing:"0.01em" }}>{tab.label}</span>
              : isActive && <div style={{ width:4, height:4, borderRadius:"50%", background:C.text, marginTop:1 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function TaskaroAppV2() {
  const [screen, setScreen] = React.useState("dashboard");
  const [params, setParams] = React.useState({});
  const [showBurst, setShowBurst] = React.useState(false);

  const navigate = (s, p={}) => { setScreen(s); setParams(p); };
  const handleCompletion = () => { setShowBurst(true); };

  const detailScreens = ["task-detail","projekt-detail","stranka-detail"];
  const isDetail = detailScreens.includes(screen);

  const renderScreen = () => {
    switch(screen) {
      case "dashboard": return <DashboardScreen navigate={navigate} onCompletion={handleCompletion} />;
      case "taski": return <TaskiScreen navigate={navigate} onCompletion={handleCompletion} />;
      case "task-detail": return <TaskDetailScreen navigate={navigate} params={params} onCompletion={handleCompletion} />;
      case "projekti": return <ProjektiScreen navigate={navigate} />;
      case "projekt-detail": return <ProjektDetailScreen navigate={navigate} params={params} />;
      case "stranke": return <StrankeScreen navigate={navigate} />;
      case "stranka-detail": return <StrankaDetailScreen navigate={navigate} params={params} />;
      case "ideje": return <NotesScreen navigate={navigate} />;
      case "notes": return <NotesScreen navigate={navigate} />;
      case "koledar": return <KoledarScreen navigate={navigate} />;
      default: return <DashboardScreen navigate={navigate} onCompletion={handleCompletion} />;
    }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", fontFamily:"'DM Sans',sans-serif", position:"relative" }}>
      {renderScreen()}
      {/* Completion burst overlay */}
      {showBurst && <CompletionBurst onDone={()=>setShowBurst(false)} />}
      {/* FAB — always visible except detail screens */}
      {/* Tab bar only — FAB is now inline in dashboard */}
      {!isDetail && <TabBar activeScreen={screen} navigate={navigate} />}
    </div>
  );
}

Object.assign(window, { TaskaroAppV2 });
