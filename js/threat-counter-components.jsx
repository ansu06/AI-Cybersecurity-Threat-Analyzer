/* ═══════════════════════════════════════════════════════════
   Threat Counter — Reusable UI Components
   Shared across the dashboard. Depends on React (global).
   ═══════════════════════════════════════════════════════════ */

const { useMemo: _useMemo } = React;

/* ── Diamond Background ── */
const DiamondBackground = () => {
  const diamonds = _useMemo(() => [
    { size: 300, x: '70%', y: '20%', opacity: 0.04, delay: 0,   border: 'var(--purple-primary)' },
    { size: 220, x: '72%', y: '22%', opacity: 0.06, delay: 0.5, border: 'var(--magenta)' },
    { size: 150, x: '74%', y: '24%', opacity: 0.08, delay: 1,   border: 'var(--cyan)' },
    { size: 90,  x: '76%', y: '26%', opacity: 0.12, delay: 1.5, border: 'var(--purple-light)' },
  ], []);

  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {/* Grid lines */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      {/* Scan line */}
      <div style={{
        position:'absolute', width:'100%', height:'2px',
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
        animation: 'scanLine 8s linear infinite',
      }} />
      {/* Diamond shapes */}
      {diamonds.map((d, i) => (
        <div key={i} style={{
          position:'absolute', left:d.x, top:d.y,
          width:d.size, height:d.size,
          border: `1.5px solid ${d.border}`,
          opacity: d.opacity,
          transform: 'rotate(45deg)',
          animation: `diamondRotate ${4 + i}s ease-in-out infinite`,
          animationDelay: `${d.delay}s`,
        }} />
      ))}
      {/* Radial glow */}
      <div style={{
        position:'absolute', width:'600px', height:'600px',
        right:'-100px', top:'-100px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        borderRadius:'50%',
      }} />
      <div style={{
        position:'absolute', width:'400px', height:'400px',
        left:'-50px', bottom:'-50px',
        background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)',
        borderRadius:'50%',
      }} />
    </div>
  );
};

/* ── Severity Badge ── */
const SeverityBadge = ({ severity }) => {
  const map = {
    critical: { bg:'rgba(239,68,68,0.15)', color:'#EF4444', glow:'rgba(239,68,68,0.3)', label:'CRITICAL' },
    high:     { bg:'rgba(245,158,11,0.15)', color:'#F59E0B', glow:'rgba(245,158,11,0.3)', label:'HIGH' },
    medium:   { bg:'rgba(139,92,246,0.15)', color:'#A78BFA', glow:'rgba(139,92,246,0.3)', label:'MEDIUM' },
    low:      { bg:'rgba(16,185,129,0.15)', color:'#10B981', glow:'rgba(16,185,129,0.3)', label:'LOW' },
  };
  const s = map[severity] || map.low;
  return (
    <span style={{
      background:s.bg, color:s.color, fontSize:10, fontWeight:700,
      padding:'3px 10px', borderRadius:4, letterSpacing:'0.1em',
      border:`1px solid ${s.color}44`, fontFamily:"'IBM Plex Mono',monospace",
      boxShadow:`0 0 8px ${s.glow}`,
    }}>
      {s.label}
    </span>
  );
};

/* ── Status Indicator ── */
const StatusDot = ({ status }) => {
  const map = {
    active:       { color:'#EF4444', label:'Active' },
    mitigated:    { color:'#10B981', label:'Mitigated' },
    investigating:{ color:'#F59E0B', label:'Investigating' },
  };
  const s = map[status] || map.active;
  return (
    <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:s.color, fontWeight:500 }}>
      <span style={{
        width:7, height:7, borderRadius:'50%', background:s.color,
        display:'inline-block',
        boxShadow: status==='active' ? `0 0 8px ${s.color}, 0 0 16px ${s.color}44` : `0 0 4px ${s.color}44`,
        animation: status==='active' ? 'pulse 1.5s infinite' : 'none',
      }} />
      {s.label}
    </span>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, sub, color, icon, delay = 0 }) => {
  return (
    <div style={{
      background: `linear-gradient(135deg, var(--bg-card) 0%, ${color}08 100%)`,
      border: `1px solid ${color}33`,
      borderRadius: 14,
      padding: '22px 24px',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeInUp 0.5s ease ${delay}s both`,
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = `${color}66`;
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = `${color}33`;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Top accent line */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
      {/* Corner glow */}
      <div style={{
        position:'absolute', top:-30, right:-30, width:80, height:80,
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        borderRadius:'50%',
      }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{
            fontSize:10, color:'var(--text-muted)', letterSpacing:'0.14em',
            fontFamily:"'IBM Plex Mono',monospace", marginBottom:14, fontWeight:500,
          }}>
            {label}
          </div>
          <div style={{
            fontSize:36, fontWeight:700, lineHeight:1, marginBottom:6,
            color: color,
            fontFamily:"'Orbitron',sans-serif",
            animation: `countUp 0.8s ease ${delay + 0.2}s both`,
            textShadow: `0 0 20px ${color}44`,
          }}>
            {value}
          </div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:400 }}>{sub}</div>
        </div>
        {icon && (
          <div style={{
            width:42, height:42, borderRadius:10,
            background:`${color}12`, border:`1px solid ${color}22`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Sparkline ── */
const Sparkline = ({ data, color, height = 40, width = 120 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 2;
  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + ((max - v) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width-pad},${height} L ${pad},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-${color.replace('#','')})`} />
      <path d={pathD} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Line Chart ── */
const LineChart = ({ data, valueKey, color, height = 120 }) => {
  const max = Math.max(...data.map(d => d[valueKey]));
  const min = Math.min(...data.map(d => d[valueKey]));
  const range = max - min || 1;
  const w = 600, pad = 8;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - d[valueKey]) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${points[0]} L ${points.join(' L ')} L ${600-pad},${height-pad} L ${pad},${height-pad} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${valueKey}-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${valueKey}-${color.replace('#','')})`} />
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
      {data.filter((_,i) => i % 4 === 0).map((d, idx) => {
        const i = idx * 4;
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = pad + ((max - d[valueKey]) / range) * (height - pad * 2);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} opacity="0.8" />;
      })}
    </svg>
  );
};

/* ── Donut Chart ── */
const DonutChart = ({ segments, size = 140, strokeWidth = 14 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none"
        stroke="rgba(139,92,246,0.08)" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLen = pct * circumference;
        const dashGap = circumference - dashLen;
        const rotation = (offset / total) * 360 - 90;
        offset += seg.value;
        return (
          <circle key={i} cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${dashGap}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size/2} ${size/2})`}
            style={{ transition:'stroke-dasharray 1s ease', filter:`drop-shadow(0 0 4px ${seg.color}44)` }}
          />
        );
      })}
      <text x={size/2} y={size/2 - 8} textAnchor="middle" fill="var(--text-primary)"
        fontSize="22" fontWeight="700" fontFamily="'Orbitron',sans-serif">
        {total}
      </text>
      <text x={size/2} y={size/2 + 12} textAnchor="middle" fill="var(--text-muted)"
        fontSize="10" fontFamily="'IBM Plex Mono',monospace" letterSpacing="0.1em">
        TOTAL
      </text>
    </svg>
  );
};

/* ── Threat Detail Modal ── */
const ThreatDetailModal = ({ threat, onClose }) => {
  if (!threat) return null;
  const { COUNTRY_NAMES } = window.ThreatCounterData;
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(5,6,15,0.85)',
      backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, padding:24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'linear-gradient(135deg, var(--bg-card) 0%, #141938 100%)',
        border:'1px solid var(--border-glow)',
        borderRadius:18, padding:32, width:'100%', maxWidth:580,
        color:'var(--text-primary)', maxHeight:'90vh', overflowY:'auto',
        boxShadow:'0 24px 80px rgba(139,92,246,0.2), 0 0 1px rgba(139,92,246,0.5)',
        animation:'fadeInUp 0.3s ease',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:'var(--text-muted)' }}>{threat.id}</span>
              <SeverityBadge severity={threat.severity} />
            </div>
            <h2 style={{ margin:0, fontSize:22, fontWeight:700, color:'var(--text-primary)', fontFamily:"'Orbitron',sans-serif", letterSpacing:'0.02em' }}>
              {threat.type}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)',
            color:'var(--text-secondary)', cursor:'pointer', fontSize:16, lineHeight:1,
            padding:'8px 10px', borderRadius:8, transition:'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.1)'}
          >✕</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          {[
            { label:'Source IP',      value:threat.sourceIp,                              mono:true },
            { label:'Target Port',    value:`${threat.targetPort} / ${threat.protocol}`,  mono:true },
            { label:'Country',        value:`${COUNTRY_NAMES[threat.country] || threat.country} (${threat.country})` },
            { label:'Status',         value:<StatusDot status={threat.status} /> },
            { label:'Traffic Volume', value:`${threat.trafficVolume.toLocaleString()} KB/s` },
            { label:'Failed Logins',  value:threat.failedLogins },
            { label:'ML Confidence',  value:`${threat.confidence}%` },
            { label:'Detected',       value:new Date(threat.timestamp).toLocaleTimeString() },
          ].map(({ label, value, mono }) => (
            <div key={label} style={{
              background:'rgba(10,13,26,0.6)', borderRadius:10, padding:'12px 16px',
              border:'1px solid var(--border)',
            }}>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:"'IBM Plex Mono',monospace" }}>{label}</div>
              <div style={{ fontSize:14, fontFamily:mono?"'IBM Plex Mono',monospace":"inherit", fontWeight:500 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{
          background:'rgba(10,13,26,0.6)', borderRadius:10, padding:'16px 18px',
          border:'1px solid var(--border)',
        }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:"'IBM Plex Mono',monospace" }}>ML Analysis</div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ flex:1, height:8, background:'rgba(139,92,246,0.1)', borderRadius:4, overflow:'hidden' }}>
              <div style={{
                width:`${threat.confidence}%`, height:'100%',
                background: threat.confidence > 85
                  ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                  : threat.confidence > 70
                    ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                    : 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                borderRadius:4, transition:'width 0.8s ease',
                boxShadow: `0 0 10px ${threat.confidence > 85 ? 'rgba(239,68,68,0.4)' : 'rgba(139,92,246,0.4)'}`,
              }} />
            </div>
            <span style={{ fontSize:16, fontWeight:700, minWidth:48, textAlign:'right', fontFamily:"'Orbitron',sans-serif",
              color: threat.confidence > 85 ? '#EF4444' : threat.confidence > 70 ? '#F59E0B' : '#8B5CF6',
            }}>{threat.confidence}%</span>
          </div>
          <p style={{ margin:'12px 0 0', fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>
            BERT-based classifier identified this as a <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{threat.type.toLowerCase()}</span> with{' '}
            <span style={{ color: threat.confidence > 85 ? '#EF4444' : '#F59E0B', fontWeight:600 }}>{threat.confidence}% confidence</span>{' '}
            based on traffic patterns, login anomalies, and port behavior analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Export to global scope ── */
window.ThreatCounterComponents = {
  DiamondBackground,
  SeverityBadge,
  StatusDot,
  StatCard,
  Sparkline,
  LineChart,
  DonutChart,
  ThreatDetailModal,
};
