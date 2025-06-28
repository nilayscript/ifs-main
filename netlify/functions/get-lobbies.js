// netlify/functions/get-lobbies.js

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    // Get the authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Missing authorization header' }),
      };
    }

    // Make the request to Digisigns API
    const response = await fetch('https://api.v2.digisigns.in/api/v1/ifs/ifs-lobbies', {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Return the response
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Get lobbies error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};
