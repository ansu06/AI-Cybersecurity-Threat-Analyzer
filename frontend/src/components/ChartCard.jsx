function ChartCard({ title, subtitle, metric, trend, accent = "#4f46e5", children, style }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid #eef2ff",
        height: "100%",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
          gap: "12px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>{title}</h3>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>{subtitle}</p>
        </div>
        {(metric || trend) && (
          <div
            style={{
              background: `${accent}12`,
              color: accent,
              padding: "8px 10px",
              borderRadius: "999px",
              fontSize: "12px",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {metric} {trend}
          </div>
        )}
      </div>

      <div style={{ marginTop: "8px" }}>{children}</div>
    </div>
  );
}

export default ChartCard;
