import { useState, useEffect, useRef } from "react";

const COLORS = {
  critical: "#E24B4A",
  high: "#EF9F27",
  medium: "#378ADD",
  low: "#1D9E75",
  bg: "#0B0F1A",
  card: "#111827",
  cardBorder: "#1E293B",
  text: "#E2E8F0",
  muted: "#64748B",
  accent: "#378ADD",
};

const generateThreats = () => {
  const types = ["Port Scan", "Brute Force", "DDoS", "SQL Injection", "XSS Attack", "MITM", "Malware C2", "Phishing"];
  const severities = ["critical", "high", "medium", "low"];
  const statuses = ["active", "mitigated", "investigating"];
  const protocols = ["TCP", "UDP", "HTTP", "HTTPS", "SSH", "FTP"];
  const countries = ["US", "RU", "CN", "BR", "DE", "KR", "IR", "UA"];
  return Array.from({ length: 24 }, (_, i) => ({
    id: `THR-${1000 + i}`,
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    sourceIp: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    targetPort: [22, 80, 443, 3306, 8080, 21, 25, 3389][Math.floor(Math.random() * 8)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    trafficVolume: Math.floor(Math.random() * 9000) + 100,
    failedLogins: Math.floor(Math.random() * 200),
    confidence: Math.floor(Math.random() * 40) + 60,
  }));
};

const initialThreats = generateThreats();

const generateTimeData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    attacks: Math.floor(Math.random() * 80) + 5,
    traffic: Math.floor(Math.random() * 4000) + 500,
  }));

const timeData = generateTimeData();

const portData = [
  { port: "80/HTTP", count: 342 },
  { port: "22/SSH", count: 289 },
  { port: "443/HTTPS", count: 201 },
  { port: "3306/MySQL", count: 178 },
  { port: "8080/Alt", count: 134 },
  { port: "21/FTP", count: 98 },
  { port: "3389/RDP", count: 87 },
  { port: "25/SMTP", count: 54 },
];

const MiniBarChart = ({ data, valueKey, color, height = 60 }) => {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${data.length * 14} ${height}`} preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = (d[valueKey] / max) * (height - 4);
        return (
          <rect
            key={i}
            x={i * 14 + 2}
            y={height - barH}
            width={10}
            height={barH}
            fill={color}
            opacity={0.7 + (i / data.length) * 0.3}
            rx={2}
          />
        );
      })}
    </svg>
  );
};

const LineChart = ({ data, valueKey, color, height = 120 }) => {
  const max = Math.max(...data.map((d) => d[valueKey]));
  const min = Math.min(...data.map((d) => d[valueKey]));
  const w = 600;
  const pad = 8;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + ((max - d[valueKey]) / (max - min)) * (height - pad * 2);
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `M ${points[0]} L ${points.join(" L ")} L ${600 - pad},${height - pad} L ${pad},${height - pad} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${valueKey})`} />
      <path d={pathD} stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" />
    </svg>
  );
};

const HorizontalBar = ({ data }) => {
  const max = data[0].count;
  const colors = [COLORS.critical, COLORS.high, COLORS.medium, COLORS.accent, COLORS.low, "#7F77DD", "#D4537E", "#888780"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={d.port} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 90, fontSize: 11, color: COLORS.muted, fontFamily: "monospace", flexShrink: 0 }}>{d.port}</span>
          <div style={{ flex: 1, height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${(d.count / max) * 100}%`,
                height: "100%",
                background: colors[i % colors.length],
                borderRadius: 4,
                transition: "width 1s ease",
              }}
            />
          </div>
          <span style={{ width: 36, fontSize: 11, color: COLORS.muted, textAlign: "right", flexShrink: 0 }}>{d.count}</span>
        </div>
      ))}
    </div>
  );
};

const SeverityBadge = ({ severity }) => {
  const map = {
    critical: { bg: "#3D1515", color: COLORS.critical, label: "CRITICAL" },
    high: { bg: "#3D2A0A", color: COLORS.high, label: "HIGH" },
    medium: { bg: "#0D2340", color: COLORS.medium, label: "MEDIUM" },
    low: { bg: "#0A2820", color: COLORS.low, label: "LOW" },
  };
  const s = map[severity] || map.low;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 4,
        letterSpacing: "0.08em",
        border: `1px solid ${s.color}33`,
      }}
    >
      {s.label}
    </span>
  );
};

const StatusDot = ({ status }) => {
  const map = {
    active: { color: COLORS.critical, label: "Active" },
    mitigated: { color: COLORS.low, label: "Mitigated" },
    investigating: { color: COLORS.high, label: "Investigating" },
  };
  const s = map[status] || map.active;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: s.color }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
          display: "inline-block",
          boxShadow: status === "active" ? `0 0 6px ${s.color}` : "none",
        }}
      />
      {s.label}
    </span>
  );
};

const ThreatDetailModal = ({ threat, onClose }) => {
  if (!threat) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111827",
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 560,
          color: COLORS.text,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: COLORS.muted }}>{threat.id}</span>
              <SeverityBadge severity={threat.severity} />
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{threat.type}</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.muted,
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Source IP", value: threat.sourceIp, mono: true },
            { label: "Target Port", value: `${threat.targetPort} / ${threat.protocol}`, mono: true },
            { label: "Country", value: threat.country },
            { label: "Status", value: <StatusDot status={threat.status} /> },
            { label: "Traffic Volume", value: `${threat.trafficVolume.toLocaleString()} KB/s` },
            { label: "Failed Logins", value: threat.failedLogins },
            { label: "ML Confidence", value: `${threat.confidence}%` },
            { label: "Detected", value: new Date(threat.timestamp).toLocaleTimeString() },
          ].map(({ label, value, mono }) => (
            <div
              key={label}
              style={{
                background: "#0B0F1A",
                borderRadius: 8,
                padding: "10px 14px",
                border: `1px solid ${COLORS.cardBorder}`,
              }}
            >
              <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              <div style={{ fontSize: 14, fontFamily: mono ? "monospace" : "inherit", fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0B0F1A", borderRadius: 8, padding: "12px 16px", border: `1px solid ${COLORS.cardBorder}` }}>
          <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>ML Analysis</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 6, background: "#1E293B", borderRadius: 3 }}>
              <div
                style={{
                  width: `${threat.confidence}%`,
                  height: "100%",
                  background: threat.confidence > 85 ? COLORS.critical : threat.confidence > 70 ? COLORS.high : COLORS.medium,
                  borderRadius: 3,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 40, textAlign: "right" }}>{threat.confidence}%</span>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: COLORS.muted, lineHeight: 1.6 }}>
            The BERT model classified this event as a{" "}
            <span style={{ color: COLORS.text }}>{threat.type.toLowerCase()}</span> with{" "}
            <span style={{ color: threat.confidence > 85 ? COLORS.critical : COLORS.high }}>{threat.confidence}% confidence</span> based on traffic patterns, login anomalies, and port behavior.
          </p>
        </div>
      </div>
    </div>
  );
};

const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes scanline {
    0% { transform: translateY(0); }
    100% { transform: translateY(100%); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function ThreatDashboard() {
  const [threats, setThreats] = useState(initialThreats);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [filter, setFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("timestamp");
  const [liveMode, setLiveMode] = useState(true);
  const [page, setPage] = useState(0);
  const [tick, setTick] = useState(0);
  const pageSize = 8;

  useEffect(() => {
    if (!liveMode) return;
    const id = setInterval(() => {
      setTick((t) => t + 1);
      if (Math.random() < 0.35) {
        const newThreat = generateThreats()[0];
        newThreat.id = `THR-${2000 + Math.floor(Math.random() * 9000)}`;
        newThreat.timestamp = new Date().toISOString();
        setThreats((prev) => [newThreat, ...prev].slice(0, 40));
      }
    }, 3000);
    return () => clearInterval(id);
  }, [liveMode]);

  const active = threats.filter((t) => t.status === "active");
  const critical = threats.filter((t) => t.severity === "critical");
  const mitigated = threats.filter((t) => t.status === "mitigated");

  const filtered = threats
    .filter((t) => {
      if (filter === "active") return t.status === "active";
      if (filter === "critical") return t.severity === "critical";
      if (filter === "mitigated") return t.status === "mitigated";
      return true;
    })
    .filter((t) => severityFilter === "all" || t.severity === severityFilter)
    .sort((a, b) => {
      if (sortBy === "timestamp") return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === "severity") {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
      }
      if (sortBy === "traffic") return b.trafficVolume - a.trafficVolume;
      return 0;
    });

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const totalAttacks = threats.reduce((s, t) => s + (t.failedLogins || 0), 0);
  const avgConfidence = Math.round(threats.reduce((s, t) => s + t.confidence, 0) / threats.length);

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        color: COLORS.text,
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        padding: "0 0 40px",
      }}
    >
      <style>{pulseKeyframes}</style>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div
        style={{
          background: "#0B0F1A",
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" stroke={COLORS.critical} strokeWidth="2" fill={`${COLORS.critical}22`} />
              <path d="M12 7V13M12 15V17" stroke={COLORS.critical} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.04em" }}>SENTINEL</span>
            <span style={{ fontSize: 10, color: COLORS.muted, padding: "2px 6px", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 4 }}>THREAT MONITOR</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: liveMode ? COLORS.low : COLORS.muted }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: liveMode ? COLORS.low : COLORS.muted,
                display: "inline-block",
                animation: liveMode ? "pulse 1.5s infinite" : "none",
              }}
            />
            {liveMode ? "LIVE" : "PAUSED"}
          </div>
          <button
            onClick={() => setLiveMode((l) => !l)}
            style={{
              background: liveMode ? `${COLORS.critical}22` : `${COLORS.low}22`,
              border: `1px solid ${liveMode ? COLORS.critical : COLORS.low}55`,
              color: liveMode ? COLORS.critical : COLORS.low,
              fontSize: 11,
              padding: "5px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.05em",
            }}
          >
            {liveMode ? "⏸ PAUSE" : "▶ RESUME"}
          </button>
          <span style={{ fontSize: 11, color: COLORS.muted }}>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div style={{ padding: "24px 28px", animation: "fadeIn 0.4s ease" }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            {
              label: "ACTIVE THREATS",
              value: active.length,
              sub: `${critical.length} critical`,
              color: COLORS.critical,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9V13M12 17H12.01M12 3L2 20H22L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              label: "TOTAL THREATS",
              value: threats.length,
              sub: `${mitigated.length} mitigated`,
              color: COLORS.high,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              label: "ATTACK COUNT",
              value: totalAttacks.toLocaleString(),
              sub: "failed login attempts",
              color: COLORS.medium,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8H17V6C17 3.24 14.76 1 12 1S7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8Z" stroke="currentColor" strokeWidth="2" />
                </svg>
              ),
            },
            {
              label: "ML CONFIDENCE",
              value: `${avgConfidence}%`,
              sub: "avg detection rate",
              color: COLORS.low,
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16V8C21 6.9 20.1 6 19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 12H17M7 9H12M7 15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
            },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: COLORS.card,
                border: `1px solid ${card.color}33`,
                borderRadius: 12,
                padding: "18px 20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: card.color, opacity: 0.6 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: COLORS.muted, letterSpacing: "0.1em" }}>{card.label}</span>
                <span style={{ color: card.color, opacity: 0.8 }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, marginBottom: 4, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Active Threat Alerts */}
        {active.slice(0, 3).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 10 }}>LIVE ACTIVE THREATS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {active.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedThreat(t)}
                  style={{
                    background: `${COLORS.critical}0D`,
                    border: `1px solid ${COLORS.critical}33`,
                    borderRadius: 8,
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${COLORS.critical}88`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${COLORS.critical}33`)}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.critical, animation: "pulse 1s infinite", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: COLORS.critical, fontWeight: 600, minWidth: 90 }}>{t.type}</span>
                  <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>{t.sourceIp}</span>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>→ Port {t.targetPort}</span>
                  <span style={{ fontSize: 11, color: COLORS.muted, marginLeft: "auto" }}>{new Date(t.timestamp).toLocaleTimeString()}</span>
                  <span style={{ fontSize: 10, color: COLORS.critical }}>{t.confidence}% match ›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Attack Frequency */}
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: "18px 20px", gridColumn: "span 2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 2 }}>ATTACK FREQUENCY</div>
                <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'IBM Plex Sans', sans-serif" }}>Hourly Attack Distribution (24h)</div>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                <span style={{ color: COLORS.critical, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 16, height: 2, background: COLORS.critical, display: "inline-block" }} /> Attacks
                </span>
                <span style={{ color: COLORS.medium, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 16, height: 2, background: COLORS.medium, display: "inline-block" }} /> Traffic
                </span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <LineChart data={timeData} valueKey="attacks" color={COLORS.critical} height={100} />
            </div>
            <LineChart data={timeData} valueKey="traffic" color={COLORS.medium} height={80} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {["00", "04", "08", "12", "16", "20", "23"].map((h) => (
                <span key={h} style={{ fontSize: 10, color: COLORS.muted }}>{h}:00</span>
              ))}
            </div>
          </div>

          {/* Targeted Ports */}
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 4 }}>TARGETED PORTS</div>
            <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 16 }}>Top Attack Vectors</div>
            <HorizontalBar data={portData} />
          </div>
        </div>

        {/* Traffic Spikes */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 2 }}>TRAFFIC VOLUME SPIKES</div>
              <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'IBM Plex Sans', sans-serif" }}>Network Traffic Anomaly Detection (KB/s)</div>
            </div>
            <div style={{ fontSize: 11, color: COLORS.high, padding: "3px 10px", background: `${COLORS.high}18`, border: `1px solid ${COLORS.high}44`, borderRadius: 6 }}>
              {timeData.filter((d) => d.traffic > 3500).length} anomalies detected
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3, height: 80, alignItems: "flex-end" }}>
            {timeData.map((d, i) => {
              const h = (d.traffic / 4500) * 80;
              const isSpike = d.traffic > 3500;
              return (
                <div
                  key={i}
                  title={`${d.hour}: ${d.traffic} KB/s`}
                  style={{
                    height: h,
                    background: isSpike ? COLORS.high : `${COLORS.medium}55`,
                    borderRadius: "2px 2px 0 0",
                    cursor: "default",
                    transition: "opacity 0.2s",
                    border: isSpike ? `1px solid ${COLORS.high}88` : "none",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {timeData.filter((_, i) => i % 4 === 0).map((d) => (
              <span key={d.hour} style={{ fontSize: 10, color: COLORS.muted }}>{d.hour}</span>
            ))}
          </div>
        </div>

        {/* Threat Table */}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.cardBorder}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 1 }}>THREAT INTELLIGENCE TABLE</div>
              <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'IBM Plex Sans', sans-serif" }}>{filtered.length} events</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["all", "active", "critical", "mitigated"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(0); }}
                  style={{
                    background: filter === f ? `${COLORS.accent}22` : "transparent",
                    border: `1px solid ${filter === f ? COLORS.accent : COLORS.cardBorder}`,
                    color: filter === f ? COLORS.accent : COLORS.muted,
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {f}
                </button>
              ))}
              <select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}
                style={{
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  color: COLORS.muted,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: COLORS.bg,
                  border: `1px solid ${COLORS.cardBorder}`,
                  color: COLORS.muted,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <option value="timestamp">Sort: Latest</option>
                <option value="severity">Sort: Severity</option>
                <option value="traffic">Sort: Traffic</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0B0F1A" }}>
                  {["ID", "TYPE", "SEVERITY", "SOURCE IP", "PORT", "STATUS", "TRAFFIC", "CONFIDENCE", "TIME", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 10,
                        color: COLORS.muted,
                        letterSpacing: "0.08em",
                        fontWeight: 500,
                        borderBottom: `1px solid ${COLORS.cardBorder}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((t, i) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedThreat(t)}
                    style={{
                      borderBottom: `1px solid ${COLORS.cardBorder}`,
                      cursor: "pointer",
                      transition: "background 0.15s",
                      background: i % 2 === 0 ? "transparent" : "#0D1320",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#0D1320")}
                  >
                    <td style={{ padding: "10px 14px", color: COLORS.muted, fontFamily: "monospace", fontSize: 11 }}>{t.id}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 500, whiteSpace: "nowrap" }}>{t.type}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <SeverityBadge severity={t.severity} />
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", color: COLORS.muted, fontSize: 11 }}>{t.sourceIp}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", color: COLORS.muted }}>{t.targetPort}/{t.protocol}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <StatusDot status={t.status} />
                    </td>
                    <td style={{ padding: "10px 14px", color: t.trafficVolume > 5000 ? COLORS.high : COLORS.muted }}>
                      {t.trafficVolume.toLocaleString()} KB/s
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 40, height: 4, background: "#1E293B", borderRadius: 2, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${t.confidence}%`,
                              height: "100%",
                              background: t.confidence > 85 ? COLORS.critical : t.confidence > 70 ? COLORS.high : COLORS.medium,
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <span style={{ color: COLORS.muted, fontSize: 11 }}>{t.confidence}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", color: COLORS.muted, fontSize: 11, whiteSpace: "nowrap" }}>
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: "10px 14px", color: COLORS.accent, fontSize: 11 }}>›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: COLORS.muted }}>
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  background: "transparent",
                  border: `1px solid ${COLORS.cardBorder}`,
                  color: page === 0 ? COLORS.muted : COLORS.text,
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 6,
                  cursor: page === 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: page === 0 ? 0.4 : 1,
                }}
              >
                ‹ Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                    background: page === i ? COLORS.accent : "transparent",
                    border: `1px solid ${page === i ? COLORS.accent : COLORS.cardBorder}`,
                    color: page === i ? "#fff" : COLORS.muted,
                    fontSize: 11,
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  background: "transparent",
                  border: `1px solid ${COLORS.cardBorder}`,
                  color: page >= totalPages - 1 ? COLORS.muted : COLORS.text,
                  fontSize: 12,
                  padding: "4px 12px",
                  borderRadius: 6,
                  cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                }}
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedThreat && <ThreatDetailModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />}
    </div>
  );
}
