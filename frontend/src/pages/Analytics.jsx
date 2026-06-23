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
} from "recharts";

import {
  attackFrequency,
  targetedPorts,
  trafficSpikes,
} from "../data/mockData";

function Analytics() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Analytics Dashboard</h1>

      <h2>Attack Frequency</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={attackFrequency}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="attacks" />
        </LineChart>
      </ResponsiveContainer>

      <h2>Targeted Ports</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={targetedPorts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="port" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>

      <h2>Traffic Spikes</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={trafficSpikes}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="minute" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="traffic" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Analytics;