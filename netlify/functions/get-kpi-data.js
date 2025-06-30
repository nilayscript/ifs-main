// Example netlify function for get-kpi-data.js
exports.handler = async (event, context) => {
  const { kpiId } = event.path.split('/').pop();
  const token = event.headers.authorization;
  
  try {
    const response = await fetch(
      `https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/projection/v1/KPIDetailsHandling.svc/CentralKpiSet?$filter=Id eq '${kpiId}'`,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: data.value?.[0] || null
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch KPI data' })
    };
  }
};