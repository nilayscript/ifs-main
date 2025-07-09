import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Spin } from "antd";

const PieChartComponent = ({ elementId, pageParams, theme }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const accessToken = params.get("accessToken");
  const pageId = params.get("pageId");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = theme?.chartColors || [];

  useEffect(() => {
    if (!accessToken || !elementId) {
      console.warn("⛔ Missing accessToken or elementId");
      return;
    }

    const fetchGraphData = async () => {
      const url = `https://yzwf67apqf.execute-api.ap-south-1.amazonaws.com/prod/get-chart-data/${elementId}`;

      let updatedPageParams = pageParams;

      try {
        const filtersResponse = await fetch(
          `https://x027g5pm15.execute-api.ap-south-1.amazonaws.com/prod/get-page-filters?pageId=${pageId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (filtersResponse.ok) {
          const { filters } = await filtersResponse.json();
          updatedPageParams = pageParams.map((param) => ({
            ...param,
            Value: filters[param.Name] ?? param.Value,
          }));
        } else {
          console.warn(
            "⚠️ Failed to fetch filters, proceeding without overrides"
          );
        }
      } catch (err) {
        console.error("❌ Error fetching filters:", err);
      }

      const body = {
        pageParams: { Parameter: updatedPageParams || [] },
        elemID: elementId,
        elemType: "PieChart",
        clientTimeMillis: Date.now(),
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const result = await response.json();
        const rows = result?.data?.rows || [];

        const chartData = rows.map((row) => {
          const nameColumn = row.columns.find(
            (col) => col.TypeName === "VARCHAR2"
          );
          const valueColumn = row.columns.find(
            (col) => col.TypeName === "NUMBER"
          );

          return {
            name: nameColumn?.Value || "Unknown",
            value: parseFloat(valueColumn?.Value || "0"),
          };
        });

        setData(chartData);
      } catch (error) {
        console.error("❌ Error fetching pie chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [accessToken, elementId, pageParams, pageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spin size="large" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6">No data available.</div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          dataKey="value"
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          fill="#8884d8"
          label={({ name, value, percent }) =>
            `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="#fff"
            />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
