import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin } from "antd";
import dayjs from "dayjs";

const TableComponent = ({ list, pageParams }) => {
  const { accessToken, pageId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const elementId = list.ID;

  // Filter columns based on Width > 0
  const allColumns = list.ColumnMapping?.MappedColumns?.MappedColumn || [];
  const columns = allColumns.filter((col) => col.Width && col.Width > 0);

  console.log("LIST MAPPING:", columns, elementId);

  useEffect(() => {
    if (!accessToken || !elementId) {
      console.warn("⛔ Missing accessToken or elementId");
      return;
    }

    const fetchTableData = async () => {
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
        console.log("TABLE DATA", result, elementId);
        setData(result.data?.rows || []);
      } catch (error) {
        console.error("❌ Error fetching TABLE DATA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableData();
  }, [accessToken, elementId, pageParams]);

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

  const getCellValue = (column, row) => {
    const field = column.Name;
    const found = row.columns.find((col) => col.Name === field);
    let value = found ? found.Value : "";

    // Check if this is an icon (dot) column:
    if (column.Column.startsWith("ICON_COLUMN")) {
      const conds = column.ConditionalFormats?.ConditionalFormatting || [];
      let targetField = conds[0]?.ColumnName;
      const targetValueObj = row.columns.find((col) =>
        col.Column.includes(targetField)
      );
      const targetValue = targetValueObj ? Number(targetValueObj.Value) : 0;

      const isRed =
        pageId === "3556d3b6-b159-40f3-8c7d-41619a7204f7"
          ? !(targetValue > 0)
          : targetValue > 0;
      return (
        <span
          style={{
            display: "inline-block",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: isRed ? "red" : "green",
          }}
        ></span>
      );
    }

    // Check for date field:
    const isDateField =
      column.TypeName === "DATE" ||
      (found && found.Type === 93 && found.TypeName === "DATE");

    if (isDateField && value) {
      const formatted = dayjs(value).format("YYYY-MM-DD HH:mm:ss");
      return formatted;
    }

    // Normal numeric or text column:
    return value;
  };

  return (
    <div className="overflow-x-auto p-4 text-gray-800">
      <h2 className="font-bold text-lg mb-4">{list.Title}</h2>
      <div className="rounded-lg shadow-md">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              {columns.map((col) => (
                <th
                  key={col.Name}
                  className="border border-gray-300 px-3 py-2 text-left"
                >
                  {col.DisplayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td
                    key={col.Name}
                    className="border border-gray-300 px-3 py-2"
                  >
                    {getCellValue(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;
