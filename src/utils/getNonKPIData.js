export const getNonKPIData = async (elementId, accessToken, pageParams) => {
  const url = `/.netlify/functions/get-non-kpi-data/${elementId}`;
  const body = {
    pageParams: { Parameter: pageParams || [] },
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
    // console.log(`✅ Response for non-KPI data ${elementId}:`, result);

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
