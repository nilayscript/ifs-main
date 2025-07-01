exports.handler = async (event, context) => {
  const kpiId = event.path.split("/").pop();
  const token =
    event.headers.authorization?.replace("Bearer ", "") ||
    event.queryStringParameters?.token;

  try {
    const response = await fetch(
      `https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/projection/v1/KPIDetailsHandling.svc/CentralKpiSet?$filter=Id eq '${kpiId}'&$select=Measure`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const kpiData = data.value?.[0] || null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: kpiData,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch KPI data",
        details: error.message,
      }),
    };
  }
};
