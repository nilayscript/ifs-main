// netlify/functions/lobby-page.js

exports.handler = async (event, context) => {
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

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  try {
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

    const response = await fetch(
      `https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/web/server/lobby/page/${pageId}`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Ifs-Lobby": "true",
        },
      }
    );

    const data = await response.json();

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
