exports.handler = async (event) => {
  const auth = event.headers.authorization;
  const elementId = event.path.split("/").pop();
  const body = JSON.parse(event.body);

  if (!auth || !elementId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing auth or element ID" }),
    };
  }

  try {
    const res = await fetch(
      `https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/web/server/lobby/page/element/${elementId}?useMaxTime=false`,
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    console.log("Element ID", elementId, "DATA", data);

    return {
      statusCode: 200,
      body: JSON.stringify({ data }),
    };
  } catch (err) {
    console.error("API Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
