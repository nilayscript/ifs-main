// /.netlify/functions/get-page-filters.js
exports.handler = async (event) => {
  const auth = event.headers.authorization;
  const pageId = event.queryStringParameters.pageId;

  if (!auth || !pageId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing Authorization header or pageId" }),
    };
  }

  const url =
    "https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/projection/v1/UserProfileService.svc/GetProfileSectionValues(ProfileSection='User%2Fifsweb%2FApplications%2FCompositePages%2FPageParameters')";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: auth,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const { value } = await response.json();

    // Find the object matching pageId
    const profile = value.find((item) => item.ProfileEntry === pageId);
    if (!profile) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Profile entry not found for pageId" }),
      };
    }

    // Parse ProfileValue
    const filtersString = profile.ProfileValue.replace(/^"|"$/g, ""); // Remove quotes
    const filters = {};
    filtersString.split(";").forEach((pair) => {
      const [key, val] = pair.split(":");
      if (key && val) {
        filters[key.trim()] = val.trim();
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ filters }),
    };
  } catch (error) {
    console.error("Page filters fetch error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch page filters" }),
    };
  }
};
