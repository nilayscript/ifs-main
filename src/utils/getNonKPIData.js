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
      Name: "PERIOD",
      Description: "Period",
      DefaultValue: "MONTH",
      ShowPageParameter: true,
    },
    {
      Name: "DAYS",
      Description: "Days",
      DefaultValue: "365",
      ShowPageParameter: true,
    },
    {
      Name: "SO_TARGET",
      Description: "Shop Order On-Time Target",
      DefaultValue: "90",
      ShowPageParameter: true,
    },
    {
      Name: "OP_TARGET",
      Description: "Operation On-Time Target",
      DefaultValue: "95",
      ShowPageParameter: true,
    },
    {
      Name: "PART_NO",
      Description: "Part No",
      ShowPageParameter: true,
    },
    {
      Name: "PERSON_BUYER",
      Description: "Person Buyer",
      ShowPageParameter: true,
    },
    {
      Name: "PRODUCT_CODE",
      Description: "Product Code",
      ShowPageParameter: true,
    },
    {
      Name: "PRODUCT_FAMILY",
      Description: "Product Family",
      ShowPageParameter: true,
    },
    {
      Name: "WORK_CENTER",
      Description: "Work Center",
      ShowPageParameter: true,
    },
    {
      Name: "DEPARTMENT",
      Description: "Department",
      ShowPageParameter: true,
    },
    {
      Name: "PRODUCTION_LINE",
      Description: "Production Line",
      ShowPageParameter: true,
    },
    {
      Name: "LABOUR_CLASS",
      Description: "Labor Class",
      ShowPageParameter: true,
    },
  ],
});

export const getNonKPIData = async (elementId, accessToken) => {
  const url = `/.netlify/functions/get-non-kpi-data/${elementId}`;
  const body = {
    pageParams: generatePageParams(),
    elemID: elementId,
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Response for non-KPI data ${elementId}:`, result);

    // Extract the value from the nested response structure
    if (result.data?.rows?.[0]?.columns?.[0]?.Value) {
      return result.data.rows[0].columns[0].Value;
    }

    // Default fallback if value not found in expected locations
    console.warn(`No value found in response for element ${elementId}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching non-KPI data for ${elementId}:`, error);
    throw error; // Re-throw the error to be handled by the calling function
  }
};
