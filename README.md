# 🛡️ SENTINEL — Threat Counter

Real-time cyber threat monitoring dashboard with live threat stream analysis, forensic investigation, and attack counter visualization.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

- **Active Threats** — Live count of currently active threats with severity indicators
- **Total Threat Count** — Running total of all detected threats with mitigation status
- **Attack Counts** — Aggregated failed login attempts and attack metrics
- **Threat Stream Table** — Paginated, filterable, sortable threat event table
- **Threat Forensics Panel** — Deep analysis with severity distribution and attack breakdowns
- **Attack Frequency Charts** — 24-hour hourly attack and traffic distribution
- **Geographic Origins** — Country-level attack origin mapping
- **Traffic Anomaly Detection** — Volume spike visualization with anomaly detection
- **Live Mode** — Real-time threat injection (toggleable)

## 📁 Project Structure

```
threat-counter/
├── index.html                          # HTML entry point (loads all scripts)
├── threat-counter.css                  # Global styles, design tokens, animations
├── js/
│   ├── threat-counter-data.js          # Data layer — constants & mock generators
│   ├── threat-counter-components.jsx   # Reusable UI components (React/JSX)
│   └── ThreatCounter.jsx              # Main dashboard application
├── ThreatDashboard.jsx                 # (Legacy — standalone component reference)
└── README.md
```

### File Breakdown

| File | Purpose | Dependencies |
|------|---------|-------------|
| `threat-counter.css` | Design tokens, base styles, all keyframe animations | None |
| `threat-counter-data.js` | Attack types, severities, countries, mock data generators | None (plain JS) |
| `threat-counter-components.jsx` | DiamondBackground, SeverityBadge, StatusDot, StatCard, Charts, Modal | React, CSS vars |
| `ThreatCounter.jsx` | Main app — state management, layout, renders all sections | Data + Components |

## 🏃 Running Locally

> **Note:** Babel standalone requires files to be served over HTTP (not `file://` protocol). Use any local server:

### Option 1: Python
```bash
python -m http.server 8080
# Open http://localhost:8080
```

### Option 2: Node.js (npx)
```bash
npx serve .
# Open the URL printed in the terminal
```

### Option 3: VS Code
Install the **Live Server** extension and click "Go Live".

## 🛠️ Tech Stack

- **React 18** — UI library (loaded via CDN)
- **Babel Standalone** — In-browser JSX compilation
- **Vanilla CSS** — Custom properties, animations, no framework
- **SVG** — Hand-built charts (Line, Donut, Sparkline, Bar)

## 👥 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/new-widget`)
3. Commit your changes (`git commit -m 'Add new threat widget'`)
4. Push to the branch (`git push origin feature/new-widget`)
5. Open a Pull Request

## 📄 License

MIT
