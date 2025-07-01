import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ALL_PARAMETERS = [
  "CONNECTION_TYPE",
  "OBJECT_SITE",
  "OBJECT_ID",
  "OBJECT_TYPE",
  "GROUP_ID",
  "CATEGORY",
  "TYPE",
  "ITEM_CLASS",
  "CRITICALITY",
  "MAINT_ORG",
  "WORK_TYPE_ID",
  "WO_SITE",
  "PRIORITY",
  "CONTRACTOR",
  "SUB_CON_NO",
  "REPORTED_BY",
  "PREPARED_BY",
  "WORK_LEADER",
  "COORDINATOR",
  "PROJECT_ID",
  "PM_GROUP_ID",
  "CUSTOMER_NO",
  "CONTRACT_ID",
  "STATE",
  "WO_TYPE",
  "WO_NO",
  "QUOTE_NO",
  "COMPANY",
  "SITE",
  "STATUS",
  "MANAGER",
  "PROGRAM_ID",
  "CATEGORY1_ID",
  "CATEGORY2_ID",
  "FINANCIALLY_RESPONSIBLE",
  "CUSTOMER",
];

const generatePageParams = () => ({
  Parameter: [
    {
      Name: "COMPANY",
      Description: "Company",
      DefaultValue: "11",
      ShowPageParameter: true,
    },
    {
      Name: "SITE",
      Description: "Site",
      DefaultValue: "101",
      ShowPageParameter: true,
    },
    {
      Name: "PROJECT_ID",
      Description: "Project Id",
      ShowPageParameter: true,
    },
    {
      Name: "STATUS",
      Description: "Status",
      ShowPageParameter: true,
    },
    {
      Name: "MANAGER",
      Description: "Manager",
      ShowPageParameter: true,
    },
    {
      Name: "PROGRAM_ID",
      Description: "Program Id",
      ShowPageParameter: true,
    },
    {
      Name: "CATEGORY1_ID",
      Description: "Category1 Id",
      ShowPageParameter: true,
    },
    {
      Name: "CATEGORY2_ID",
      Description: "Category2 Id",
      ShowPageParameter: true,
    },
    {
      Name: "FINANCIALLY_RESPONSIBLE",
      Description: "Financially Responsible",
      ShowPageParameter: true,
    },
    {
      Name: "CUSTOMER",
      Description: "Customer",
      ShowPageParameter: true,
    },
    {
      Name: "CONNECTION_TYPE",
      Description: "Connection Type",
      ShowPageParameter: true,
    },
    {
      Name: "OBJECT_SITE",
      Description: "Object Site",
      ShowPageParameter: true,
    },
    {
      Name: "OBJECT_ID",
      Description: "Object Id",
      ShowPageParameter: true,
    },
    {
      Name: "OBJECT_TYPE",
      Description: "Object Type",
      ShowPageParameter: true,
    },
    {
      Name: "GROUP_ID",
      Description: "Group Id",
      ShowPageParameter: true,
    },
    {
      Name: "CATEGORY",
      Description: "Category",
      ShowPageParameter: true,
    },
    {
      Name: "TYPE",
      Description: "Type",
      ShowPageParameter: true,
    },
    {
      Name: "ITEM_CLASS",
      Description: "Item Class",
      ShowPageParameter: true,
    },
    {
      Name: "CRITICALITY",
      Description: "Criticality",
      ShowPageParameter: true,
    },
    {
      Name: "MAINT_ORG",
      Description: "Maint Org",
      ShowPageParameter: true,
    },
    {
      Name: "WORK_TYPE_ID",
      Description: "Work Type Id",
      ShowPageParameter: true,
    },
    {
      Name: "WO_SITE",
      Description: "Wo Site",
      DefaultValue: "101",
      ShowPageParameter: true,
    },
    {
      Name: "PRIORITY",
      Description: "Priority",
      ShowPageParameter: true,
    },
    {
      Name: "CONTRACTOR",
      Description: "Contractor",
      ShowPageParameter: true,
    },
    {
      Name: "SUB_CON_NO",
      Description: "Sub Con No",
      ShowPageParameter: true,
    },
    {
      Name: "REPORTED_BY",
      Description: "Reported By",
      ShowPageParameter: true,
    },
    {
      Name: "PREPARED_BY",
      Description: "Prepared By",
      ShowPageParameter: true,
    },
    {
      Name: "WORK_LEADER",
      Description: "Work Leader",
      ShowPageParameter: true,
    },
    {
      Name: "COORDINATOR",
      Description: "Coordinator",
      ShowPageParameter: true,
    },
    {
      Name: "PROJECT_ID",
      Description: "Project Id",
      ShowPageParameter: true,
    },
    {
      Name: "PM_GROUP_ID",
      Description: "Pm Group Id",
      ShowPageParameter: true,
    },
    {
      Name: "CUSTOMER_NO",
      Description: "Customer No",
      ShowPageParameter: true,
    },
    {
      Name: "CONTRACT_ID",
      Description: "Contract Id",
      ShowPageParameter: true,
    },
    {
      Name: "STATE",
      Description: "State",
      ShowPageParameter: true,
    },
    {
      Name: "WO_TYPE",
      Description: "Wo Type",
      ShowPageParameter: true,
    },
    {
      Name: "WO_NO",
      Description: "Wo No",
      ShowPageParameter: true,
    },
    {
      Name: "QUOTE_NO",
      Description: "Quote No",
      ShowPageParameter: true,
    },
  ],
});

const LinkObjectCards = ({ links = [], parentElementId, accessToken }) => {
  const { pageId } = useParams();
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
        // Skip API call if MappedColumns is empty
        // if (
        //   !link.ColumnMapping ||
        //   !link.ColumnMapping.MappedColumns ||
        //   Object.keys(link.ColumnMapping.MappedColumns).length === 0
        // ) {
        //   console.log(
        //     `ℹ️ Skipping API call for ${link.LinkTitle} - MappedColumns is empty`
        //   );
        //   continue;
        // }

        const elementId = `${parentElementId}_${link.ID}`;
        const url = `/.netlify/functions/get-link-data/${elementId}`;

        const body = {
          pageParams: generatePageParams(),
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
          console.log(
            `✅ Response for ${link.LinkTitle} (${link.ID}):`,
            result
          );

          // Store the result with link ID as key
          results[link.ID] = {
            data: result.data,
            // Get colors from the link object
            background: link.Background || "#FFFFFF", // Default to white if not specified
            foreground: link.Foreground || "#000000", // Default to black if not specified
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
        const count = data?.data?.rows?.[0]?.columns?.[0]?.Value || "0";

        return (
          <div
            key={link.ID}
            className="rounded-lg shadow-md p-4 transition-all hover:shadow-lg"
            style={{
              backgroundColor: data?.background || link.Background || "#FFFFFF",
              color: data?.foreground || link.Foreground || "#000000",
            }}
          >
            <h3 className="text-lg font-semibold mb-2">{link.LinkTitle}</h3>
            {data?.error ? (
              <p className="text-red-500">Error loading data</p>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{count}</span>
                <span className="text-sm opacity-75">Count</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LinkObjectCards;
