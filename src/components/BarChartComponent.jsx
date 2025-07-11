import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Utility function: extract keys from chart definition
const extractChartKeys = (chart) => {
  const mappedCols = chart?.ColumnMapping?.MappedColumns?.MappedColumn || [];

  // Build a lookup from raw SQL → mapped Name
  const columnMap = {};
  mappedCols.forEach(({ Column, Name }) => {
    columnMap[Column] = Name;
  });

  const getMappedName = (raw) => columnMap[raw] || raw;

  const rawX = chart?.XYDataSeries?.XColumn?.Name;
  const rawY = chart?.XYDataSeries?.YColumn?.Name;

  const primaryXKey = getMappedName(rawX);
  const primaryYKey = getMappedName(rawY);

  const isMultiSeries = chart?.UseMultiSeries === true;
  const optionalYKeys = isMultiSeries
    ? (chart?.OptionalDataSeries?.XYDataSeries || []).map((s) =>
        getMappedName(s?.YColumn?.Name)
      )
    : [];

  return {
    xKey: primaryXKey,
    yKeys: [primaryYKey, ...optionalYKeys],
    isMultiSeries,
  };
};

const BarChartComponent = ({ chart, pageParams, theme }) => {
  const [data, setData] = useState([]);
  const [xKey, setXKey] = useState(null);
  const [yKeys, setYKeys] = useState([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const accessToken = params.get("accessToken");
  const pageId = params.get("pageId");
  const elementId = chart?.ID;

  const {
    xKey: initialXKey,
    yKeys: initialYKeys,
    isMultiSeries,
  } = extractChartKeys(chart);
  const yColumn = chart?.XYDataSeries?.YColumn;
  const isTopNEnabled = chart?.XYDataSeries?.TopNOptions?.Enabled === true;

  console.log("CHART", chart, elementId);

  useEffect(() => {
    if (!accessToken || !elementId) {
      console.warn("⛔ Missing required data: accessToken or elementId");
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
        elemType: "BarChart",
        clientTimeMillis: Date.now(),
        isTopNEnabled,
        yColumn,
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

        let transformedData = rows.map((row) => {
          const obj = {};
          row.columns.forEach((col) => {
            const key = col.Name;
            const value =
              col.TypeName === "NUMBER" ? parseFloat(col.Value) : col.Value;
            obj[key] = value;
          });
          return obj;
        });

        if (transformedData.length === 1) {
          const row = transformedData[0];
          const pivoted = Object.entries(row)
            .filter(([_, val]) => typeof val === "number")
            .map(([key, val]) => ({ Metric: key, Value: val }));

          setData(pivoted);
          setXKey("Metric");
          setYKeys(["Value"]);
        } else {
          setData(transformedData);
          setXKey(initialXKey);
          setYKeys(initialYKeys);
        }
      } catch (error) {
        console.error(`❌ Error fetching chart data:`, error.message);
      }
    };

    fetchGraphData();
  }, [accessToken, elementId, pageParams, pageId]);

  const xLabel = chart?.XAxisTitle || xKey;
  const yLabel =
    chart?.YAxisTitle || (yKeys.length === 1 ? yKeys[0] : "Values");

  const colorPalette = theme?.chartColors || [];

  console.log("yKeys", yKeys);
  console.log("First data row", data[0]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      {data.length > 0 ? (
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              label={{ value: xLabel, position: "insideBottom", offset: -5 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: yLabel, angle: -90, position: "insideLeft" }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            {yKeys.length > 1 && <Legend />}
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colorPalette[index % colorPalette.length]}
                name={key}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-sm">No data available</p>
      )}
    </div>
  );
};

export default BarChartComponent;
