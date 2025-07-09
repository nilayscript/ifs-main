exports.handler = async (event, context) => {
  const kpiId = event.path.split("/").pop();
  const token = event.headers.authorization || event.headers.Authorization;

  if (!kpiId || !token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing KPI ID or authorization token" }),
    };
  }

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: "Preflight OK",
    };
  }

  try {
    // Call the IFS API to fetch KPI measure
    const response = await fetch(
      `https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/projection/v1/KPIDetailsHandling.svc/CentralKpiSet?$select=Id,Measure&$filter=Id eq '${kpiId}'&$top=25&$skip=0`,
      {
        headers: {
          Authorization: token,
          Accept: "application/json;odata.metadata=full;IEEE754Compatible=true",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        data: data,
      }),
    };
  } catch (error) {
    console.error("Error fetching KPI measure:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch KPI measure data" }),
    };
  }
};
