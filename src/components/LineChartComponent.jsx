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

const transformDataForChart = (apiData) => {
  if (!apiData) return { series: [], xAxisKey: null, valueFields: [] };

  let rows = [];
  if (apiData.data && apiData.data.rows) {
    rows = apiData.data.rows;
  } else if (Array.isArray(apiData)) {
    rows = apiData;
  }

  if (!rows.length) return { series: [], xAxisKey: null, valueFields: [] };

  const dataPoints = rows.map((row) => {
    const point = {};
    row.columns.forEach((col) => {
      point[col.Name] =
        col.TypeName === "NUMBER" ? parseFloat(col.Value) : col.Value;
    });
    return point;
  });

  const potentialSeriesFields = Object.keys(dataPoints[0] || {}).filter(
    (key) =>
      !dataPoints.some((point) => typeof point[key] === "number") &&
      new Set(dataPoints.map((p) => p[key])).size > 1
  );

  const potentialValueFields = Object.keys(dataPoints[0] || {}).filter((key) =>
    dataPoints.some((point) => typeof point[key] === "number")
  );

  const potentialXAxisFields = Object.keys(dataPoints[0] || {}).filter(
    (key) =>
      !dataPoints.some((point) => typeof point[key] === "number") &&
      key !== potentialSeriesFields[0]
  );

  const seriesField = potentialSeriesFields[0] || null;
  const xAxisField =
    potentialXAxisFields[0] || Object.keys(dataPoints[0] || {})[0];
  const valueFields = potentialValueFields.length ? potentialValueFields : [];

  if (!valueFields.length) {
    return { series: [], xAxisKey: null, valueFields: [] };
  }

  let series = [];
  if (seriesField) {
    const seriesNames = [...new Set(dataPoints.map((p) => p[seriesField]))];
    series = seriesNames.map((seriesName) => {
      const seriesData = dataPoints
        .filter((p) => p[seriesField] === seriesName)
        .map((point) => {
          const dataPoint = { ...point };
          delete dataPoint[seriesField];
          return dataPoint;
        });
      return {
        name: seriesName,
        data: seriesData,
      };
    });
  } else {
    series = [
      {
        name: "Data",
        data: dataPoints,
      },
    ];
  }

  return {
    series,
    xAxisKey: xAxisField,
    valueFields,
  };
};

const LineChartComponent = ({ elementId, pageParams }) => {
  const { accessToken, pageId } = useParams();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken || !elementId) {
      console.warn("Missing required data: accessToken or elementId");
      return;
    }

    const fetchGraphData = async () => {
      const url = `/.netlify/functions/get-chart-data/${elementId}`;
      const body = {
        pageParams: { Parameter: pageParams || [] },
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

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch data");
        }

        const transformedData = transformDataForChart(result);
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
  }, [accessToken, elementId]);

  if (loading) return <div>Loading chart data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData || !chartData.series.length || !chartData.valueFields.length)
    return <div>No numeric data available for chart</div>;

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  const maxValue = Math.max(
    ...chartData.series.flatMap((series) =>
      series.data.flatMap((point) =>
        chartData.valueFields.map((field) => point[field] || 0)
      )
    )
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

  const allXAxisValues = [
    ...new Set(
      chartData.series.flatMap((series) =>
        series.data.map((point) => point[chartData.xAxisKey])
      )
    ),
  ].sort();

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          margin={{ top: 20, right: 30, left: 20 }}
          data={allXAxisValues.map((value) => ({
            [chartData.xAxisKey]: value,
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={chartData.xAxisKey}
            angle={-55}
            textAnchor="end"
            height={100}
            ticks={allXAxisValues}
            padding={{ left: 200, right: 30 }}
          />
          <YAxis
            domain={yAxisDomain}
            tickCount={Math.ceil(yAxisDomain[1] / yAxisInterval) + 1}
            allowDecimals={false}
          />
          <Tooltip />
          <Legend />

          {chartData.series.map((series, index) => {
            const dataMap = new Map(
              series.data.map((point) => [point[chartData.xAxisKey], point])
            );

            return chartData.valueFields.map((field, fieldIndex) => (
              <Line
                key={`${series.name}-${field}`}
                name={
                  chartData.series.length > 1
                    ? `${series.name} - ${field}`
                    : field
                }
                data={allXAxisValues.map((xValue) => {
                  const point = dataMap.get(xValue);
                  return point
                    ? { ...point }
                    : { [chartData.xAxisKey]: xValue, [field]: null };
                })}
                dataKey={field}
                stroke={colors[(index + fieldIndex) % colors.length]}
                activeDot={{ r: 8 }}
                connectNulls={false}
              />
            ));
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
