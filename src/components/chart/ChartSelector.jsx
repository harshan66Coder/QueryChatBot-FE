import React, { useState } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

const data = [
  { name: "Jan", uv: 400, pv: 240 },
  { name: "Feb", uv: 600, pv: 320 },
  { name: "Mar", uv: 800, pv: 480 },
  { name: "Apr", uv: 500, pv: 300 },
];

export default function DynamicChart({ isDark }) {
  const [chartType, setChartType] = useState("line");

  const [colors, setColors] = useState([
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
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
    const updated = [...colors];
    updated[index] = newColor;
    setColors(updated);
  };

  return (
    <div className="flex flex-col items-center space-y-6">


      <div className="flex gap-250 ">


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
        <div className="flex space-x-4">
          {colors.map((c, i) => (
            <div key={i} className="flex flex-col items-center">
              <input
                type="color"
                value={c}
                onChange={(e) => handleColorChange(i, e.target.value)}
                className="w-10 h-10 cursor-pointer roundes-xl"
              />
            </div>
          ))}
        </div>
      </div>


      <div>
        {chartType === "line" && (
          <LineChart width={1450} height={700} data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="uv"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          </LineChart>
        )}

        {chartType === "bar" && (
          <BarChart width={1450} height={700} data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="uv" fill={colors[0]} animationDuration={2000} />
            <Bar dataKey="pv" fill={colors[1]} animationDuration={2000} />
          </BarChart>
        )}

        {chartType === "pie" && (
          <PieChart width={700} height={400}>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey="uv"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label
              isAnimationActive={true}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )}

        {chartType === "doughnut" && (
          <PieChart width={1450} height={700}>
            <Tooltip />
            <Legend />
            <Pie
              data={data}
              dataKey="uv"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={150}
              label
              isAnimationActive={true}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )}

        {chartType === "radar" && (
          <RadarChart outerRadius={150} width={1450} height={700} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar
              name="UV Value"
              dataKey="uv"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
              isAnimationActive={true}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        )}
      </div>
    </div>
  );
}
