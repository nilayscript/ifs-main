export const getNonKPIData = async (
  elementId,
  accessToken,
  pageParams,
  pageId
) => {
  const url = `/.netlify/functions/get-non-kpi-data/${elementId}`;

  let updatedPageParams = pageParams;

  if (
    pageId === "3556d3b6-b159-40f3-8c7d-41619a7204f7" ||
    pageId === "c129b02c-9bb2-4801-9274-05424f3259d3"
  ) {
    updatedPageParams = pageParams.map((param) => {
      let value = param.Value || "";
      if (param.Name === "COMPANY")
        value = pageId === "3556d3b6-b159-40f3-8c7d-41619a7204f7" ? "11" : "11";
      if (param.Name === "SITE")
        value =
          pageId === "3556d3b6-b159-40f3-8c7d-41619a7204f7" ? "103" : "101";
      if (param.Name === "days")
        value =
          pageId === "3556d3b6-b159-40f3-8c7d-41619a7204f7" ? "365" : "100";
      return { ...param, Value: value };
    });
  }

  const body = {
    pageParams: { Parameter: updatedPageParams || [] },
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
