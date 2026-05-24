
// Taskaro App — Main component file
// All screens: Dashboard, Taski, Koledar, Projekti, Stranke, Ideje, Task Detail, Projekt Detail, Stranka Detail

// ── Shared data ──────────────────────────────────────────────────────────────
const DATA = {
  user: { name: "Janez", initials: "JK" },
  tasks: [
    { id: 1, title: "Ogled hiše", type: "Ogled", client: "Petrovič, Marko", clientId: 1, status: "Čaka", date: "2026-05-23", time: "15:00", location: "Dunajska 45, Ljubljana", reminder: "1 uro prej", notes: "Kopalnica + predsoba, ~22m². Želi porcelan, svetel ton.", color: "blue" },
    { id: 2, title: "Pošlji ponudbo", type: "Deadline", client: "Horvat", clientId: 2, status: "Čaka", date: "2026-05-24", time: null, location: null, reminder: null, notes: "Fasada — urgentno", color: "orange", isDeadline: true },
    { id: 3, title: "Sestanek — Kranjc", type: "Sestanek", client: "Kranjc", clientId: 3, status: "Čaka", date: "2026-05-23", time: "13:00", location: "Pisarna", reminder: null, notes: null, color: "purple" },
    { id: 4, title: "Keramika kopalnica", type: "Projekt", client: "Novak, Janez", clientId: 4, status: "V teku", date: "2026-05-27", time: null, location: "Maribor", reminder: null, notes: null, color: "green", isProject: true },
    { id: 5, title: "Sestanek — Horvat", type: "Sestanek", client: "Horvat", clientId: 2, status: "Končano", date: "2026-05-21", time: "9:00", location: null, reminder: null, notes: null, color: "purple" },
    { id: 6, title: "Ogled — Kranjc", type: "Ogled", client: "Kranjc", clientId: 3, status: "Končano", date: "2026-05-20", time: null, location: null, reminder: null, notes: null, color: "blue" },
    { id: 7, title: "Ponudba — Novak", type: "Deadline", client: "Novak", clientId: 4, status: "Končano", date: "2026-05-20", time: null, location: null, reminder: null, notes: "poslano", color: "orange" },
  ],
  projekti: [
    { id: 1, title: "Keramika kopalnica", clientId: 4, client: "Novak, Janez", start: "27. maj", end: "30. maj", location: "Maribor", status: "Aktivno", statusColor: "green", obseg: "18m²", taskiIds: [1, 2, 4], dokumenti: ["Ponudba.pdf", "Kopalnica.jpg"], color: "#2DB87A" },
    { id: 2, title: "Ogled — jan 2026", clientId: 4, client: "Novak, Janez", start: "jan 2026", end: null, location: null, status: "Končano", statusColor: "gray", obseg: null, taskiIds: [6], dokumenti: ["Ogled.pdf"], color: "#aaa" },
    { id: 3, title: "Fasada Horvat", clientId: 2, client: "Horvat", start: "15. jul", end: "18. jul", location: null, status: "Rezervirano", statusColor: "amber", obseg: null, taskiIds: [2], dokumenti: [], color: "#F59E0B" },
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
    { id: 5, text: "Preveriti zavarovanje za naslednje leto — poteče v avgustu", date: "15. maj", time: "14:47" },
  ],
  todayEvents: [
    { id: 1, title: "Ogled — Kovač", time: "10:00", color: "blue" },
    { id: 2, title: "Pošlji ponudbo — Novak", time: "do 17:00", color: "orange", isDeadline: true },
    { id: 3, title: "Sestanek — Kranjc", time: "14:00", color: "purple" },
    { id: 4, title: "Keramika — Novak", time: "cel dan", color: "green" },
  ],
};

const COLORS = {
  blue: "#3B82F6",
  purple: "#8B5CF6",
  green: "#2DB87A",
  orange: "#F59E0B",
  amber: "#F59E0B",
  red: "#EF4444",
  gray: "#9CA3AF",
  // new 3-type system
  task: "#3B82F6",
  deadline: "#EF4444",
  rezervacija: "#8B5CF6",
};

const COLOR_BG = {
  blue: "#EFF6FF",
  purple: "#F5F3FF",
  green: "#ECFDF5",
  orange: "#FFFBEB",
  amber: "#FFFBEB",
  gray: "#F3F4F6",
};

// ── Shared UI components ──────────────────────────────────────────────────────

function NavBar({ title, onBack, backLabel = "nazaj", rightLabel, onRight, rightColor }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 20px 10px", borderBottom: "1px solid #F0EDE8",
      background: "#FAFAF7",
    }}>
      {onBack ? (
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#6B6560", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="#6B6560" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {backLabel}
        </button>
      ) : <div style={{ width: 60 }} />}
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1714", letterSpacing: "-0.2px" }}>{title}</span>
      {rightLabel ? (
        <button onClick={onRight} style={{ background: "none", border: "none", color: rightColor || "#6B6560", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
          {rightLabel}
        </button>
      ) : <div style={{ width: 60 }} />}
    </div>
  );
}

function ColorDot({ color, size = 8 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: COLORS[color] || color, flexShrink: 0 }} />;
}

function StatusBadge({ label, color }) {
  const bg = color === "green" ? "#D1FAE5" : color === "amber" ? "#FEF3C7" : color === "gray" ? "#F3F4F6" : "#F0EDE8";
  const fg = color === "green" ? "#065F46" : color === "amber" ? "#92400E" : color === "gray" ? "#6B7280" : "#6B6560";
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, background: bg, color: fg, fontSize: 12, fontWeight: 500 }}>
      {label}
    </span>
  );
}

function AddButton({ onClick, label = "+ dodaj" }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "1px solid #E8E4DE", borderRadius: 20,
      padding: "4px 12px", fontSize: 12, color: "#6B6560", cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif",
    }}>{label}</button>
  );
}

function SectionHeader({ label, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#9B968F", textTransform: "uppercase" }}>{label}</span>
      {action && <AddButton onClick={onAction} label={action} />}
    </div>
  );
}

function TaskRow({ task, onClick, showCheck, onCheck }) {
  const isDone = task.status === "Končano";
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 0", borderBottom: "1px solid #F0EDE8", cursor: "pointer",
      transition: "background 0.15s",
    }}>
      <ColorDot color={task.color} size={9} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: isDone ? "#B5B0A8" : "#1A1714", textDecoration: isDone ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {task.title}{task.client && !task.title.includes(task.client.split(",")[0]) ? ` — ${task.client.split(",")[0]}` : ""}
        </div>
        <div style={{ fontSize: 12, color: "#9B968F", marginTop: 1 }}>
          {task.time || (task.isDeadline ? `do ${task.notes || ""}` : "")}
          {task.location && <span> · {task.location}</span>}
          {isDone && task.notes && <span> · {task.notes}</span>}
        </div>
      </div>
      {showCheck ? (
        <button onClick={e => { e.stopPropagation(); onCheck && onCheck(task.id); }} style={{
          width: 24, height: 24, borderRadius: "50%",
          border: isDone ? "none" : "1.5px solid #D0CBC3",
          background: isDone ? COLORS[task.color] : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
        }}>
          {isDone && <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
      ) : (
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#C8C3BB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      )}
    </div>
  );
}

// ── MicButton — shared pulsing microphone CTA ────────────────────────────────
function MicButton({ size = 32, onClick }) {
  const [active, setActive] = React.useState(false);
  const handleClick = () => {
    setActive(true);
    setTimeout(() => setActive(false), 2000);
    onClick && onClick();
  };
  return (
    <button onClick={handleClick} style={{
      width: size, height: size, borderRadius: "50%", border: "none", cursor: "pointer",
      background: active ? "#EF4444" : "#1A1714",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: active ? "0 0 0 4px rgba(239,68,68,0.2)" : "none",
      transition: "all 0.2s",
      position: "relative",
    }}>
      {active && (
        <div style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          border: "2px solid rgba(239,68,68,0.4)",
          animation: "mic-pulse 1s ease-out infinite",
        }} />
      )}
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <rect x="5" y="1" width="6" height="9" rx="3" stroke="white" strokeWidth="1.4"/>
        <path d="M3 8C3 10.76 5.24 13 8 13s5-2.24 5-5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M8 13V15M6 15H10" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

// ── DayTaskDropdown — calendar day tasks as expandable list ──────────────────
// blue=#3B82F6 Task, red=#EF4444 Deadline, purple=#8B5CF6 Rezervacija
const TYPE_COLORS = {
  task: "#3B82F6",
  deadline: "#EF4444",
  rezervacija: "#8B5CF6",
};
const TYPE_BG = {
  task: "#EFF6FF",
  deadline: "#FEF2F2",
  rezervacija: "#F5F3FF",
};
const TYPE_FG = {
  task: "#1D4ED8",
  deadline: "#991B1B",
  rezervacija: "#5B21B6",
};

const DAY_TASKS = {
  16: [
    { id: 1, title: "Rezervacija poteče — Horvat", time: "10:00", type: "rezervacija", note: "Potrdi ali sprosti fasada jul", urgent: true },
  ],
  23: [
    { id: 2, title: "Ogled hiše — Petrovič", time: "15:00", type: "task", note: "Dunajska 45, Ljubljana" },
    { id: 3, title: "Sestanek — Kranjc", time: "13:00", type: "task", note: "Pisarna" },
  ],
  24: [
    { id: 4, title: "Pošlji ponudbo — Horvat", time: "do 17:00", type: "deadline", note: "Fasada — urgentno", urgent: true },
  ],
  27: [
    { id: 5, title: "Keramika kopalnica — Novak", time: "cel dan", type: "task", note: "Maribor · 4 dni" },
  ],
};

function DayTaskDropdown({ selectedDay, currentMonth, months, year, navigate }) {
  const [open, setOpen] = React.useState(true);
  const tasks = DAY_TASKS[selectedDay] || [];
  const dayNames = ["Ned","Pon","Tor","Sre","Čet","Pet","Sob"];
  const dayName = dayNames[new Date(year, currentMonth, selectedDay).getDay()];

  return (
    <div style={{ margin: "12px 20px 0", background: "#FFF", border: "1px solid #EDE9E2", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      {/* Header — clickable to collapse */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 16px", background: "none", border: "none", cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1714" }}>{dayName}, {selectedDay}. {months[currentMonth]}</div>
            <div style={{ fontSize: 12, color: "#9B968F", marginTop: 1 }}>
              {tasks.length === 0 ? "Ni nalog" : `${tasks.length} nalog${tasks.length === 1 ? "a" : tasks.length < 5 ? "e" : ""}`}
            </div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <path d="M4 6L8 10L12 6" stroke="#9B968F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Task list */}
      {open && (
        <div style={{ borderTop: "1px solid #F0EDE8" }}>
          {tasks.length === 0 ? (
            <div style={{ padding: "20px 16px", textAlign: "center", color: "#9B968F", fontSize: 13 }}>
              Ni nalog za ta dan
            </div>
          ) : tasks.map((task, i) => (
            <div key={task.id} onClick={() => navigate("task-detail", { taskId: task.id })} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
              borderBottom: i < tasks.length - 1 ? "1px solid #F7F5F2" : "none",
              cursor: "pointer",
              background: task.urgent ? TYPE_BG[task.type] : "transparent",
            }}>
              {/* Time */}
              <div style={{ width: 44, flexShrink: 0, textAlign: "right" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: task.urgent ? TYPE_FG[task.type] : "#9B968F" }}>{task.time}</span>
              </div>
              {/* Type accent line */}
              <div style={{ width: 2, height: 32, background: TYPE_COLORS[task.type], borderRadius: 2, flexShrink: 0 }} />
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: task.urgent ? TYPE_FG[task.type] : "#1A1714", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {task.title}
                </div>
                {task.note && (
                  <div style={{ fontSize: 12, color: task.urgent ? TYPE_FG[task.type] : "#9B968F", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {task.note}
                  </div>
                )}
              </div>
              {/* Type badge */}
              <span style={{ fontSize: 10, fontWeight: 600, color: TYPE_FG[task.type], background: TYPE_BG[task.type], borderRadius: 20, padding: "2px 7px", flexShrink: 0, textTransform: "capitalize" }}>{task.type}</span>
            </div>
          ))}
          {/* Urgent action if needed */}
          {tasks.some(t => t.urgent && t.type === "rezervacija") && (
            <div style={{ padding: "10px 16px 12px", borderTop: "1px solid #F0EDE8", display: "flex", gap: 8 }}>
              <button style={{ flex: 1, padding: "10px", borderRadius: 10, background: TYPE_COLORS.rezervacija, border: "none", fontSize: 13, fontWeight: 600, color: "#FFF", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Potrdi termin</button>
              <button style={{ flex: 1, padding: "10px", borderRadius: 10, background: "transparent", border: `1.5px solid ${TYPE_COLORS.rezervacija}`, fontSize: 13, fontWeight: 600, color: TYPE_COLORS.rezervacija, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Sprosti</button>
            </div>
          )}
          {tasks.some(t => t.urgent && t.type === "deadline") && (
            <div style={{ padding: "10px 16px 12px", borderTop: "1px solid #F0EDE8" }}>
              <div style={{ fontSize: 12, color: TYPE_FG.deadline, textAlign: "center", marginBottom: 6 }}>Deadline danes!</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add mic pulse animation to head once
if (!document.getElementById('mic-pulse-style')) {
  const s = document.createElement('style');
  s.id = 'mic-pulse-style';
  s.textContent = '@keyframes mic-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }';
  document.head.appendChild(s);
}

// ── Screen: Dashboard ─────────────────────────────────────────────────────────
function DashboardScreen({ navigate }) {
  const today = new Date();
  const dayName = ["Nedelja","Ponedeljek","Torek","Sreda","Četrtek","Petek","Sobota"][today.getDay()];
  const dateStr = `${today.getDate()}. ${["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"][today.getMonth()]} ${today.getFullYear()}`;
  const [searchVal, setSearchVal] = React.useState("");
  const navItems = [
    { icon: CalendarIcon, label: "Koledar", screen: "koledar" },
    { icon: CheckSquareIcon, label: "Taski", screen: "taski" },
    { icon: FolderIcon, label: "Projekti", screen: "projekti" },
    { icon: UsersIcon, label: "Stranke", screen: "stranke" },
    { icon: LightbulbIcon, label: "Ideje", screen: "ideje" },
    { icon: SettingsIcon, label: "Nastavitve", screen: null },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #F0EDE8" }}>
        <div style={{ fontSize: 12, color: "#9B968F", marginBottom: 4 }}>{dayName}, {dateStr}</div>
        <div style={{ fontSize: 13, color: "#6B6560", fontWeight: 400 }}>Dober dan,</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.5px", fontFamily: "'DM Serif Display', serif", lineHeight: 1.15 }}>Janez</div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#9B968F" }}>
          <span style={{ color: "#2DB87A", fontWeight: 600 }}>4 naloge</span> danes · <span style={{ color: "#F59E0B", fontWeight: 600 }}>1 deadline</span>
        </div>
      </div>
      {/* Search + Mic */}
      <div style={{ padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0EDE8", borderRadius: 14, padding: "10px 10px 10px 14px" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9B968F" strokeWidth="1.5"/><path d="M11 11L14 14" stroke="#9B968F" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Kaj moram narediti..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, color: "#1A1714", fontFamily: "'DM Sans', sans-serif" }}
          />
          {searchVal ? (
            <button onClick={() => setSearchVal("")} style={{ background: "#6B6560", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          ) : (
            <MicButton />
          )}
        </div>
      </div>
      {/* Nav Grid */}
      <div style={{ padding: "4px 20px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {navItems.map(item => (
          <button key={item.label} onClick={() => item.screen && navigate(item.screen)} style={{
            background: "#FFF", border: "1px solid #EDE9E2", borderRadius: 14,
            padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#D0CBC3"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#EDE9E2"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
            <item.icon size={22} color="#4A4540" />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#4A4540" }}>{item.label}</span>
          </button>
        ))}
      </div>
      {/* Today's tasks */}
      <div style={{ padding: "0 20px 24px", flex: 1 }}>
        <SectionHeader label="Danes" />
        {DATA.todayEvents.map(ev => (
          <div key={ev.id} onClick={() => navigate("task-detail", { taskId: ev.id })} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #F0EDE8", cursor: "pointer",
          }}>
            <ColorDot color={ev.color} size={9} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#1A1714" }}>{ev.title}</div>
              <div style={{ fontSize: 12, color: "#9B968F", marginTop: 1 }}>{ev.time}</div>
            </div>
            {ev.isDeadline && (
              <span style={{ fontSize: 11, fontWeight: 600, color: "#F59E0B", background: "#FEF3C7", borderRadius: 20, padding: "2px 8px" }}>Deadline</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Taski ─────────────────────────────────────────────────────────────
function TaskiScreen({ navigate }) {
  const [filter, setFilter] = React.useState("Danes");
  const filters = ["Danes", "Prihajajoči", "Končani"];
  const today = "2026-05-23";
  const getFiltered = () => {
    if (filter === "Danes") return DATA.tasks.filter(t => t.date === today && t.status !== "Končano");
    if (filter === "Prihajajoči") return DATA.tasks.filter(t => t.date > today && t.status !== "Končano");
    return DATA.tasks.filter(t => t.status === "Končano");
  };
  const tasks = getFiltered();
  const groupByDate = (tasks) => {
    const groups = {};
    tasks.forEach(t => {
      const key = t.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return Object.entries(groups).sort(([a],[b]) => a.localeCompare(b));
  };
  const groups = groupByDate(tasks);
  const formatDate = (d) => {
    const parts = d.split("-");
    const day = parseInt(parts[2]);
    const months = ["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"];
    return `${day}. ${months[parseInt(parts[1])-1].toUpperCase()}`;
  };
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px" }}>Taski</span>
        <button onClick={() => navigate("new-task")} style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1714", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, padding: "8px 20px 16px" }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 16px", borderRadius: 20, fontSize: 14, fontWeight: 500,
            background: filter === f ? "#1A1714" : "#F0EDE8",
            color: filter === f ? "#FFF" : "#6B6560",
            border: "none", cursor: "pointer", transition: "all 0.15s",
            fontFamily: "'DM Sans', sans-serif",
          }}>{f}</button>
        ))}
      </div>
      {/* Task groups */}
      <div style={{ padding: "0 20px 24px" }}>
        {groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9B968F", fontSize: 14 }}>Ni nalog za ta pogled</div>
        ) : groups.map(([date, tasksInGroup]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9B968F", letterSpacing: "0.08em", marginBottom: 4 }}>{formatDate(date)}</div>
            {tasksInGroup.map(task => (
              <TaskRow key={task.id} task={task} onClick={() => navigate("task-detail", { taskId: task.id })} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Task Detail ───────────────────────────────────────────────────────
function TaskDetailScreen({ navigate, params }) {
  const task = DATA.tasks.find(t => t.id === (params?.taskId || 1)) || DATA.tasks[0];
  const client = DATA.stranke.find(s => s.id === task.clientId);
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <NavBar title="Task" onBack={() => navigate("taski")} backLabel="nazaj" rightLabel="Uredi" onRight={() => {}} />
      <div style={{ padding: "20px 20px 32px" }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: COLOR_BG[task.color], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={COLORS[task.color]} strokeWidth="1.5"/><path d="M6 9L8 11L12 7" stroke={COLORS[task.color]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{task.title}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <StatusBadge label={task.type} color="gray" />
                <StatusBadge label={task.status} color={task.status === "Končano" ? "green" : task.status === "V teku" ? "amber" : "gray"} />
              </div>
            </div>
          </div>
          <button style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #D0CBC3", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4 }}>
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M1 5.5L5.5 10L13 1" stroke="#2DB87A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        {/* Detail rows */}
        {[
          { icon: CalendarDetailIcon, label: "Datum in čas", value: `${task.date?.split("-").reverse().slice(0,2).join(". ")} ${task.date?.split("-")[0]}${task.time ? `, ${task.time}` : ""}` },
          { icon: UserDetailIcon, label: "Stranka", value: task.client, isLink: true, onClick: () => navigate("stranka-detail", { strankaId: task.clientId }) },
          task.location && { icon: LocationIcon, label: "Lokacija", value: task.location },
          task.reminder && { icon: BellIcon, label: "Opomnik", value: task.reminder },
        ].filter(Boolean).map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #F0EDE8" }}>
            <div style={{ width: 20, display: "flex", justifyContent: "center", marginTop: 1, flexShrink: 0 }}>
              <row.icon size={16} color="#9B968F" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9B968F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{row.label}</div>
              {row.isLink ? (
                <button onClick={row.onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: COLORS.green, fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                  {row.value} →
                </button>
              ) : (
                <div style={{ fontSize: 15, color: "#1A1714" }}>{row.value}</div>
              )}
            </div>
          </div>
        ))}
        {task.notes && (
          <div style={{ padding: "14px 0", borderBottom: "1px solid #F0EDE8" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9B968F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Opombe</div>
            <div style={{ fontSize: 15, color: "#1A1714", lineHeight: 1.5 }}>{task.notes}</div>
          </div>
        )}
        {/* Docs */}
        <div style={{ paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9B968F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Slike / dokumenti</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[1,2].map(i => (
              <div key={i} style={{ width: 72, height: 72, borderRadius: 12, background: "#F0EDE8", border: "1px solid #E8E4DE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="#C8C3BB" strokeWidth="1.4"/><circle cx="7.5" cy="7.5" r="1.5" fill="#C8C3BB"/><path d="M3 13L7 9L10 12L13 9L17 13" stroke="#C8C3BB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            ))}
            <div style={{ width: 72, height: 72, borderRadius: 12, background: "transparent", border: "1.5px dashed #D0CBC3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="#C8C3BB" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          <button style={{ flex: 1, padding: "14px", borderRadius: 14, background: "#F0EDE8", border: "none", fontSize: 15, fontWeight: 600, color: "#4A4540", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Prestavi
          </button>
          <button style={{ flex: 1, padding: "14px", borderRadius: 14, background: "#FEE2E2", border: "none", fontSize: 15, fontWeight: 600, color: "#EF4444", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Briši
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Projekti ──────────────────────────────────────────────────────────
function ProjektiScreen({ navigate }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px" }}>Projekti</span>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1714", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div style={{ padding: "8px 20px 24px" }}>
        {/* Active */}
        <SectionHeader label="Aktivni" />
        {DATA.projekti.filter(p => p.status === "Aktivno").map(p => (
          <ProjectCard key={p.id} projekt={p} onClick={() => navigate("projekt-detail", { projektId: p.id })} />
        ))}
        {/* Reserved */}
        <div style={{ marginTop: 20 }}>
          <SectionHeader label="Rezervirani" />
          {DATA.projekti.filter(p => p.status === "Rezervirano").map(p => (
            <ProjectCard key={p.id} projekt={p} onClick={() => navigate("projekt-detail", { projektId: p.id })} />
          ))}
        </div>
        {/* Finished */}
        <div style={{ marginTop: 20 }}>
          <SectionHeader label="Zaključeni" />
          {DATA.projekti.filter(p => p.status === "Končano").map(p => (
            <ProjectCard key={p.id} projekt={p} onClick={() => navigate("projekt-detail", { projektId: p.id })} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ projekt, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#FFF", border: "1px solid #EDE9E2", borderRadius: 16, padding: "14px 16px",
      marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, alignItems: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}>
      <div style={{ width: 4, height: 48, borderRadius: 4, background: projekt.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1714" }}>{projekt.title}</div>
        <div style={{ fontSize: 12, color: "#9B968F", marginTop: 2 }}>
          {projekt.start}{projekt.end && ` – ${projekt.end}`}{projekt.obseg && ` · ${projekt.obseg}`}
        </div>
        <div style={{ fontSize: 12, color: "#9B968F", marginTop: 1 }}>
          {projekt.taskiIds.length} task{projekt.taskiIds.length !== 1 ? "i" : ""} · {projekt.dokumenti.length} dokument{projekt.dokumenti.length !== 1 ? "i" : ""}
        </div>
      </div>
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#C8C3BB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}

// ── Screen: Projekt Detail ────────────────────────────────────────────────────
function ProjektDetailScreen({ navigate, params }) {
  const projekt = DATA.projekti.find(p => p.id === (params?.projektId || 1)) || DATA.projekti[0];
  const client = DATA.stranke.find(s => s.id === projekt.taskiIds[0]); // approx
  const tasks = DATA.tasks.filter(t => projekt.taskiIds.includes(t.id));
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <NavBar title="Projekt" onBack={() => navigate("projekti")} backLabel="Novak" rightLabel="Uredi" onRight={() => {}} />
      <div style={{ padding: "20px 20px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 4, borderRadius: 4, background: projekt.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{projekt.title}</div>
            <div style={{ fontSize: 13, color: "#9B968F", marginTop: 4 }}>
              {projekt.start}{projekt.end && ` – ${projekt.end}`}{projekt.location && ` · ${projekt.location}`}
            </div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge label={projekt.status} color={projekt.statusColor} />
            </div>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { value: tasks.length, label: "taski" },
            { value: projekt.dokumenti.length, label: "dokumenti" },
            { value: projekt.obseg || "—", label: "obseg" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#F0EDE8", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1A1714" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#9B968F", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Tasks */}
        <SectionHeader label="Taski" action="+ dodaj" />
        {tasks.map(task => (
          <div key={task.id} onClick={() => navigate("task-detail", { taskId: task.id })} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderBottom: "1px solid #F0EDE8", cursor: "pointer",
          }}>
            <ColorDot color={task.color} size={9} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: task.status === "Končano" ? "#B5B0A8" : "#1A1714", textDecoration: task.status === "Končano" ? "line-through" : "none" }}>{task.title}</div>
              <div style={{ fontSize: 12, color: "#9B968F" }}>{task.date?.split("-").slice(1).reverse().join(". ")} {task.time && `· ${task.time}`} · {task.status}</div>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: task.status === "Končano" ? "none" : "1.5px solid #D0CBC3", background: task.status === "Končano" ? COLORS[task.color] : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {task.status === "Končano" && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L3.5 6.5L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          </div>
        ))}
        {/* Documents */}
        <div style={{ marginTop: 24 }}>
          <SectionHeader label="Dokumenti" action="+ dodaj" />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {projekt.dokumenti.map((doc, i) => (
              <div key={i} style={{ background: "#FFF", border: "1px solid #EDE9E2", borderRadius: 12, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="10" height="14" rx="2" stroke="#9B968F" strokeWidth="1.3"/><path d="M5 5H9M5 8H9M5 11H7" stroke="#9B968F" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1714" }}>{doc}</div>
                </div>
              </div>
            ))}
            <div style={{ width: 44, height: 44, background: "transparent", border: "1.5px dashed #D0CBC3", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="#C8C3BB" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          <button style={{ flex: 2, padding: "14px", borderRadius: 14, background: "#1A1714", border: "none", fontSize: 15, fontWeight: 600, color: "#FFF", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Zaključi projekt
          </button>
          <button style={{ flex: 1, padding: "14px", borderRadius: 14, background: "#FEE2E2", border: "none", fontSize: 15, fontWeight: 600, color: "#EF4444", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Briši
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Stranke ───────────────────────────────────────────────────────────
function StrankeScreen({ navigate }) {
  const [search, setSearch] = React.useState("");
  const filtered = DATA.stranke.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px" }}>Stranke</span>
        <button style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1714", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M1 7H13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div style={{ padding: "8px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0EDE8", borderRadius: 12, padding: "10px 14px" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9B968F" strokeWidth="1.5"/><path d="M11 11L14 14" stroke="#9B968F" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Išči stranke..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 14, color: "#1A1714", fontFamily: "'DM Sans', sans-serif" }} />
        </div>
      </div>
      <div style={{ padding: "4px 20px 24px" }}>
        {filtered.map(s => (
          <div key={s.id} onClick={() => navigate("stranka-detail", { strankaId: s.id })} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #F0EDE8", cursor: "pointer",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#E8E4DE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B6560" }}>{s.initials}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1714" }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "#9B968F", marginTop: 1 }}>{s.phone}{s.email && ` · ${s.email}`}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {s.projektiIds.length > 0 && <span style={{ fontSize: 11, color: COLORS.green, fontWeight: 600 }}>{s.projektiIds.length} proj.</span>}
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="#C8C3BB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Stranka Detail ────────────────────────────────────────────────────
function StrankaDetailScreen({ navigate, params }) {
  const stranka = DATA.stranke.find(s => s.id === (params?.strankaId || 4)) || DATA.stranke[3];
  const projekti = DATA.projekti.filter(p => stranka.projektiIds.includes(p.id));
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <NavBar title="Stranka" onBack={() => navigate("stranke")} backLabel="nazaj" rightLabel="Uredi" onRight={() => {}} />
      <div style={{ padding: "20px 20px 32px" }}>
        {/* Profile */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E8E4DE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#6B6560" }}>{stranka.initials}</span>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px" }}>{stranka.name}</div>
            <div style={{ fontSize: 13, color: "#9B968F", marginTop: 2 }}>{stranka.phone}{stranka.email && ` · ${stranka.email}`}</div>
          </div>
        </div>
        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 12, background: "#F0EDE8", border: "none", fontSize: 14, fontWeight: 500, color: "#4A4540", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3.5C3 2.67 3.67 2 4.5 2h1.118c.31 0 .582.19.693.48l.87 2.26a.75.75 0 01-.17.82L5.8 6.77a8.04 8.04 0 003.43 3.43l1.21-1.21a.75.75 0 01.82-.17l2.26.87c.29.11.48.38.48.69V11.5c0 .83-.67 1.5-1.5 1.5C5.82 13 3 10.18 3 3.5z" stroke="#4A4540" strokeWidth="1.3"/></svg>
            Klici
          </button>
          <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 12, background: "#F0EDE8", border: "none", fontSize: 14, fontWeight: 500, color: "#4A4540", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="10" rx="2" stroke="#4A4540" strokeWidth="1.3"/><path d="M1.5 5.5L8 9L14.5 5.5" stroke="#4A4540" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Email
          </button>
        </div>
        {/* Projects */}
        <SectionHeader label="Projekti" action="+ nov" />
        {projekti.map(p => (
          <ProjectCard key={p.id} projekt={p} onClick={() => navigate("projekt-detail", { projektId: p.id })} />
        ))}
        {projekti.length === 0 && (
          <div style={{ color: "#9B968F", fontSize: 14, textAlign: "center", padding: "24px 0" }}>Ni projektov</div>
        )}
      </div>
    </div>
  );
}

// ── Screen: Ideje ─────────────────────────────────────────────────────────────
function IdejeScreen({ navigate }) {
  const [text, setText] = React.useState("");
  const [ideje, setIdeje] = React.useState(DATA.ideje);
  const [saved, setSaved] = React.useState(false);
  const handleSave = () => {
    if (!text.trim()) return;
    const newIdeja = { id: Date.now(), text: text.trim(), date: "danes", time: new Date().toTimeString().slice(0,5) };
    setIdeje([newIdeja, ...ideje]);
    setText("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const handleDelete = (id) => setIdeje(ideje.filter(i => i.id !== id));
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <div style={{ padding: "16px 20px 12px" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px" }}>Ideje</span>
      </div>
      {/* Input card */}
      <div style={{ margin: "0 20px 16px", background: "#FFF", border: "1px solid #EDE9E2", borderRadius: 16, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Zapiši ali povej idejo..."
          style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 15, color: "#1A1714", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, minHeight: 60, background: "transparent", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9.5L3 14a1 1 0 001 1h10a1 1 0 001-1V9.5M9 3v9M9 3L6 6M9 3L12 6" stroke="#9B968F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <MicButton size={34} />
          </div>
          <button onClick={handleSave} style={{
            background: saved ? "#2DB87A" : "#1A1714", border: "none", borderRadius: 10,
            padding: "8px 18px", fontSize: 14, fontWeight: 600, color: "#FFF",
            cursor: "pointer", transition: "background 0.3s", fontFamily: "'DM Sans', sans-serif",
          }}>
            {saved ? "✓ Shranjeno" : "Shrani"}
          </button>
        </div>
      </div>
      {/* History */}
      <div style={{ padding: "0 20px 24px" }}>
        <SectionHeader label="Zgodovina" />
        {ideje.map(ideja => (
          <div key={ideja.id} style={{ padding: "12px 0", borderBottom: "1px solid #F0EDE8", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "#B5B0A8", marginBottom: 4 }}>{ideja.date}, {ideja.time}</div>
              <div style={{ fontSize: 14, color: "#1A1714", lineHeight: 1.5 }}>{ideja.text}</div>
            </div>
            <button onClick={() => handleDelete(ideja.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", flexShrink: 0, marginTop: 14 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#D0CBC3" strokeWidth="1.3"/><path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M1 4h14" stroke="#D0CBC3" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Koledar ───────────────────────────────────────────────────────────
function KoledarScreen({ navigate }) {
  const [selectedDay, setSelectedDay] = React.useState(16);
  const [currentMonth, setCurrentMonth] = React.useState(4); // 0-indexed May
  const months = ["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"];
  const year = 2026;
  const firstDay = new Date(year, currentMonth, 1).getDay();
  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7; // Monday start
  // blue=Task, red=Deadline, purple=Rezervacija
  const eventDays = { 16: ["rezervacija"], 23: ["task","task"], 24: ["deadline"], 27: ["task"] };
  const dayEvents = [
    { id: 1, title: "Rezervacija poteče — Horvat", time: "10:00", subtext: "Potrdi ali sprosti fasada jul", color: "orange", urgent: true },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#FAFAF7" }}>
      <div style={{ padding: "16px 20px 8px" }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#1A1714", letterSpacing: "-0.3px" }}>Koledar</span>
      </div>
      {/* Legend — 3 types only */}
      <div style={{ display: "flex", gap: 14, padding: "8px 20px 4px" }}>
        {[["Task","#3B82F6"],["Deadline","#EF4444"],["Rezervacija","#8B5CF6"]].map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: 11, color: "#9B968F" }}>{label}</span>
          </div>
        ))}
      </div>
      {/* Month nav */}
      <div style={{ margin: "12px 20px 0", background: "#FFF", border: "1px solid #EDE9E2", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
          <button onClick={() => setCurrentMonth(m => Math.max(0, m-1))} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9B968F" }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1714" }}>{months[currentMonth]} {year}</span>
          <button onClick={() => setCurrentMonth(m => Math.min(11, m+1))} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9B968F" }}>›</button>
        </div>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 8px" }}>
          {["P","T","S","Č","P","S","N"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 11, color: "#9B968F", fontWeight: 600, padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 8px 12px" }}>
          {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = day === selectedDay;
            const isToday = day === 4 && currentMonth === 4;
            const dots = eventDays[day] || [];
            return (
              <div key={day} onClick={() => setSelectedDay(day)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0", cursor: "pointer" }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSelected ? "#1A1714" : isToday ? "#F0EDE8" : "transparent",
                  fontSize: 13, fontWeight: isSelected || isToday ? 700 : 400,
                  color: isSelected ? "#FFF" : "#1A1714",
                  transition: "all 0.15s",
                }}>{day}</div>
                <div style={{ display: "flex", gap: 2, marginTop: 2, height: 5 }}>
                  {dots.slice(0, 3).map((c, ci) => <div key={ci} style={{ width: 4, height: 4, borderRadius: "50%", background: TYPE_COLORS[c] || COLORS[c] || c }} />)}
                </div>
              </div>
            );
          })}
        </div>
        {/* Selected day callout */}
        {eventDays[selectedDay] && (() => {
          const types = eventDays[selectedDay];
          const hasDeadline = types.includes("deadline");
          const hasRezervacija = types.includes("rezervacija");
          const type = hasDeadline ? "deadline" : hasRezervacija ? "rezervacija" : "task";
          return (
            <div style={{ margin: "0 12px 12px", background: TYPE_BG[type], border: `1px solid ${TYPE_COLORS[type]}33`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TYPE_FG[type] }}>
                {hasDeadline ? "Deadline — Horvat fasada" : hasRezervacija ? "Rezervacija poteče — Horvat" : "Naloge ta dan"}
              </div>
              <div style={{ fontSize: 12, color: TYPE_FG[type], opacity: 0.8, marginTop: 2 }}>
                {selectedDay}. maj · {DAY_TASKS[selectedDay]?.length || 0} nalog
              </div>
            </div>
          );
        })()}
      </div>
      {/* Day task dropdown */}
      <DayTaskDropdown selectedDay={selectedDay} currentMonth={currentMonth} months={months} year={year} navigate={navigate} />
      <div style={{ height: 24 }} />
    </div>
  );
}

// ── Icon components (inline SVG) ──────────────────────────────────────────────
function CalendarIcon({ size = 20, color = "#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="18" height="16" rx="3" stroke={color} strokeWidth="1.5"/><path d="M7 2V5M15 2V5M2 9H20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function CheckSquareIcon({ size = 20, color = "#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="18" height="18" rx="4" stroke={color} strokeWidth="1.5"/><path d="M7 11L10 14L15 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function FolderIcon({ size = 20, color = "#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><path d="M2 7C2 5.34 3.34 4 5 4h3.17c.55 0 1.06.22 1.44.59L11 6h6c1.66 0 3 1.34 3 3v8c0 1.66-1.34 3-3 3H5c-1.66 0-3-1.34-3-3V7z" stroke={color} strokeWidth="1.5"/></svg>;
}
function UsersIcon({ size = 20, color = "#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><circle cx="8" cy="8" r="3.5" stroke={color} strokeWidth="1.5"/><path d="M2 18c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M16 6c1.38 0 2.5 1.12 2.5 2.5S17.38 11 16 11M20 18c0-2.76-1.79-5.1-4.27-5.82" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function LightbulbIcon({ size = 20, color = "#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><path d="M11 3C7.69 3 5 5.69 5 9c0 2.21 1.2 4.14 3 5.19V16a1 1 0 001 1h4a1 1 0 001-1v-1.81C15.8 13.14 17 11.21 17 9c0-3.31-2.69-6-6-6z" stroke={color} strokeWidth="1.5"/><path d="M8 18h6M9 20h4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function SettingsIcon({ size = 20, color = "#4A4540" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3" stroke={color} strokeWidth="1.5"/><path d="M11 2v2M11 18v2M2 11h2M18 11h2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M4.22 17.78l1.42-1.42M16.36 5.64l1.42-1.42" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function CalendarDetailIcon({ size = 16, color = "#9B968F" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11" rx="2" stroke={color} strokeWidth="1.3"/><path d="M5 1.5V3.5M11 1.5V3.5M1.5 6.5H14.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function UserDetailIcon({ size = 16, color = "#9B968F" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.3"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
}
function LocationIcon({ size = 16, color = "#9B968F" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 2C5.24 2 3 4.24 3 7c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke={color} strokeWidth="1.3"/><circle cx="8" cy="7" r="1.5" stroke={color} strokeWidth="1.3"/></svg>;
}
function BellIcon({ size = 16, color = "#9B968F" }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none"><path d="M8 2C5.24 2 3 4.69 3 7v4l-1 1.5h12L13 11V7c0-2.31-2.24-5-5-5z" stroke={color} strokeWidth="1.3"/><path d="M6.5 13.5C6.5 14.33 7.17 15 8 15s1.5-.67 1.5-1.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
}

// ── Bottom Tab Bar ────────────────────────────────────────────────────────────
function TabBar({ activeScreen, navigate }) {
  const tabs = [
    { screen: "dashboard", Icon: HomeIcon, label: null },
    { screen: "taski", Icon: CheckSquareIcon, label: "Taski" },
    { screen: "koledar", Icon: CalendarIcon, label: "Koledar" },
    { screen: "projekti", Icon: FolderIcon, label: "Projekti" },
    { screen: "stranke", Icon: UsersIcon, label: "Stranke" },
  ];
  return (
    <div style={{ display: "flex", borderTop: "1px solid #EDE9E2", background: "#FAFAF7", padding: "8px 0 6px" }}>
      {tabs.map(tab => {
        const isActive = activeScreen === tab.screen || (tab.screen === "dashboard" && !["taski","koledar","projekti","stranke","ideje"].includes(activeScreen));
        return (
          <button key={tab.screen} onClick={() => navigate(tab.screen)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "4px 0",
          }}>
            <tab.Icon size={22} color={isActive ? "#1A1714" : "#B5B0A8"} />
            {tab.label && <span style={{ fontSize: 10, color: isActive ? "#1A1714" : "#B5B0A8", fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>}
            {!tab.label && isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1A1714", marginTop: 1 }} />}
          </button>
        );
      })}
    </div>
  );
}

function HomeIcon({ size = 22, color = "#B5B0A8" }) {
  return <svg width={size} height={size} viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V15H8V20H4C3.45 20 3 19.55 3 19V9.5Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}

// ── Root App ──────────────────────────────────────────────────────────────────
function TaskaroApp() {
  const [screen, setScreen] = React.useState("dashboard");
  const [params, setParams] = React.useState({});
  const navigate = (newScreen, newParams = {}) => {
    setScreen(newScreen);
    setParams(newParams);
  };

  const detailScreens = ["task-detail", "projekt-detail", "stranka-detail", "new-task"];
  const isDetail = detailScreens.includes(screen);

  const renderScreen = () => {
    switch(screen) {
      case "dashboard": return <DashboardScreen navigate={navigate} />;
      case "taski": return <TaskiScreen navigate={navigate} />;
      case "task-detail": return <TaskDetailScreen navigate={navigate} params={params} />;
      case "projekti": return <ProjektiScreen navigate={navigate} />;
      case "projekt-detail": return <ProjektDetailScreen navigate={navigate} params={params} />;
      case "stranke": return <StrankeScreen navigate={navigate} />;
      case "stranka-detail": return <StrankaDetailScreen navigate={navigate} params={params} />;
      case "ideje": return <IdejeScreen navigate={navigate} />;
      case "koledar": return <KoledarScreen navigate={navigate} />;
      default: return <DashboardScreen navigate={navigate} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans', sans-serif" }}>
      {renderScreen()}
      {!isDetail && <TabBar activeScreen={screen} navigate={navigate} />}
    </div>
  );
}

// Export to window
Object.assign(window, { TaskaroApp });


