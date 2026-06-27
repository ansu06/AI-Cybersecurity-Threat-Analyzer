/* ═══════════════════════════════════════════════════════════
   Threat Counter — Main Application
   Root component that assembles the full dashboard.
   Depends on:
     - window.ThreatCounterData       (threat-counter-data.js)
     - window.ThreatCounterComponents (threat-counter-components.jsx)
   ═══════════════════════════════════════════════════════════ */

const { useState, useEffect, useMemo } = React;

/* Pull dependencies from global namespaces */
const {
  generateThreats,
  generateTimeData,
  COUNTRY_FLAGS,
} = window.ThreatCounterData;

const {
  DiamondBackground,
  SeverityBadge,
  StatCard,
  LineChart,
  DonutChart,
  ThreatDetailModal,
} = window.ThreatCounterComponents;

/* Pre-generate data */
const initialThreats = generateThreats();
const timeData       = generateTimeData();

/* ═══════════════════════════════════════════════════════════
   ThreatCounter — Main Dashboard Component
   ═══════════════════════════════════════════════════════════ */

function ThreatCounter() {
  const [threats, setThreats]               = useState(initialThreats);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [filter, setFilter]                 = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy]                 = useState('timestamp');
  const [liveMode, setLiveMode]             = useState(true);
  const [page, setPage]                     = useState(0);
  const [now, setNow]                       = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab]           = useState('stream');
  const [selectedForensic, setSelectedForensic] = useState(null);
  const pageSize = 8;

  /* ── Clock ── */
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(clock);
  }, []);

  /* ── Live threat injection ── */
  useEffect(() => {
    if (!liveMode) return;
    const id = setInterval(() => {
      if (Math.random() < 0.35) {
        const t = generateThreats(1)[0];
        t.id        = `THR-${String(2000 + Math.floor(Math.random()*9000)).padStart(4,'0')}`;
        t.timestamp = new Date().toISOString();
        setThreats(prev => [t, ...prev].slice(0, 50));
      }
    }, 3000);
    return () => clearInterval(id);
  }, [liveMode]);

  /* ── Computed values ── */
  const active       = threats.filter(t => t.status === 'active');
  const critical     = threats.filter(t => t.severity === 'critical');
  const mitigated    = threats.filter(t => t.status === 'mitigated');
  const totalAttacks = threats.reduce((s, t) => s + (t.failedLogins || 0), 0);

  const filtered = threats
    .filter(t => {
      if (filter === 'active')    return t.status === 'active';
      if (filter === 'critical')  return t.severity === 'critical';
      if (filter === 'mitigated') return t.status === 'mitigated';
      return true;
    })
    .filter(t => severityFilter === 'all' || t.severity === severityFilter)
    .sort((a, b) => {
      if (sortBy === 'timestamp') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'severity')  { const o = { critical:0, high:1, medium:2, low:3 }; return o[a.severity] - o[b.severity]; }
      if (sortBy === 'traffic')   return b.trafficVolume - a.trafficVolume;
      return 0;
    });

  const paginated  = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  /* ── Breakdowns (memoised) ── */
  const attackBreakdown = useMemo(() => {
    const c = {};
    threats.forEach(t => { c[t.type] = (c[t.type] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [threats]);

  const countryBreakdown = useMemo(() => {
    const c = {};
    threats.forEach(t => { c[t.country] = (c[t.country] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [threats]);

  const severityBreakdown = useMemo(() => {
    const c = { critical:0, high:0, medium:0, low:0 };
    threats.forEach(t => { c[t.severity]++; });
    return [
      { label:'Critical', value:c.critical, color:'#EF4444' },
      { label:'High',     value:c.high,     color:'#F59E0B' },
      { label:'Medium',   value:c.medium,   color:'#8B5CF6' },
      { label:'Low',      value:c.low,      color:'#10B981' },
    ];
  }, [threats]);

  /* ── Shared styles ── */
  const cardStyle = {
    background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(18,23,51,0.8) 100%)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    overflow: 'hidden',
  };

  const sectionTitle = (text, sub) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.14em', fontFamily:"'IBM Plex Mono',monospace", marginBottom:3, fontWeight:500 }}>{text}</div>
      {sub && <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{sub}</div>}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div style={{ background:'var(--bg-deep)', minHeight:'100vh', position:'relative' }}>
      <DiamondBackground />

      {/* ═══ HEADER ═══ */}
      <header style={{
        background: 'linear-gradient(180deg, rgba(14,18,37,0.95) 0%, rgba(10,13,26,0.9) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))',
            border:'1px solid rgba(139,92,246,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" stroke="#8B5CF6" strokeWidth="2" fill="rgba(139,92,246,0.15)"/>
              <path d="M12 7V13M12 15V17" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize:18, fontWeight:700, letterSpacing:'0.08em', fontFamily:"'Orbitron',sans-serif" }}>SENTINEL</span>
            <span style={{
              fontSize:9, color:'var(--purple-light)', padding:'2px 8px',
              border:'1px solid rgba(139,92,246,0.3)', borderRadius:4,
              marginLeft:10, letterSpacing:'0.12em',
              fontFamily:"'IBM Plex Mono',monospace", fontWeight:500,
              background:'rgba(139,92,246,0.08)',
            }}>THREAT MONITOR v2.0</span>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          {/* Tab toggle */}
          <div style={{ display:'flex', gap:2, background:'rgba(139,92,246,0.06)', borderRadius:8, padding:3, border:'1px solid var(--border)' }}>
            {[
              { key:'stream',    label:'Threat Stream',    icon:'📡' },
              { key:'forensics', label:'Threat Forensics', icon:'🔬' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                background: activeTab === tab.key ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))' : 'transparent',
                border: activeTab === tab.key ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                color: activeTab === tab.key ? 'var(--purple-light)' : 'var(--text-muted)',
                fontSize:12, padding:'6px 16px', borderRadius:6, cursor:'pointer',
                fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:'0.04em',
                transition:'all 0.2s',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Live indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color: liveMode ? '#10B981' : 'var(--text-muted)' }}>
            <span style={{
              width:8, height:8, borderRadius:'50%',
              background: liveMode ? '#10B981' : 'var(--text-muted)',
              boxShadow: liveMode ? '0 0 8px rgba(16,185,129,0.5)' : 'none',
              animation: liveMode ? 'pulse 1.5s infinite' : 'none',
            }} />
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:500 }}>
              {liveMode ? 'LIVE' : 'PAUSED'}
            </span>
          </div>

          <button onClick={() => setLiveMode(l => !l)} style={{
            background: liveMode ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${liveMode ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            color: liveMode ? '#EF4444' : '#10B981',
            fontSize:11, padding:'6px 14px', borderRadius:8, cursor:'pointer',
            fontFamily:"'IBM Plex Mono',monospace", fontWeight:500, letterSpacing:'0.06em',
            transition:'all 0.2s',
          }}>
            {liveMode ? '⏸ PAUSE' : '▶ RESUME'}
          </button>

          <span style={{ fontSize:12, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>{now}</span>
        </div>
      </header>

      {/* ═══ PAGE TITLE ═══ */}
      <div style={{ padding:'20px 32px 0', position:'relative', zIndex:1 }}>
        <h1 style={{
          fontSize:22, fontWeight:700, fontFamily:"'Orbitron',sans-serif",
          margin:0, letterSpacing:'0.04em',
        }}>
          Threat Stream and Forensics
        </h1>
        <div style={{ display:'flex', gap:16, marginTop:6, fontSize:12, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>
          <span>Real-Time Threat Analysis</span>
          <span style={{ color:'var(--border)' }}>│</span>
          <span>Classification Engine: Active</span>
          <span style={{ color:'var(--border)' }}>│</span>
          <span>Data Streaming</span>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ padding:'20px 32px 40px', position:'relative', zIndex:1 }}>

        {/* ── 3 Stat Cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
          <StatCard label="ACTIVE THREATS"     value={active.length}               sub={`${critical.length} critical severity`} color="#EF4444" icon="🔴" delay={0}   />
          <StatCard label="TOTAL THREAT COUNT" value={threats.length}              sub={`${mitigated.length} mitigated`}        color="#8B5CF6" icon="🛡️" delay={0.1} />
          <StatCard label="ATTACK COUNTS"      value={totalAttacks.toLocaleString()} sub="failed login attempts"               color="#22D3EE" icon="⚡" delay={0.2} />
        </div>

        {/* ── SPLIT LAYOUT ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>

          {/* ── LEFT: Threat Stream Table ── */}
          <div style={{ ...cardStyle, display:'flex', flexDirection:'column' }}>
            <div style={{
              padding:'18px 22px', borderBottom:'1px solid var(--border)',
              background:'linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 100%)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                {sectionTitle('THREAT STREAM TABLE', `${filtered.length} Events Detected`)}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:6,
                  background:'rgba(10,13,26,0.6)', border:'1px solid var(--border)',
                  borderRadius:8, padding:'0 12px', flex:1, minWidth:160,
                }}>
                  <span style={{ color:'var(--text-muted)', fontSize:14 }}>🔍</span>
                  <input type="text" placeholder="Search threats..." style={{
                    background:'transparent', border:'none', color:'var(--text-primary)',
                    fontSize:12, padding:'8px 0', outline:'none', width:'100%',
                    fontFamily:"'IBM Plex Mono',monospace",
                  }} />
                </div>
                <select value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); setPage(0); }}
                  style={{
                    background:'rgba(10,13,26,0.6)', border:'1px solid var(--border)',
                    color:'var(--text-secondary)', fontSize:11, padding:'8px 12px',
                    borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", cursor:'pointer',
                  }}>
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  style={{
                    background:'rgba(10,13,26,0.6)', border:'1px solid var(--border)',
                    color:'var(--text-secondary)', fontSize:11, padding:'8px 12px',
                    borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", cursor:'pointer',
                  }}>
                  <option value="timestamp">Latest</option>
                  <option value="severity">Severity</option>
                  <option value="traffic">Traffic</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX:'auto', flex:1 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ background:'rgba(10,13,26,0.5)' }}>
                    {['Threat ID','Severity','Attack Type','Protocol','Action'].map(h => (
                      <th key={h} style={{
                        padding:'10px 16px', textAlign:'left', fontSize:10,
                        color:'var(--text-muted)', letterSpacing:'0.1em', fontWeight:600,
                        borderBottom:'1px solid var(--border)', whiteSpace:'nowrap',
                        fontFamily:"'IBM Plex Mono',monospace",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((t, i) => (
                    <tr key={t.id}
                      onClick={() => { setSelectedForensic(t); setActiveTab('forensics'); }}
                      style={{
                        borderBottom:'1px solid rgba(26,31,58,0.5)',
                        cursor:'pointer', transition:'all 0.15s',
                        background: i%2===0 ? 'transparent' : 'rgba(10,13,26,0.3)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background= i%2===0 ? 'transparent' : 'rgba(10,13,26,0.3)'; }}
                    >
                      <td style={{ padding:'10px 16px', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--text-muted)' }}>{t.id}</td>
                      <td style={{ padding:'10px 16px' }}><SeverityBadge severity={t.severity} /></td>
                      <td style={{ padding:'10px 16px', fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' }}>{t.type}</td>
                      <td style={{ padding:'10px 16px', fontFamily:"'IBM Plex Mono',monospace", color:'var(--text-muted)', fontSize:11 }}>{t.protocol}</td>
                      <td style={{ padding:'10px 16px' }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedThreat(t); }} style={{
                          background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)',
                          color:'var(--purple-light)', fontSize:10, padding:'4px 12px',
                          borderRadius:6, cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace",
                          fontWeight:600, letterSpacing:'0.06em', transition:'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.1)'}
                        >ANALYZE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              padding:'12px 18px', borderTop:'1px solid var(--border)',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              background:'rgba(10,13,26,0.3)',
            }}>
              <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>
                {page*pageSize+1}–{Math.min((page+1)*pageSize, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display:'flex', gap:4 }}>
                <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
                  style={{
                    background:'transparent', border:'1px solid var(--border)',
                    color: page===0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize:11, padding:'4px 10px', borderRadius:6, cursor: page===0?'not-allowed':'pointer',
                    fontFamily:"'IBM Plex Mono',monospace", opacity: page===0?0.4:1,
                  }}>‹</button>
                {Array.from({ length:Math.min(totalPages,5) }, (_,i) => (
                  <button key={i} onClick={() => setPage(i)}
                    style={{
                      background: page===i ? 'linear-gradient(135deg, var(--purple-primary), var(--purple-dark))' : 'transparent',
                      border: `1px solid ${page===i ? 'var(--purple-primary)' : 'var(--border)'}`,
                      color: page===i ? '#fff' : 'var(--text-muted)',
                      fontSize:11, width:28, height:28, borderRadius:6, cursor:'pointer',
                      fontFamily:"'IBM Plex Mono',monospace",
                    }}>{i+1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}
                  style={{
                    background:'transparent', border:'1px solid var(--border)',
                    color: page>=totalPages-1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize:11, padding:'4px 10px', borderRadius:6,
                    cursor: page>=totalPages-1?'not-allowed':'pointer',
                    fontFamily:"'IBM Plex Mono',monospace", opacity: page>=totalPages-1?0.4:1,
                  }}>›</button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Forensics Panel ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Forensics header */}
            <div style={{ ...cardStyle, padding:'22px 24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                {sectionTitle('THREAT FORENSICS', 'Deep Analysis Panel')}
                <div style={{
                  display:'flex', alignItems:'center', gap:6, fontSize:11,
                  color:'var(--cyan)', fontFamily:"'IBM Plex Mono',monospace",
                  padding:'4px 12px', background:'rgba(34,211,238,0.08)',
                  border:'1px solid rgba(34,211,238,0.2)', borderRadius:6,
                }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', animation:'pulse 1.5s infinite' }} />
                  SCANNING
                </div>
              </div>
              {active.slice(0,3).length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
                  {active.slice(0,3).map((t, idx) => (
                    <div key={t.id} onClick={() => setSelectedForensic(t)}
                      style={{
                        background: selectedForensic?.id === t.id ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.05)',
                        border: `1px solid ${selectedForensic?.id === t.id ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'}`,
                        borderRadius:8, padding:'8px 14px',
                        display:'flex', alignItems:'center', gap:12,
                        cursor:'pointer', transition:'all 0.2s',
                        animation: `slideInRight 0.3s ease ${idx * 0.1}s both`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(239,68,68,0.5)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = selectedForensic?.id === t.id ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'}
                    >
                      <span style={{ width:7, height:7, borderRadius:'50%', background:'#EF4444', animation:'threatBlink 1s infinite', flexShrink:0, boxShadow:'0 0 8px rgba(239,68,68,0.5)' }} />
                      <span style={{ fontSize:12, color:'#EF4444', fontWeight:700, minWidth:80, fontFamily:"'Rajdhani',sans-serif" }}>{t.type}</span>
                      <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>{t.sourceIp}</span>
                      <span style={{ marginLeft:'auto', fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Severity + Attack types row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...cardStyle, padding:'20px 22px' }}>
                {sectionTitle('SEVERITY DISTRIBUTION')}
                <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                  <DonutChart segments={severityBreakdown} size={130} strokeWidth={12} />
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
                  {severityBreakdown.map(s => (
                    <div key={s.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                      <span style={{ color:'var(--text-muted)' }}>{s.label}</span>
                      <span style={{ color:'var(--text-secondary)', fontWeight:600, fontFamily:"'IBM Plex Mono',monospace" }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...cardStyle, padding:'20px 22px' }}>
                {sectionTitle('TOP ATTACK TYPES')}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {attackBreakdown.map(([type, count], i) => {
                    const max = attackBreakdown[0][1];
                    const colors = ['#EF4444','#F59E0B','#8B5CF6','#22D3EE','#10B981','#EC4899'];
                    const c = colors[i % colors.length];
                    return (
                      <div key={type}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:500 }}>{type}</span>
                          <span style={{ fontSize:11, color:c, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace" }}>{count}</span>
                        </div>
                        <div style={{ height:5, background:'rgba(139,92,246,0.08)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{
                            width:`${(count/max)*100}%`, height:'100%',
                            background:`linear-gradient(90deg, ${c}88, ${c})`,
                            borderRadius:3, transition:'width 0.8s ease',
                            boxShadow:`0 0 6px ${c}33`,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Attack Frequency chart */}
            <div style={{ ...cardStyle, padding:'20px 22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                {sectionTitle('ATTACK FREQUENCY', 'Hourly Distribution (24h)')}
                <div style={{ display:'flex', gap:14, fontSize:10, fontFamily:"'IBM Plex Mono',monospace" }}>
                  <span style={{ color:'#EF4444', display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:14, height:2, background:'#EF4444', display:'inline-block', borderRadius:1 }} /> Attacks
                  </span>
                  <span style={{ color:'#8B5CF6', display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ width:14, height:2, background:'#8B5CF6', display:'inline-block', borderRadius:1 }} /> Traffic
                  </span>
                </div>
              </div>
              <LineChart data={timeData} valueKey="attacks" color="#EF4444" height={70} />
              <div style={{ marginTop:6 }}>
                <LineChart data={timeData} valueKey="traffic" color="#8B5CF6" height={50} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                {['00','04','08','12','16','20','23'].map(h => (
                  <span key={h} style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>{h}:00</span>
                ))}
              </div>
            </div>

            {/* Country origins */}
            <div style={{ ...cardStyle, padding:'20px 22px' }}>
              {sectionTitle('ATTACK ORIGINS', 'Geographic Distribution')}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
                {countryBreakdown.map(([code, count], i) => {
                  const colors = ['#EF4444','#F59E0B','#8B5CF6','#22D3EE','#10B981','#EC4899'];
                  return (
                    <div key={code} style={{
                      background:'rgba(10,13,26,0.5)', border:'1px solid var(--border)',
                      borderRadius:8, padding:'10px 12px', textAlign:'center', transition:'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                    >
                      <div style={{ fontSize:18, marginBottom:4 }}>{COUNTRY_FLAGS[code] || '🌐'}</div>
                      <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", marginBottom:2 }}>{code}</div>
                      <div style={{ fontSize:16, fontWeight:700, color:colors[i%colors.length], fontFamily:"'Orbitron',sans-serif" }}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Traffic Volume Spikes ── */}
        <div style={{ ...cardStyle, padding:'22px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            {sectionTitle('TRAFFIC VOLUME SPIKES', 'Network Anomaly Detection (KB/s)')}
            <div style={{
              fontSize:11, color:'#F59E0B', padding:'4px 12px',
              background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)',
              borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600,
            }}>
              ⚠ {timeData.filter(d => d.traffic > 3500).length} anomalies
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(24,1fr)', gap:3, height:80, alignItems:'flex-end' }}>
            {timeData.map((d, i) => {
              const h = (d.traffic / 4500) * 80;
              const isSpike = d.traffic > 3500;
              return (
                <div key={i} title={`${d.hour}: ${d.traffic} KB/s`}
                  style={{
                    height: h, borderRadius:'3px 3px 0 0',
                    background: isSpike
                      ? 'linear-gradient(180deg, #F59E0B, rgba(245,158,11,0.4))'
                      : 'linear-gradient(180deg, rgba(139,92,246,0.5), rgba(139,92,246,0.15))',
                    border: isSpike ? '1px solid rgba(245,158,11,0.5)' : 'none',
                    boxShadow: isSpike ? '0 0 8px rgba(245,158,11,0.3)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity='0.8'; e.currentTarget.style.transform='scaleY(1.05)'; e.currentTarget.style.transformOrigin='bottom'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.transform='scaleY(1)'; }}
                />
              );
            })}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            {timeData.filter((_,i) => i%4===0).map(d => (
              <span key={d.hour} style={{ fontSize:9, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>{d.hour}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        padding:'16px 32px', borderTop:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        background:'rgba(10,13,26,0.8)', position:'relative', zIndex:1,
      }}>
        <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace", letterSpacing:'0.08em' }}>
          SENTINEL THREAT MONITOR © 2026 — Classification Engine: BERT v4.2
        </span>
        <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'IBM Plex Mono',monospace" }}>
          Node: PROD-01 | Uptime: 99.97% | Latency: 12ms
        </span>
      </footer>

      {selectedThreat && <ThreatDetailModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />}
    </div>
  );
}

/* ── Mount ── */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ThreatCounter />);
