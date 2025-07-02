import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin } from "antd";

const TableComponent = ({ list, pageParams }) => {
  const { accessToken } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const elementId = list.ID;

  console.log("LIST", list);

  useEffect(() => {
    if (!accessToken || !elementId) {
      console.warn("⛔ Missing accessToken or elementId");
      return;
    }

    const fetchTableData = async () => {
      const url = `/.netlify/functions/get-chart-data/${elementId}`;
      const body = {
        pageParams: { Parameter: pageParams || [] },
        elemID: elementId,
        elemType: "List",
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
        console.log("TABLE DATA", result);
        // setData(chartData);
      } catch (error) {
        console.error("❌ Error fetching TABLE DATA data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [accessToken, elementId]);

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
    <div className="bg-red-500 text-black">
      <p>Table</p>
    </div>
  );
};

export default TableComponent;
