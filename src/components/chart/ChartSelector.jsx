import React, { useState } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Jan", uv: 400, pv: 240 },
  { name: "Feb", uv: 600, pv: 320 },
  { name: "Mar", uv: 800, pv: 480 },
  { name: "Apr", uv: 500, pv: 300 },
];

export default function DynamicChart({ isDark }) {
  const [chartType, setChartType] = useState("line");

  // Default 4 gradient colors: purple, pink, blue, orange
  const [gradients, setGradients] = useState([
    { start: "#8a2be2", end: "#4b0082" }, // purple
    { start: "#ff69b4", end: "#ff1493" }, // pink
    { start: "#1e90ff", end: "#00bfff" }, // blue
    { start: "#ffa500", end: "#ff4500" }, // orange
  ]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "transparent", border: "none", padding: "5px" }}>
          <p style={{ margin: 0, color: "#8884d8" }}>
            {`${label} : ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...gradients];
    updated[index] = { start: newColor, end: gradients[index].end };
    setGradients(updated);
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full px-4">
      <div className="flex flex-wrap gap-4 justify-center w-full">
        <select
          className={`p-2 rounded-md shadow-md outline-none transition-colors duration-300 ${isDark
            ? "bg-gray-800 text-white border border-gray-600"
            : "bg-white text-black border border-gray-300"
            }`}
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="doughnut">Doughnut Chart</option>
          <option value="radar">Radar Chart</option>
        </select>

        <div className="flex space-x-2 flex-wrap">
          {gradients.map((g, i) => (
            <input
              key={i}
              type="color"
              value={g.start}
              onChange={(e) => handleColorChange(i, e.target.value)}
              className="w-10 h-10 cursor-pointer rounded-xl"
            />
          ))}
        </div>
      </div>

      <div className="w-full" style={{ height: "500px", maxWidth: "100%" }}>
        {chartType === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={gradients[0].start} />
                  <stop offset="100%" stopColor={gradients[0].end} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="uv"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ r: 6 }}
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                {gradients.map((g, i) => (
                  <linearGradient key={i} id={`barGradient${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={g.start} />
                    <stop offset="100%" stopColor={g.end} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="uv" fill="url(#barGradient0)" animationDuration={2000} />
              <Bar dataKey="pv" fill="url(#barGradient1)" animationDuration={2000} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {(chartType === "pie" || chartType === "doughnut") && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {gradients.map((g, i) => (
                  <linearGradient key={i} id={`pieGradient${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={g.start} />
                    <stop offset="100%" stopColor={g.end} />
                  </linearGradient>
                ))}
              </defs>
              <Tooltip />
              <Legend />
              <Pie
                data={data}
                dataKey="uv"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={chartType === "doughnut" ? 80 : 0}
                outerRadius={150}
                label
                isAnimationActive={true}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={`url(#pieGradient${index % gradients.length})`} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartType === "radar" && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradients[0].start} />
                  <stop offset="100%" stopColor={gradients[0].end} />
                </linearGradient>
              </defs>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar
                name="UV Value"
                dataKey="uv"
                stroke="url(#radarGradient)"
                fill="url(#radarGradient)"
                fillOpacity={0.6}
                isAnimationActive={true}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
