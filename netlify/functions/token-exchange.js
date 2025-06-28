// netlify/functions/token-exchange.js

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    let requestData;

    // Handle both JSON and form-encoded requests
    const contentType = event.headers['content-type'] || '';

    if (contentType.includes('application/json')) {
      // Parse JSON body
      requestData = JSON.parse(event.body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Parse form-encoded body
      const params = new URLSearchParams(event.body);
      requestData = {};
      for (const [key, value] of params) {
        requestData[key] = value;
      }
    } else {
      // Try to parse as JSON by default
      requestData = JSON.parse(event.body);
    }

    console.log('Received request data:', requestData);

    // Prepare the token request
    const tokenEndpoint =
      'https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/token';

    // Create form data
    const formData = new URLSearchParams();
    Object.keys(requestData).forEach((key) => {
      formData.append(key, requestData[key]);
    });

    // Log the request for debugging
    console.log('Token request body:', formData.toString());

    // Make the request to IFS Cloud
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    console.log('Token response status:', response.status);
    console.log('Token response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { error: responseText };
    }

    // Return the response
    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Token exchange error:', error);
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
