import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const LinkObjectCards = ({
  links = [],
  parentElementId,
  pageParams,
  theme,
}) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const accessToken = params.get("accessToken");
  const pageId = params.get("pageId");
  const [linkData, setLinkData] = useState({});

  useEffect(() => {
    if (!accessToken || !parentElementId || links.length === 0) {
      console.warn(
        "⛔ Missing required data: accessToken, parentElementId, or links"
      );
      return;
    }

    const fetchAllLinkData = async () => {
      const results = {};

      for (const link of links) {
        const elementId = `${parentElementId}_${link.ID}`;
        const url = `https://50sv0u37xc.execute-api.ap-south-1.amazonaws.com/prod/get-link-data/${elementId}`;

        const body = {
          pageParams: { Parameter: pageParams || [] },
          elemID: link.ID,
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

          results[link.ID] = {
            data: result.data,
            title: link.LinkTitle,
          };
        } catch (error) {
          console.error(`❌ Error fetching data for ${link.LinkTitle}:`, error);
          results[link.ID] = {
            error: true,
            title: link.LinkTitle,
          };
        }
      }

      setLinkData(results);
    };

    fetchAllLinkData();
  }, [accessToken, parentElementId, links]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => {
        const data = linkData[link.ID];
        const hasMappedColumns =
          link.ColumnMapping &&
          link.ColumnMapping.MappedColumns &&
          Object.keys(link.ColumnMapping.MappedColumns).length > 0;

        const count =
          hasMappedColumns && data?.data?.rows?.[0]?.columns?.[0]?.Value;

        if (!data) {
          // Loading state (skeleton loader)
          return (
            <div
              key={link.ID}
              className="flex flex-col items-start justify-start rounded-lg shadow-md p-4 transition-all text-[14px] animate-pulse"
              style={{
                border: `1px solid ${theme.secondaryColor}`,
                background: theme.cardColor,
              }}
            >
              <div className="w-full h-4 bg-gray-300 rounded mb-2"></div>
              <div className="w-1/2 h-8 bg-gray-300 rounded"></div>
            </div>
          );
        }

        return (
          <div key={link.ID}>
            {data.error ? (
              <p className="text-red-500">Error loading data</p>
            ) : hasMappedColumns && count !== undefined ? (
              <div className="flex flex-col items-start justify-start rounded-lg shadow-md p-4 transition-all text-[14px]">
                <h1 className="text-lg font-semibold mb-2 !text-[12px] !w-full uppercase">
                  {link.LinkTitle}
                </h1>
                <div className="flex flex-col items-center justify-between">
                  <span className="text-4xl text-[#444444] font-bold">
                    {count}
                  </span>
                  <span className="text-[12px] opacity-75 font-[600]">
                    Count
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col items-start justify-start rounded-lg shadow-md p-4 transition-all text-[14px]"
                style={{
                  border: `1px solid ${theme.secondaryColor}`,
                  background: theme.cardColor,
                }}
              >
                <h1
                  className="text-lg mb-2 !text-[12px] font-[700] !w-full uppercase"
                  style={{
                    color: theme.textColor,
                  }}
                >
                  {link.LinkTitle}
                </h1>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LinkObjectCards;
