import { useState, useEffect } from “react”;
import Head from “next/head”;

const REGISTRY = {
“Carnival”: [“Carnival Celebration”,“Carnival Conquest”,“Carnival Dream”,“Carnival Elation”,“Carnival Fantasy”,“Carnival Freedom”,“Carnival Glory”,“Carnival Horizon”,“Carnival Jubilee”,“Carnival Legend”,“Carnival Liberty”,“Carnival Luminosa”,“Carnival Magic”,“Carnival Miracle”,“Carnival Panorama”,“Carnival Paradise”,“Carnival Pride”,“Carnival Radiance”,“Carnival Spirit”,“Carnival Splendor”,“Carnival Sunrise”,“Carnival Sunshine”,“Carnival Valor”,“Carnival Venezia”,“Carnival Vista”,“Mardi Gras”],
“Royal Caribbean”: [“Adventure of the Seas”,“Allure of the Seas”,“Anthem of the Seas”,“Brilliance of the Seas”,“Explorer of the Seas”,“Freedom of the Seas”,“Grandeur of the Seas”,“Harmony of the Seas”,“Icon of the Seas”,“Independence of the Seas”,“Jewel of the Seas”,“Liberty of the Seas”,“Navigator of the Seas”,“Oasis of the Seas”,“Odyssey of the Seas”,“Ovation of the Seas”,“Quantum of the Seas”,“Radiance of the Seas”,“Rhapsody of the Seas”,“Serenade of the Seas”,“Star of the Seas”,“Symphony of the Seas”,“Utopia of the Seas”,“Vision of the Seas”,“Voyager of the Seas”,“Wonder of the Seas”],
“Norwegian”: [“Norwegian Aqua”,“Norwegian Bliss”,“Norwegian Breakaway”,“Norwegian Dawn”,“Norwegian Encore”,“Norwegian Epic”,“Norwegian Escape”,“Norwegian Gem”,“Norwegian Getaway”,“Norwegian Jade”,“Norwegian Joy”,“Norwegian Pearl”,“Norwegian Prima”,“Norwegian Sky”,“Norwegian Spirit”,“Norwegian Star”,“Norwegian Sun”,“Norwegian Viva”,“Pride of America”],
“MSC”: [“MSC Armonia”,“MSC Bellissima”,“MSC Divina”,“MSC Euribia”,“MSC Fantasia”,“MSC Grandiosa”,“MSC Lirica”,“MSC Magnifica”,“MSC Meraviglia”,“MSC Musica”,“MSC Opera”,“MSC Orchestra”,“MSC Poesia”,“MSC Preziosa”,“MSC Seascape”,“MSC Seashore”,“MSC Seaside”,“MSC Seaview”,“MSC Sinfonia”,“MSC Splendida”,“MSC Virtuosa”,“MSC World America”,“MSC World Europa”],
“Celebrity”: [“Celebrity Apex”,“Celebrity Ascent”,“Celebrity Beyond”,“Celebrity Constellation”,“Celebrity Eclipse”,“Celebrity Edge”,“Celebrity Equinox”,“Celebrity Flora”,“Celebrity Infinity”,“Celebrity Millennium”,“Celebrity Reflection”,“Celebrity Silhouette”,“Celebrity Solstice”,“Celebrity Summit”,“Celebrity Xcel”],
“Princess”: [“Caribbean Princess”,“Coral Princess”,“Crown Princess”,“Diamond Princess”,“Discovery Princess”,“Emerald Princess”,“Enchanted Princess”,“Grand Princess”,“Island Princess”,“Majestic Princess”,“Regal Princess”,“Royal Princess”,“Ruby Princess”,“Sapphire Princess”,“Sky Princess”,“Star Princess”,“Sun Princess”],
“Holland America”: [“Eurodam”,“Koningsdam”,“Maasdam”,“Nieuw Amsterdam”,“Nieuw Statendam”,“Noordam”,“Oosterdam”,“Rotterdam”,“Westerdam”,“Zaandam”,“Zuiderdam”],
“Disney”: [“Disney Dream”,“Disney Fantasy”,“Disney Magic”,“Disney Treasure”,“Disney Wish”,“Disney Wonder”],
“Virgin Voyages”: [“Resilient Lady”,“Scarlet Lady”,“Valiant Lady”],
“Oceania”: [“Allura”,“Insignia”,“Marina”,“Nautica”,“Regatta”,“Riviera”,“Sirena”,“Vista”],
“Cunard”: [“Queen Anne”,“Queen Elizabeth”,“Queen Mary 2”,“Queen Victoria”],
};

const LINES = Object.keys(REGISTRY).sort();
const PAL = [
{ color:”#00B4D8”, accent:”#90E0EF” },
{ color:”#F77F00”, accent:”#FCBF49” },
{ color:”#7B2D8B”, accent:”#C77DFF” },
{ color:”#D62828”, accent:”#FF6B6B” },
{ color:”#2D6A4F”, accent:”#52B788” },
{ color:”#457B9D”, accent:”#A8DADC” },
];

function today() {
return new Date().toISOString().slice(0, 10);
}
function fmtDate(s) {
if (!s) return “”;
return new Date(s + “T12:00:00Z”).toLocaleDateString(“en-US”, { weekday:“short”, month:“short”, day:“numeric”, year:“numeric” });
}

async function fetchItinerary(shipName) {
const res = await fetch(”/api/itinerary”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({ shipName }),
});
const data = await res.json();
if (!res.ok || data.error) throw new Error(data.error || “Failed to fetch”);
return data;
}

function DropDown({ value, onChange, placeholder, children, disabled }) {
return (
<div style={{ position:“relative” }}>
<select value={value} onChange={onChange} disabled={disabled} style={{
width:“100%”, background:“rgba(0,15,35,0.92)”, border:“1px solid rgba(100,200,255,0.18)”,
borderRadius:10, color: value ? “#E8EDF5” : “#4A7A9B”, padding:“13px 38px 13px 14px”,
fontSize:15, cursor: disabled ? “not-allowed” : “pointer”, outline:“none”,
fontFamily:“Georgia,serif”, appearance:“none”, WebkitAppearance:“none”,
boxSizing:“border-box”, opacity: disabled ? 0.45 : 1, transition:“opacity 0.2s”
}}>
{placeholder && <option value="" disabled>{placeholder}</option>}
{children}
</select>
<span style={{ position:“absolute”, right:12, top:“50%”, transform:“translateY(-50%)”, pointerEvents:“none”, color:”#4A7A9B”, fontSize:11 }}>▾</span>
</div>
);
}

function ShipPicker({ label, pal, onLoad, ship: loaded }) {
const [line, setLine]     = useState(””);
const [shipName, setShip] = useState(””);
const [status, setStatus] = useState(“idle”);
const [errMsg, setErr]    = useState(””);
const [collapsed, setCollapsed] = useState(false);
const { color, accent } = pal;

const doFetch = async (name) => {
setStatus(“loading”); setErr(””);
try {
const result = await fetchItinerary(name);
const t = today();
result.itinerary = result.itinerary.filter(i => i.date >= t);
onLoad({ …result, …pal });
setStatus(“ok”); setCollapsed(true);
} catch (e) { setErr(e.message); setStatus(“err”); }
};

if (collapsed && loaded) return (
<div style={{ borderRadius:14, padding:“15px 17px”, background:`linear-gradient(135deg,${color}12,transparent)`, border:`1px solid ${color}35` }}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“flex-start” }}>
<div>
<div style={{ fontSize:10, letterSpacing:“0.28em”, color:”#5A8BA8”, fontFamily:“monospace”, textTransform:“uppercase”, marginBottom:5 }}>{label}</div>
<div style={{ fontSize:17, color:”#E8EDF5”, fontStyle:“italic”, marginBottom:3 }}>{loaded.shipName}</div>
<div style={{ fontSize:11, color:accent, fontFamily:“monospace” }}>{loaded.cruiseLine} · {loaded.itinerary.length} stops</div>
{loaded.source && <div style={{ fontSize:10, color:”#3A6A8A”, fontFamily:“monospace”, marginTop:2 }}>📡 {loaded.source}</div>}
</div>
<button onClick={() => { setCollapsed(false); setStatus(“idle”); setShip(””); setLine(””); }} style={{
background:“transparent”, border:`1px solid ${color}40`, borderRadius:8,
color:”#5A8BA8”, fontSize:10, fontFamily:“monospace”, cursor:“pointer”, padding:“5px 11px”
}}>Change</button>
</div>
</div>
);

return (
<div style={{ borderRadius:14, padding:“15px 17px”, background:`linear-gradient(135deg,${color}08,transparent)`, border:`1px solid ${color}22` }}>
<div style={{ fontSize:10, letterSpacing:“0.28em”, color:”#5A8BA8”, fontFamily:“monospace”, textTransform:“uppercase”, marginBottom:11 }}>{label}</div>
<div style={{ marginBottom:9 }}>
<DropDown value={line} onChange={e => { setLine(e.target.value); setShip(””); setStatus(“idle”); }} placeholder=“Cruise Line”>
{LINES.map(l => <option key={l}>{l}</option>)}
</DropDown>
</div>
<div style={{ marginBottom: status === “err” ? 10 : 0 }}>
<DropDown value={shipName} onChange={e => { setShip(e.target.value); if (e.target.value) doFetch(e.target.value); }}
placeholder={status === “loading” ? “Fetching schedule…” : “Select Ship”} disabled={!line || status === “loading”}>
{(line ? REGISTRY[line] : []).map(s => <option key={s}>{s}</option>)}
</DropDown>
</div>
{status === “loading” && (
<div style={{ display:“flex”, alignItems:“center”, gap:8, marginTop:10, fontSize:12, color:”#4A7A9B”, fontFamily:“monospace” }}>
<span style={{ display:“inline-block”, animation:“spin 0.9s linear infinite” }}>⟳</span> Searching live schedule…
</div>
)}
{status === “err” && (
<div style={{ marginTop:2, padding:“10px 13px”, background:“rgba(214,40,40,0.08)”, border:“1px solid rgba(214,40,40,0.28)”, borderRadius:9 }}>
<div style={{ fontSize:11, color:”#FF8A8A”, fontFamily:“monospace”, marginBottom:8 }}>⚠ {errMsg}</div>
<button onClick={() => doFetch(shipName)} style={{ background:“rgba(0,180,216,0.15)”, border:“1px solid rgba(0,180,216,0.35)”, borderRadius:7, color:”#90E0EF”, fontSize:11, fontFamily:“monospace”, cursor:“pointer”, padding:“5px 14px” }}>
⟳ Retry
</button>
</div>
)}
</div>
);
}

export default function Home() {
const t = today();
const [tab, setTab]   = useState(“compare”);
const [s1, setS1]     = useState(null);
const [s2, setS2]     = useState(null);
const [pool, setPool] = useState([]);
const [portQ, setPortQ] = useState(””);
const [dateQ, setDateQ] = useState(””);
const [pfLine, setPFLine] = useState(””);
const [pfShip, setPFShip] = useState(””);
const [pfStatus, setPFStatus] = useState(“idle”);
const [pfErr, setPFErr] = useState(””);

const addToPool = (d) => setPool(p => […p.filter(x => x.shipName !== d.shipName), d]);
const onLoad1 = (d) => { setS1(d); addToPool(d); };
const onLoad2 = (d) => { setS2(d); addToPool(d); };

const matches = (!s1 || !s2 || s1.shipName === s2.shipName) ? [] :
s1.itinerary.filter(a => a.port !== “At Sea” && s2.itinerary.some(b => b.port === a.port && b.date === a.date))
.map(a => ({ port:a.port, date:a.date, d1:a.day, d2:s2.itinerary.find(b => b.port===a.port && b.date===a.date)?.day }));

const poolDates = […new Set(pool.flatMap(s => s.itinerary).filter(i => i.port !== “At Sea” && i.date >= t).map(i => i.date))].sort();
useEffect(() => { if (!dateQ && poolDates.length) setDateQ(poolDates[0]); }, [poolDates.join(”,”)]);

const portHits = portQ.length >= 2 && dateQ
? pool.filter(s => s.itinerary.some(i => i.port.toLowerCase().includes(portQ.toLowerCase()) && i.date === dateQ))
.map(s => ({ s, stop: s.itinerary.find(i => i.port.toLowerCase().includes(portQ.toLowerCase()) && i.date === dateQ) }))
: [];

const addPFShip = async (name) => {
setPFStatus(“loading”); setPFErr(””);
try {
const r = await fetchItinerary(name);
const pal = PAL[pool.length % PAL.length];
addToPool({ …r, …pal });
setPFStatus(“ok”); setPFShip(””); setPFLine(””);
} catch (e) { setPFStatus(“err”); setPFErr(e.message); }
};

const card  = { background:“rgba(255,255,255,0.035)”, backdropFilter:“blur(20px)”, border:“1px solid rgba(100,200,255,0.08)”, borderRadius:16, padding:22, marginBottom:16, boxShadow:“0 8px 40px rgba(0,0,0,0.35)” };
const sh    = { fontSize:15, fontWeight:400, fontStyle:“italic”, color:”#90E0EF”, margin:“0 0 16px”, display:“flex”, alignItems:“center”, gap:9 };
const lbl   = { display:“block”, fontSize:10, letterSpacing:“0.28em”, color:”#5A8BA8”, textTransform:“uppercase”, fontFamily:“monospace”, marginBottom:7 };
const badge = c => ({ background:`${c}18`, border:`1px solid ${c}44`, color:c, borderRadius:6, padding:“3px 9px”, fontSize:11, fontFamily:“monospace”, flexShrink:0, whiteSpace:“nowrap” });
const row   = c => ({ display:“flex”, alignItems:“center”, gap:11, padding:“13px 16px”, background:`linear-gradient(90deg,${c}12,transparent)`, border:`1px solid ${c}28`, borderLeft:`3px solid ${c}`, borderRadius:10, marginBottom:8 });
const empty = { textAlign:“center”, padding:“48px 20px”, color:”#3A6A8A” };
const inp   = { background:“rgba(0,15,35,0.92)”, border:“1px solid rgba(100,200,255,0.18)”, borderRadius:10, color:”#E8EDF5”, padding:“13px 14px”, fontSize:14, width:“100%”, outline:“none”, fontFamily:“Georgia,serif”, boxSizing:“border-box” };

return (
<>
<Head><title>Dock Together</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
<div style={{ minHeight:“100vh”, background:“linear-gradient(160deg,#090D18 0%,#0B1826 45%,#090E1F 100%)” }}>

```
    {/* Header */}
    <header style={{ position:"relative", padding:"36px 0 16px", textAlign:"center", background:"linear-gradient(180deg,rgba(0,30,70,0.55) 0%,transparent 100%)" }}>
      <div style={{ fontSize:48, marginBottom:4 }}>⚓</div>
      <h1 style={{ fontSize:"clamp(24px,6vw,46px)", fontWeight:400, letterSpacing:"0.05em", color:"#E8EDF5", fontStyle:"italic", textShadow:"0 0 50px rgba(100,200,255,0.28)" }}>Dock Together</h1>
      <p style={{ fontSize:11, letterSpacing:"0.32em", color:"#5A8BA8", marginTop:6, textTransform:"uppercase", fontFamily:"monospace" }}>Cruise Ship Itinerary Tracker</p>
    </header>

    {/* Nav */}
    <nav style={{ display:"flex", justifyContent:"center", gap:4, padding:"16px 20px 0" }}>
      {[{ k:"compare", l:"⚓ Compare Ships" }, { k:"port", l:"🔍 Port Finder" }].map(({ k, l }) => (
        <button key={k} onClick={() => setTab(k)} style={{
          padding:"9px 26px", borderRadius:"34px 34px 0 0", border:"none", cursor:"pointer",
          fontFamily:"monospace", fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase",
          background: tab===k ? "rgba(100,200,255,0.12)" : "rgba(255,255,255,0.03)",
          color: tab===k ? "#90E0EF" : "#5A8BA8",
          borderBottom: tab===k ? "2px solid #00B4D8" : "2px solid transparent",
        }}>{l}</button>
      ))}
    </nav>

    {/* Main */}
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(100,200,255,0.07)", borderTop:"none", borderRadius:"0 0 16px 16px", maxWidth:880, margin:"0 auto", boxShadow:"0 10px 50px rgba(0,0,0,0.45)" }}>
      <div style={{ padding:"4px 18px 54px" }}>

        {/* ── COMPARE TAB ── */}
        {tab === "compare" && (
          <div style={{ animation:"fadeUp 0.3s ease forwards" }}>
            <div style={card}>
              <p style={sh}>⚓ Compare Two Ships</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
                <ShipPicker label="Your Ship"     pal={PAL[0]} onLoad={onLoad1} ship={s1} />
                <ShipPicker label="Friend's Ship" pal={PAL[1]} onLoad={onLoad2} ship={s2} />
              </div>
            </div>

            {s1 && s2 && (matches.length === 0 ? (
              <div style={{ ...card, ...empty }}>
                <div style={{ fontSize:34, marginBottom:10 }}>🌊</div>
                <p style={{ fontStyle:"italic", color:"#7EB8D4", marginBottom:5 }}>No shared ports</p>
                <p style={{ fontSize:12, color:"#3A6A8A", fontFamily:"monospace" }}>{s1.shipName} and {s2.shipName} don't overlap in upcoming dates.</p>
              </div>
            ) : (
              <div style={card}>
                <p style={sh}>🎉 You'll Meet Here! <span style={{ fontSize:11, fontStyle:"normal", color:"#3A6A8A", fontFamily:"monospace", marginLeft:"auto" }}>{matches.length} shared port{matches.length > 1 ? "s" : ""}</span></p>
                {matches.map((m, i) => (
                  <div key={i} style={{ background:"linear-gradient(135deg,rgba(0,180,216,0.13),rgba(0,100,180,0.07))", border:"1px solid rgba(0,180,216,0.32)", borderRadius:12, padding:"14px 17px", marginBottom:10, display:"flex", alignItems:"center", gap:13 }}>
                    <span style={{ fontSize:20 }}>📍</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:16, color:"#E8EDF5", marginBottom:3 }}>{m.port}</div>
                      <div style={{ fontSize:11, color:"#5A8BA8", fontFamily:"monospace" }}>{fmtDate(m.date)}</div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                      <span style={badge(s1.color)}>{s1.shipName.split(" ").pop()} · D{m.d1}</span>
                      <span style={badge(s2.color)}>{s2.shipName.split(" ").pop()} · D{m.d2}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {(s1 || s2) && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
                {[s1, s2].map((s, si) => s ? (
                  <div key={si} style={card}>
                    <p style={{ ...sh, fontSize:13, color:s.color, marginBottom:12 }}>{s.shipName}</p>
                    {s.itinerary.map((stop, i) => {
                      const hit = matches.some(m => m.port === stop.port && m.date === stop.date);
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.03)", opacity: stop.port === "At Sea" ? 0.32 : 1 }}>
                          <span style={{ fontSize:10, color:"#3A6A8A", fontFamily:"monospace", width:22, flexShrink:0 }}>D{stop.day}</span>
                          {hit && <div style={{ width:5, height:5, borderRadius:"50%", background:s.color, boxShadow:`0 0 5px ${s.color}`, flexShrink:0 }} />}
                          <span style={{ fontSize:12, color: hit ? s.accent : stop.port === "At Sea" ? "#3A6A8A" : "#B0C4D8", flex:1 }}>{stop.port}</span>
                          {hit && <span style={{ fontSize:9, color:s.color, fontFamily:"monospace" }}>✦</span>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div key={si} style={{ ...card, display:"flex", alignItems:"center", justifyContent:"center", minHeight:90 }}>
                    <p style={{ color:"#3A6A8A", fontStyle:"italic", fontSize:13 }}>Select a ship above</p>
                  </div>
                ))}
              </div>
            )}

            {!s1 && !s2 && (
              <div style={{ ...card, ...empty }}>
                <div style={{ fontSize:44, marginBottom:14 }}>🌊</div>
                <p style={{ fontStyle:"italic", color:"#90E0EF", fontSize:17, marginBottom:7 }}>Ready to find your crew</p>
                <p style={{ fontSize:12, color:"#3A6A8A", fontFamily:"monospace" }}>Select a cruise line and ship to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* ── PORT FINDER TAB ── */}
        {tab === "port" && (
          <div style={{ animation:"fadeUp 0.3s ease forwards" }}>
            <div style={card}>
              <p style={sh}>🔍 Who's in Port?</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13, marginBottom:14 }}>
                <div>
                  <label style={lbl}>Port</label>
                  <input list="plist" style={inp} value={portQ} onChange={e => setPortQ(e.target.value)} placeholder="e.g. Nassau, Cozumel…" />
                  <datalist id="plist">{[...new Set(pool.flatMap(s => s.itinerary).filter(i => i.port !== "At Sea").map(i => i.port))].sort().map(p => <option key={p} value={p} />)}</datalist>
                </div>
                <div>
                  <label style={lbl}>Date{poolDates.length ? ` (${poolDates.length})` : ""}</label>
                  {poolDates.length ? (
                    <div style={{ position:"relative" }}>
                      <select value={dateQ} onChange={e => setDateQ(e.target.value)} style={{ ...inp, padding:"13px 38px 13px 14px", cursor:"pointer", appearance:"none", WebkitAppearance:"none" }}>
                        {poolDates.map(d => <option key={d} value={d}>{fmtDate(d)}</option>)}
                      </select>
                      <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#4A7A9B", fontSize:11 }}>▾</span>
                    </div>
                  ) : <input style={{ ...inp, opacity:0.4 }} disabled placeholder="Add ships first…" />}
                </div>
              </div>
              <div style={{ borderTop:"1px solid rgba(100,200,255,0.07)", paddingTop:14 }}>
                <label style={lbl}>Add Ship to Pool</label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div style={{ position:"relative" }}>
                    <select value={pfLine} onChange={e => { setPFLine(e.target.value); setPFShip(""); }} style={{ ...inp, padding:"13px 38px 13px 14px", cursor:"pointer", appearance:"none", WebkitAppearance:"none", color: pfLine ? "#E8EDF5" : "#4A7A9B" }}>
                      <option value="" disabled>Cruise Line</option>
                      {LINES.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#4A7A9B", fontSize:11 }}>▾</span>
                  </div>
                  <div style={{ position:"relative", opacity: pfLine ? 1 : 0.4, pointerEvents: pfLine ? "auto" : "none" }}>
                    <select value={pfShip} onChange={e => { setPFShip(e.target.value); if (e.target.value) addPFShip(e.target.value); }} disabled={!pfLine || pfStatus === "loading"} style={{ ...inp, padding:"13px 38px 13px 14px", cursor:"pointer", appearance:"none", WebkitAppearance:"none", color: pfShip ? "#E8EDF5" : "#4A7A9B" }}>
                      <option value="" disabled>{pfStatus === "loading" ? "Fetching…" : "Select Ship"}</option>
                      {(pfLine ? REGISTRY[pfLine] : []).map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#4A7A9B", fontSize:11 }}>▾</span>
                  </div>
                </div>
                {pfStatus === "loading" && <div style={{ marginTop:8, fontSize:11, color:"#4A7A9B", fontFamily:"monospace", display:"flex", alignItems:"center", gap:6 }}><span style={{ animation:"spin 0.9s linear infinite", display:"inline-block" }}>⟳</span> Fetching…</div>}
                {pfStatus === "err" && <div style={{ marginTop:8, fontSize:11, color:"#FF8A8A", fontFamily:"monospace" }}>⚠ {pfErr}</div>}
              </div>
              {pool.length > 0 && (
                <div style={{ marginTop:11, display:"flex", flexWrap:"wrap", gap:6 }}>
                  {pool.map((s, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", background:`${s.color}12`, border:`1px solid ${s.color}35`, borderRadius:20, fontSize:11, color:s.accent, fontFamily:"monospace" }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:s.color }} />{s.shipName}
                      <button onClick={() => setPool(p => p.filter((_, j) => j !== i))} style={{ background:"transparent", border:"none", color:"#3A6A8A", cursor:"pointer", fontSize:11, padding:0, marginLeft:2 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pool.length === 0 ? (
              <div style={{ ...card, ...empty }}><div style={{ fontSize:36, marginBottom:10 }}>⚓</div><p style={{ fontStyle:"italic", color:"#7EB8D4", marginBottom:5 }}>No ships yet</p><p style={{ fontSize:12, color:"#3A6A8A", fontFamily:"monospace" }}>Ships from Compare appear here automatically.</p></div>
            ) : portQ.length < 2 ? (
              <div style={{ ...card, ...empty }}><div style={{ fontSize:36, marginBottom:10 }}>🌍</div><p style={{ fontStyle:"italic", color:"#7EB8D4" }}>Type a port name to see who's there.</p></div>
            ) : portHits.length === 0 ? (
              <div style={{ ...card, ...empty }}><div style={{ fontSize:36, marginBottom:10 }}>🚫</div><p style={{ fontStyle:"italic", color:"#90E0EF", marginBottom:5 }}>No ships found</p><p style={{ fontSize:12, color:"#3A6A8A", fontFamily:"monospace" }}>None of your {pool.length} ships dock at "{portQ}" on {fmtDate(dateQ)}.</p></div>
            ) : (
              <div style={card}>
                <p style={sh}>🚢 Ships in Port <span style={{ fontSize:11, fontStyle:"normal", color:"#3A6A8A", fontFamily:"monospace", marginLeft:"auto" }}>{portHits.length} ship{portHits.length !== 1 ? "s" : ""} · {fmtDate(dateQ)}</span></p>
                {portHits.map(({ s, stop }, i) => (
                  <div key={i} style={row(s.color)}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, color:"#E8EDF5", marginBottom:2 }}>{s.shipName}</div>
                      <div style={{ fontSize:11, fontFamily:"monospace", color:s.accent }}>{s.cruiseLine} · Day {stop?.day} · {stop?.port}</div>
                    </div>
                    <div style={badge(s.color)}>Day {stop?.day}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  </div>
</>
```

);
}
