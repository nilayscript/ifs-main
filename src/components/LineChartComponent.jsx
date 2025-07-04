import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const optimizeDataPoints = (series) => {
  return series.map((s) => {
    // Find all non-zero points
    const nonZeroPoints = s.data.filter((p) => p.y !== 0 && p.y !== null);

    // If few non-zero points, show them plus adjacent points
    if (nonZeroPoints.length <= 3 && s.data.length > 10) {
      const importantPoints = [];
      nonZeroPoints.forEach((p) => {
        const idx = s.data.findIndex((d) => d.x === p.x);
        // Include the point before and after each non-zero point
        if (idx > 0) importantPoints.push(s.data[idx - 1]);
        importantPoints.push(p);
        if (idx < s.data.length - 1) importantPoints.push(s.data[idx + 1]);
      });
      // Add first and last points for context
      importantPoints.push(s.data[0]);
      importantPoints.push(s.data[s.data.length - 1]);
      // Remove duplicates and sort
      const uniquePoints = [
        ...new Map(importantPoints.map((p) => [p.x, p])).values(),
      ];
      return {
        ...s,
        data: uniquePoints.sort((a, b) => a.x.localeCompare(b.x)),
      };
    }
    return s;
  });
};

const transformDataForChart = (apiData, chartConfig) => {
  console.log("Transforming data with chart config:", chartConfig);
  if (
    !apiData ||
    !apiData.data ||
    !apiData.data.rows ||
    !apiData.data.rows.length
  ) {
    return { series: [], xAxisKey: null, yAxisKey: null, seriesKey: null };
  }

  // Get field names from chart config
  const xAxisField = chartConfig?.XYDataSeries?.XColumn?.Name;
  const yAxisField = chartConfig?.XYDataSeries?.YColumn?.Name;
  const seriesField = chartConfig?.XYDataSeries?.FColumn?.Name;

  if (!xAxisField || !yAxisField) {
    console.error("Missing required fields in chart config");
    return { series: [], xAxisKey: null, yAxisKey: null, seriesKey: null };
  }

  // Get display names from API response (first row)
  const firstRow = apiData.data.rows[0].columns;
  const xAxisDisplayName = firstRow.find((col) =>
    col.Column.includes(xAxisField)
  )?.Name;
  const yAxisDisplayName = firstRow.find((col) =>
    col.Column.includes(yAxisField)
  )?.Name;
  const seriesDisplayName = seriesField
    ? firstRow.find((col) => col.Column.includes(seriesField))?.Name
    : null;

  console.log(
    "Using fields - xAxis:",
    xAxisField,
    "yAxis:",
    yAxisField,
    "series:",
    seriesField
  );
  console.log(
    "Display names - xAxis:",
    xAxisDisplayName,
    "yAxis:",
    yAxisDisplayName,
    "series:",
    seriesDisplayName
  );

  // Transform API response data into usable format
  const dataPoints = apiData.data.rows.map((row) => {
    const point = {};
    row.columns.forEach((col) => {
      // Match columns based on the field names from config
      if (col.Column.includes(xAxisField)) {
        point.xValue =
          col.TypeName === "NUMBER" ? parseFloat(col.Value) : col.Value;
        point.xName = col.Name;
      }
      if (col.Column.includes(yAxisField)) {
        point.yValue =
          col.TypeName === "NUMBER" ? parseFloat(col.Value) : col.Value;
        point.yName = col.Name;
      }
      if (seriesField && col.Column.includes(seriesField)) {
        point.seriesValue = col.Value;
        point.seriesName = col.Name;
      }
    });
    return point;
  });

  console.log("Transformed data points:", dataPoints);

  // Group data by series (if series field exists)
  const seriesMap = {};
  const allXValues = new Set();

  dataPoints.forEach((point) => {
    const seriesKey = seriesField ? point.seriesValue : "default";
    const xValue = point.xValue;
    const yValue = point.yValue;

    if (xValue === undefined || yValue === undefined) return;

    allXValues.add(xValue);

    if (!seriesMap[seriesKey]) {
      seriesMap[seriesKey] = {
        name: seriesField ? point.seriesValue : yAxisDisplayName || "Value",
        data: {},
      };
    }
    seriesMap[seriesKey].data[xValue] = yValue;
  });

  // Convert to array of xValues sorted appropriately
  const sortedXValues = Array.from(allXValues).sort((a, b) => {
    // Try to sort as dates if they look like dates
    if (
      typeof a === "string" &&
      typeof b === "string" &&
      a.match(/\d{4}-\d{2}/) &&
      b.match(/\d{4}-\d{2}/)
    ) {
      return new Date(a) - new Date(b);
    }
    // Otherwise sort as strings
    return String(a).localeCompare(String(b));
  });

  // Prepare series data in format expected by Recharts
  const series = Object.values(seriesMap).map((series) => ({
    name: series.name,
    data: sortedXValues.map((xValue) => ({
      x: xValue,
      y: series.data[xValue] !== undefined ? series.data[xValue] : null,
    })),
  }));

  console.log("Initial series data:", series);

  const finalSeries = optimizeDataPoints(series);

  console.log("Final series data:", finalSeries);

  return {
    series: finalSeries,
    xAxisKey: "x",
    yAxisKey: "y",
    allXValues: sortedXValues,
    originalConfig: {
      xAxisField,
      yAxisField,
      seriesField,
      xAxisDisplayName,
      yAxisDisplayName,
      seriesDisplayName,
    },
  };
};
const LineChartComponent = ({ chart, pageParams }) => {
  const { accessToken, pageId } = useParams();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const elementId = chart.ID;

  console.log("LINE CHART CONFIG", chart);

  useEffect(() => {
    if (!accessToken || !elementId) {
      console.warn("Missing required data: accessToken or elementId");
      return;
    }

    const fetchGraphData = async () => {
      const url = `/.netlify/functions/get-chart-data/${elementId}`;

      let updatedPageParams = pageParams;

      try {
        const filtersResponse = await fetch(
          `/.netlify/functions/get-page-filters?pageId=${pageId}`,
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
        elemType: "LineChart",
        clientTimeMillis: Date.now(),
      };

      try {
        setLoading(true);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const result = await response.json();
        console.log("LINE CHART RESPONSE", result);

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch data");
        }

        const transformedData = transformDataForChart(result, chart);
        setChartData(transformedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [accessToken, elementId, pageParams, pageId]);

  if (loading) return <div>Loading chart data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData || !chartData.series.length)
    return <div>No data available for chart</div>;

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
  ];

  // Calculate max Y value for domain with null checks
  const maxValue = Math.max(
    ...chartData.series
      .flatMap((series) => series.data.map((point) => point.y || 0))
      .filter(Number.isFinite)
  );

  const calculateYAxisInterval = (max) => {
    if (max <= 20) return 5;
    if (max <= 50) return 10;
    if (max <= 100) return 20;
    return Math.ceil(max / 5);
  };

  const yAxisInterval = calculateYAxisInterval(maxValue);
  const yAxisDomain = [
    0,
    Math.ceil((maxValue * 1.2) / yAxisInterval) * yAxisInterval,
  ];

  // Prepare data for Recharts with null checks
  const combinedData = chartData.allXValues
    .map((xValue) => {
      const dataPoint = { x: xValue };
      chartData.series.forEach((series) => {
        const point = series.data.find((p) => p.x === xValue);
        dataPoint[series.name] = point ? point.y : null;
      });
      return dataPoint;
    })
    .filter((point) => point.x !== undefined && point.x !== null);

  console.log("Combined chart data:", combinedData);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={combinedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            domain={yAxisDomain}
            tickCount={Math.ceil(yAxisDomain[1] / yAxisInterval) + 1}
            allowDecimals={false}
          />
          <Tooltip />
          <Legend />

          {chartData.series.map((series, index) => (
            <Line
              key={series.name}
              name={series.name}
              dataKey={series.name}
              stroke={colors[index % colors.length]}
              activeDot={{ r: 8 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
