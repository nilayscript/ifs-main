export const getNonKPIData = async (
  elementId,
  accessToken,
  pageParams,
  pageId
) => {
  const url = `https://vr8ickyvo2.execute-api.ap-south-1.amazonaws.com/prod/get-non-kpi-data/${elementId}`;

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
      console.log("Filters fetched:", filters);

      updatedPageParams = pageParams.map((param) => ({
        ...param,
        Value: filters[param.Name] ?? param.Value,
      }));
    } else {
      console.warn("⚠️ Failed to fetch filters, proceeding without overrides");
    }
  } catch (err) {
    console.error("❌ Error fetching filters:", err);
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

    if (result.data?.rows?.[0]?.columns?.[0]?.Value) {
      return result.data.rows[0].columns[0].Value;
    }

    console.warn(`No value found in response for element ${elementId}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching non-KPI data for ${elementId}:`, error);
    throw error;
  }
};
