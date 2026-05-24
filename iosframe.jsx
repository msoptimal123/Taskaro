<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Taskaro — Draft 2</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #111009; overflow: hidden; }
    body { display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #D0CBC3; border-radius: 2px; }

    .phone-bezel {
      width: 393px;
      height: 852px;
      background: #F7F4F0;
      border-radius: 54px;
      border: 8px solid #1E1B18;
      box-shadow: 0 0 0 1px #2E2B28, 0 32px 90px rgba(0,0,0,0.7), inset 0 0 0 1px #3A3730;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .side-btn { position: absolute; background: #1E1B18; border-radius: 3px; }
    .vol-up  { top: 120px; left: -10px; width: 5px; height: 32px; }
    .vol-dn  { top: 162px; left: -10px; width: 5px; height: 32px; }
    .power   { top: 140px; right: -10px; width: 5px; height: 60px; }
    .dynamic-island {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
      width: 120px; height: 34px; background: #111009; border-radius: 20px; z-index: 100;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .dynamic-island .cam { width: 10px; height: 10px; border-radius: 50%; background: #1E1B18; border: 1px solid #2E2B28; }
    .dynamic-island .fid { width: 14px; height: 14px; border-radius: 4px; border: 1.5px solid #2E2B28; }
    .status-bar {
      height: 54px; padding: 14px 24px 0;
      display: flex; align-items: flex-end; justify-content: space-between;
      flex-shrink: 0; position: relative; z-index: 10;
    }
    .status-time { font-size: 15px; font-weight: 700; color: #1A1714; letter-spacing: -0.3px; }
    .status-icons { display: flex; align-items: center; gap: 6px; }
    .home-bar { height: 28px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .home-bar-inner { width: 134px; height: 5px; background: #1A1714; border-radius: 3px; opacity: 0.18; }
    .content-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; position: relative; }

    /* Background */
    .bg { position: fixed; inset: 0; background: radial-gradient(ellipse at 25% 15%, #2A2018 0%, #111009 55%); }

    /* Left panel */
    .left-panel {
      position: fixed; left: 36px; top: 50%; transform: translateY(-50%);
      width: 190px; display: flex; flex-direction: column; gap: 10px;
    }
    .right-panel {
      position: fixed; right: 36px; top: 50%; transform: translateY(-50%);
      width: 210px; display: flex; flex-direction: column; gap: 12px;
    }
    .ann-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 13px 15px;
    }
    .ann-title { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; }
    .ann-body  { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.55; }
    .imp-badge {
      display: inline-flex; align-items: center; gap: 5px; margin-bottom: 4px;
      background: rgba(194,105,42,0.18); border: 1px solid rgba(194,105,42,0.35);
      border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #C2692A;
    }
    @media (max-width: 900px) { .left-panel, .right-panel { display: none; } }
  </style>
</head>
<body>
  <div class="bg"></div>

  <!-- Left panel -->
  <div class="left-panel">
    <div style="margin-bottom:4px">
      <div style="font-family:'DM Serif Display',serif;font-size:26px;font-weight:400;color:rgba(255,255,255,0.88);letter-spacing:-0.3px">Taskaro</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.35);margin-top:4px">Draft 2 · Maj 2026</div>
    </div>
    <div class="ann-card">
      <div class="ann-title">5 Izboljšav</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:2px">
        <div style="font-size:11px;color:rgba(255,255,255,0.5);display:flex;gap:6px;align-items:flex-start"><span style="color:#C2692A;font-weight:700;flex-shrink:0">1</span>Stalni mikrofon FAB</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);display:flex;gap:6px;align-items:flex-start"><span style="color:#C2692A;font-weight:700;flex-shrink:0">2</span>Poenostavljen dashboard</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);display:flex;gap:6px;align-items:flex-start"><span style="color:#C2692A;font-weight:700;flex-shrink:0">3</span>Enotno zajetje z glasom</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);display:flex;gap:6px;align-items:flex-start"><span style="color:#C2692A;font-weight:700;flex-shrink:0">4</span>Harmonične barve</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);display:flex;gap:6px;align-items:flex-start"><span style="color:#C2692A;font-weight:700;flex-shrink:0">5</span>Animacija zaključka</div>
      </div>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,0.25);line-height:1.6;margin-top:4px">Pritisni mikrofon za glasovni vnos. Zaključi nalogo za confetti efekt.</div>
  </div>

  <!-- Phone -->
  <div style="position:relative">
    <div class="phone-bezel">
      <div class="side-btn vol-up"></div>
      <div class="side-btn vol-dn"></div>
      <div class="side-btn power"></div>
      <div class="dynamic-island"><div class="cam"></div><div class="fid"></div></div>
      <div class="status-bar">
        <span class="status-time">9:41</span>
        <div class="status-icons">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0" y="8" width="3" height="4" rx="0.5" fill="#1A1714"/><rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#1A1714"/><rect x="9" y="2" width="3" height="10" rx="0.5" fill="#1A1714"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1A1714" opacity="0.3"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 10L8 10" stroke="#1A1714" strokeWidth="2" strokeLinecap="round"/><path d="M5.5 7.5C6.17 6.83 7.04 6.5 8 6.5s1.83.33 2.5 1" stroke="#1A1714" strokeWidth="1.4" strokeLinecap="round"/><path d="M3 5C4.34 3.66 6.08 3 8 3s3.66.66 5 2" stroke="#1A1714" strokeWidth="1.4" strokeLinecap="round"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#1A1714" strokeOpacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="#1A1714"/><path d="M23 4V8C23.83 7.63 24.5 6.87 24.5 6s-.67-1.63-1.5-2z" fill="#1A1714" opacity="0.4"/></svg>
        </div>
      </div>
      <div class="content-area" id="app-root-v2"></div>
      <div class="home-bar"><div class="home-bar-inner"></div></div>
    </div>
  </div>

  <!-- Right panel -->
  <div class="right-panel">
    <div class="ann-card">
      <div class="imp-badge">✦ #1 FAB</div>
      <div class="ann-title">Stalni mikrofon</div>
      <div class="ann-body">Vedno viden, en tap za glasovni vnos. Odpre modal za Task, Deadline, Rezervacijo ali Idejo.</div>
    </div>
    <div class="ann-card">
      <div class="imp-badge">✦ #2 Dashboard</div>
      <div class="ann-title">Pametni povzetek</div>
      <div class="ann-body">Tri kartice: danes, deadline, rezervacija. Grid navigacije ni več — tab bar zadostuje.</div>
    </div>
    <div class="ann-card">
      <div class="imp-badge">✦ #4 Barve</div>
      <div class="ann-title">Harmonična paleta</div>
      <div class="ann-body">Toplo rjava akcija · Modra=Task · Rdeča=Deadline · Vijola=Rezervacija. Brez clashanja.</div>
    </div>
    <div class="ann-card">
      <div class="imp-badge">✦ #5 Feedback</div>
      <div class="ann-title">Zaključek naloge</div>
      <div class="ann-body">Pritisni krog pri nalogi na dashboardu — confetti animacija potrdi uspeh.</div>
    </div>
  </div>

  <!-- App -->
  <script type="text/babel" src="taskaro-app-v2.jsx"></script>
  <script type="text/babel">
    // ── Tweaks (inlined) ──────────────────────────────────────────────────────
    const __TS = `
      .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:260px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:rgba(247,244,240,.92);color:#1A1714;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:.5px solid rgba(255,255,255,.6);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.18);font:11.5px/1.4 'DM Sans',sans-serif;overflow:hidden}
      .twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px;cursor:move;user-select:none}
      .twk-hd b{font-size:12px;font-weight:600}
      .twk-x{appearance:none;border:0;background:transparent;color:rgba(26,23,20,.5);width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px}
      .twk-x:hover{background:rgba(0,0,0,.06)}
      .twk-body{padding:4px 14px 14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto}
      .twk-row{display:flex;flex-direction:column;gap:5px}
      .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
      .twk-lbl{display:flex;justify-content:space-between;color:rgba(26,23,20,.65)}
      .twk-lbl>span:first-child{font-weight:500}
      .twk-sect{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(26,23,20,.4);padding:8px 0 0}
      .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;border-radius:999px;background:rgba(0,0,0,.1);outline:none}
      .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;border:.5px solid rgba(0,0,0,.15);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
      .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
      .twk-toggle[data-on="1"]{background:#16A34A}
      .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .15s}
      .twk-toggle[data-on="1"] i{transform:translateX(14px)}
      .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06)}
      .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);transition:left .15s,width .15s}
      .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;border-radius:6px;cursor:default;padding:4px 6px}
      .twk-swatch{appearance:none;-webkit-appearance:none;width:52px;height:22px;border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;background:transparent}
      .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
      .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
    `;

    function useTweaks(defaults) {
      const [values, setValues] = React.useState(defaults);
      const setTweak = React.useCallback((k, v) => {
        const edits = typeof k==='object' ? k : {[k]:v};
        setValues(p => ({...p,...edits}));
        window.parent.postMessage({type:'__edit_mode_set_keys',edits},'*');
      },[]);
      return {tweaks:values, setTweak};
    }

    function TweaksPanel({title='Tweaks',children}) {
      const [open,setOpen]=React.useState(false);
      const ref=React.useRef(null);
      const off=React.useRef({x:16,y:16});
      React.useEffect(()=>{
        const h=e=>{
          if(e?.data?.type==='__activate_edit_mode') setOpen(true);
          else if(e?.data?.type==='__deactivate_edit_mode') setOpen(false);
        };
        window.addEventListener('message',h);
        window.parent.postMessage({type:'__edit_mode_available'},'*');
        return ()=>window.removeEventListener('message',h);
      },[]);
      const dismiss=()=>{setOpen(false);window.parent.postMessage({type:'__edit_mode_dismissed'},'*');};
      const drag=e=>{
        const p=ref.current; if(!p) return;
        const r=p.getBoundingClientRect();
        const sx=e.clientX,sy=e.clientY,sr=window.innerWidth-r.right,sb=window.innerHeight-r.bottom;
        const mv=ev=>{off.current={x:sr-(ev.clientX-sx),y:sb-(ev.clientY-sy)};p.style.right=off.current.x+'px';p.style.bottom=off.current.y+'px';};
        const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);};
        window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);
      };
      if(!open) return null;
      return (<><style>{__TS}</style><div ref={ref} className="twk-panel" style={{right:off.current.x,bottom:off.current.y}}><div className="twk-hd" onMouseDown={drag}><b>{title}</b><button className="twk-x" onMouseDown={e=>e.stopPropagation()} onClick={dismiss}>✕</button></div><div className="twk-body">{children}</div></div></>);
    }
    function TweakSection({title,children}){return(<><div className="twk-sect">{title}</div>{children}</>);}
    function TweakSlider({label,value,min=0,max=100,step=1,unit='',onChange}){return(<div className="twk-row"><div className="twk-lbl"><span>{label}</span><span style={{color:'rgba(26,23,20,.45)'}}>{value}{unit}</span></div><input type="range" className="twk-slider" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></div>);}
    function TweakToggle({label,value,onChange}){return(<div className="twk-row twk-row-h"><div className="twk-lbl"><span>{label}</span></div><button type="button" className="twk-toggle" data-on={value?'1':'0'} onClick={()=>onChange(!value)}><i/></button></div>);}
    function TweakRadio({label,value,options,onChange}){const opts=options.map(o=>typeof o==='object'?o:{value:o,label:o});const idx=Math.max(0,opts.findIndex(o=>o.value===value));const n=opts.length;return(<div className="twk-row"><div className="twk-lbl"><span>{label}</span></div><div className="twk-seg"><div className="twk-seg-thumb" style={{left:`calc(2px + ${idx} * (100% - 4px) / ${n})`,width:`calc((100% - 4px) / ${n})`}}/>{opts.map(o=><button key={o.value} type="button" onClick={()=>onChange(o.value)}>{o.label}</button>)}</div></div>);}
    function TweakColor({label,value,onChange}){return(<div className="twk-row twk-row-h"><div className="twk-lbl"><span>{label}</span></div><input type="color" className="twk-swatch" value={value} onChange={e=>onChange(e.target.value)}/></div>);}

    // ── Mount app ─────────────────────────────────────────────────────────────
    const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
      "showAnnotations": true,
      "bgTone": "warm"
    }/*EDITMODE-END*/;

    function TweaksRoot() {
      const {tweaks,setTweak} = useTweaks(TWEAK_DEFAULTS);
      React.useEffect(()=>{
        document.querySelectorAll('.left-panel,.right-panel').forEach(el=>{
          el.style.display = tweaks.showAnnotations ? '' : 'none';
        });
        const phone = document.querySelector('.phone-bezel');
        if (phone) phone.style.background = tweaks.bgTone==='cool' ? '#F5F7FA' : tweaks.bgTone==='neutral' ? '#F5F5F5' : '#F7F4F0';
      },[tweaks]);
      return (
        <TweaksPanel>
          <TweakSection title="Prikaz">
            <TweakToggle label="Pokaži anotacije" id="showAnnotations" value={tweaks.showAnnotations} onChange={v=>setTweak('showAnnotations',v)}/>
            <TweakRadio label="Ton ozadja" id="bgTone" value={tweaks.bgTone}
              options={[{label:"Toplo",value:"warm"},{label:"Hladno",value:"cool"},{label:"Nevtr.",value:"neutral"}]}
              onChange={v=>setTweak('bgTone',v)}/>
          </TweakSection>
        </TweaksPanel>
      );
    }

    ReactDOM.createRoot(document.getElementById('app-root-v2')).render(<TaskaroAppV2 />);
    const tc = document.createElement('div');
    document.body.appendChild(tc);
    ReactDOM.createRoot(tc).render(<TweaksRoot />);
  </script>
</body>
</html>
