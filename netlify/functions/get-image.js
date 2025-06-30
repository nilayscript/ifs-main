// netlify/functions/get-image.js

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
    };
  }

  try {
    // Get image path and token from query parameters
    const { path, token } = event.queryStringParameters || {};
    
    if (!path) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Image path is required' }),
      };
    }

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Access token is required' }),
      };
    }

    // Build full image URL
    const imageUrl = path.startsWith('http') 
      ? path 
      : `https://ifsgcsc2-d02.demo.ifs.cloud${path}`;

    console.log('Fetching image:', imageUrl);

    // Fetch image with authorization
    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Image fetch failed:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `Failed to fetch image: ${response.statusText}` }),
      };
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return image with appropriate headers
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: Buffer.from(imageBuffer).toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error('Image proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};