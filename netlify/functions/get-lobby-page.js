exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Enable CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
    // Get the authorization header and pageId from path
    const authHeader =
      event.headers.authorization || event.headers.Authorization;
    const pageId = event.path.split("/").pop();

    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Missing authorization header" }),
      };
    }

    if (!pageId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing page ID" }),
      };
    }

    // Make the request to Digisigns API
    const response = await fetch(
      `https://api.v2.digisigns.in/api/v1/ifs/ifs-lobby-page/${pageId}`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // Return the response
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Get lobby page error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
