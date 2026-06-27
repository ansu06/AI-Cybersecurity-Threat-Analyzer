import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import ChartCard from "../components/ChartCard";
import {
  attackFrequency,
  targetedPorts,
  trafficSpikes,
} from "../data/mockData";

const statCards = [
  { label: "Critical alerts", value: "24", trend: "+12%", detail: "vs last hour" },
  { label: "Avg. attacks/hr", value: "18", trend: "+4%", detail: "steady increase" },
  { label: "High-risk ports", value: "4", trend: "2 active", detail: "needs attention" },
  { label: "Threat score", value: "87/100", trend: "High", detail: "monitor closely" },
];

const styles = {
  page: {
    padding: "24px",
    background: "linear-gradient(135deg, #f8fbff 0%, #f5f7ff 100%)",
    minHeight: "100vh",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    padding: "24px",
    borderRadius: "24px",
    background: "linear-gradient(90deg, #111827 0%, #1f2937 100%)",
    color: "#f9fafb",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.14)",
  },
  eyebrow: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.24em",
    fontSize: "11px",
    color: "#93c5fd",
    fontWeight: 700,
  },
  title: {
    margin: "6px 0",
    fontSize: "28px",
    fontWeight: 800,
  },
  subtitle: {
    margin: 0,
    color: "#d1d5db",
    maxWidth: "640px",
    lineHeight: 1.6,
  },
  heroBadge: {
    background: "rgba(255,255,255,0.14)",
    padding: "10px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "16px 18px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
    border: "1px solid #eef2ff",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "13px",
    margin: 0,
  },
  statValue: {
    margin: "6px 0 4px",
    fontSize: "24px",
    fontWeight: 800,
    color: "#0f172a",
  },
  statDetail: {
    margin: 0,
    fontSize: "12px",
    color: "#64748b",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    alignItems: "start",
  },
};

function Analytics() {
  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Security intelligence</p>
          <h1 style={styles.title}>Analytics Dashboard</h1>
          <p style={styles.subtitle}>
            Watch activity trends, understand high-risk ports, and stay ahead of unusual traffic patterns.
          </p>
        </div>
        <div style={styles.heroBadge}>Live • Updated 2m ago</div>
      </div>

      <div style={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} style={styles.statCard}>
            <p style={styles.statLabel}>{card.label}</p>
            <h3 style={styles.statValue}>{card.value}</h3>
            <p style={styles.statDetail}>{card.detail}</p>
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        <div style={styles.chartRow}>
          <ChartCard title="Attack Frequency" subtitle="Threat incidents over time" metric="Peak" trend="+18%" accent="#4f46e5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={attackFrequency}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="attacks" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2, stroke: "#4f46e5" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Targeted Ports" subtitle="Most exposed service endpoints" metric="Top port" trend="80" accent="#f59e0b">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={targetedPorts}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="port" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {targetedPorts.map((entry, index) => (
                    <Cell key={`${entry.port}-${index}`} fill={index % 2 === 0 ? "#f59e0b" : "#fb923c"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ marginTop: "20px" }}>
          <ChartCard title="Traffic Spikes" subtitle="Sudden network surges" metric="Peak" trend="2.5k" accent="#10b981">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trafficSpikes}>
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="minute" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="traffic" stroke="#10b981" strokeWidth={3} fill="url(#trafficGradient)" />
            </AreaChart>
          </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default Analytics;