exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Forward request directly to IFS with original headers and body
    const response = await fetch(
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...(event.headers.cookie && { Cookie: event.headers.cookie }),
        },
        body: event.body, // Forward raw body unchanged
      }
    );

    // Pass through the response exactly
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: await response.text(), // Forward raw response
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};
