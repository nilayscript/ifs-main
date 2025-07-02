import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GaugeChart from "react-gauge-chart";

const GaugeComponent = ({ elementId, pageParams }) => {
  const { accessToken } = useParams();
  const [gaugeValue, setGaugeValue] = useState(null);

  useEffect(() => {
    if (!accessToken || !elementId) return;

    const fetchGaugeData = async () => {
      const url = `/.netlify/functions/get-chart-data/${elementId}`;
      const body = {
        pageParams: { Parameter: pageParams || [] },
        elemID: elementId,
        elemType: "AnalogGauge",
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
        const value = parseFloat(
          result?.data?.rows?.[0]?.columns?.[0]?.Value ?? 0
        );
        setGaugeValue(value);
      } catch (error) {
        console.error("❌ Error fetching data:", error.message);
      }
    };

    fetchGaugeData();
  }, [accessToken, elementId]);

  // Normalize for react-gauge-chart (expects 0–1 value)
  const normalizedValue =
    gaugeValue !== null ? Math.min(gaugeValue / 100, 1) : 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        margin: "auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontWeight: "600", color: "#2f3e46" }}>PM/CM RATIO</h2>
      <GaugeChart
        id="pm-cm-gauge"
        nrOfLevels={100}
        arcsLength={[0.75, 0.1, 0.15]}
        colors={["#EF5350", "#4CAF50", "#FFA726"]}
        percent={normalizedValue}
        arcPadding={0.02}
        textColor="#000000"
        needleColor="#000000"
        needleBaseColor="#000000"
        formatTextValue={() => gaugeValue?.toFixed(2) ?? "--"}
        animate={false}
        style={{ height: "300px" }} // <-- Increase height here
      />
    </div>
  );
};

export default GaugeComponent;
