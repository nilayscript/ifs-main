import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import GaugeChart from "react-gauge-chart";

const GaugeComponent = ({ elementId, pageParams, theme }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const accessToken = params.get("accessToken");
  const pageId = params.get("pageId");
  const [gaugeValue, setGaugeValue] = useState(null);

  useEffect(() => {
    if (!accessToken || !elementId) return;

    const fetchGaugeData = async () => {
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
        console.error("❌ Error fetching gauge data:", error.message);
      }
    };

    fetchGaugeData();
  }, [accessToken, elementId, pageParams, pageId]);
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
