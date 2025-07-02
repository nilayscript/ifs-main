// Netlify function to fetch chart data from IFS
exports.handler = async (event) => {
  const auth = event.headers.authorization;
  const elementId = event.path.split("/").pop();
  const body = JSON.parse(event.body);

  if (!auth || !elementId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required parameters: auth, elementId",
      }),
    };
  }

  try {
    const response = await fetch(
      `https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/web/server/lobby/page/element/${elementId}`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ data }),
    };
  } catch (error) {
    console.error("Chart data fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch chart data" }),
    };
  }
};
