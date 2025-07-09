import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

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
          // console.log(
          //   `✅ Response for ${link.LinkTitle} (${link.ID}):`,
          //   result
          // );

          // Store the result with link ID as key
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {links.map((link) => {
        // Skip rendering if MappedColumns is empty
        // if (
        //   !link.ColumnMapping ||
        //   !link.ColumnMapping.MappedColumns ||
        //   Object.keys(link.ColumnMapping.MappedColumns).length === 0
        // ) {
        //   return null;
        // }

        const data = linkData[link.ID];
        const hasMappedColumns =
          link.ColumnMapping &&
          link.ColumnMapping.MappedColumns &&
          Object.keys(link.ColumnMapping.MappedColumns).length > 0;

        const count =
          hasMappedColumns && data?.data?.rows?.[0]?.columns?.[0]?.Value;

        return (
          <div
            key={link.ID}
            className="rounded-lg shadow-md p-4 transition-all hover:shadow-lg"
            style={{
              backgroundColor: theme.backgroundColor,
              color: theme.textColor || "#000000",
            }}
          >
            <h3 className="text-lg font-semibold mb-2">{link.LinkTitle}</h3>
            {data?.error ? (
              <p className="text-red-500">Error loading data</p>
            ) : hasMappedColumns && count !== undefined ? (
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-sm opacity-75">Count</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default LinkObjectCards;
