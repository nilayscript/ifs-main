import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { message, Spin } from "antd";
import { LoadingOutlined, HomeOutlined, LineChartOutlined, BankOutlined } from "@ant-design/icons";

function LobbyPage() {
  const { accessToken, pageId } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLobbyPage = async () => {
    if (!accessToken || !pageId) return;

    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/get-lobby-page/${pageId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();
      if (res.ok && result?.data?.page) {
        setPageData(result.data);
        message.success("Lobby page data fetched");
      } else {
        message.error(result.message || "Failed to fetch lobby page data.");
      }
    } catch (err) {
      console.error("Lobby page fetch error:", err);
      message.error("Network error while fetching lobby page data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbyPage();
  }, [accessToken, pageId]);

  // Helper: Extract all images
  const getAllImages = (data) => {
    if (!data?.page?.Layout?.Groups?.Group) return [];
    const groups = Array.isArray(data.page.Layout.Groups.Group) 
      ? data.page.Layout.Groups.Group 
      : [data.page.Layout.Groups.Group];
    
    let images = [];
    groups.forEach(g => {
      if (g.Elements?.Image) {
        const imgs = Array.isArray(g.Elements.Image) 
          ? g.Elements.Image 
          : [g.Elements.Image];
        images = images.concat(imgs);
      }
    });
    return images;
  };

  // Helper: Build full image URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    return 'https://ifsgcsc2-d02.demo.ifs.cloud' + imgPath;
  };

  // Helper: Extract all KPI counters
  const getKpis = (data) => {
    if (!data?.page?.Layout?.Groups?.Group) return [];
    const groups = Array.isArray(data.page.Layout.Groups.Group) 
      ? data.page.Layout.Groups.Group 
      : [data.page.Layout.Groups.Group];
    
    let kpis = [];
    groups.forEach(g => {
      if (g.Elements?.Counter) {
        const counters = Array.isArray(g.Elements.Counter) 
          ? g.Elements.Counter 
          : [g.Elements.Counter];
        kpis = kpis.concat(counters);
      }
    });
    return kpis;
  };

  // KPI color logic
  const getKpiColor = (val, target) => {
    if (val === null || val === undefined || target === null || target === undefined) return 'text-gray-700';
    if (val >= target) return 'text-green-600';
    if (val >= target * 0.9) return 'text-amber-600';
    return 'text-red-600';
  };

  // Helper: extract business areas
  const getBusinessAreas = (data) => {
    if (!data?.page?.Layout?.Groups?.Group) return [];
    const groups = Array.isArray(data.page.Layout.Groups.Group) 
      ? data.page.Layout.Groups.Group 
      : [data.page.Layout.Groups.Group];
    
    let foundSeparator = false;
    let areas = [];
    
    groups.forEach(g => {
      if (g.IsSeparator && g.SeparatorTitle === "BUSINESS AREAS") {
        foundSeparator = true;
      } else if (foundSeparator && g.Elements?.Text) {
        const texts = Array.isArray(g.Elements.Text) 
          ? g.Elements.Text 
          : [g.Elements.Text];
        areas = areas.concat(texts);
      }
    });
    return areas;
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <Spin indicator={antIcon} tip="Loading lobby page data..." />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 max-w-2xl mx-auto">
            <p className="text-lg mb-3">No data available</p>
            <Link to="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium">
              <HomeOutlined className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle = pageData?.page?.PageTitle || 'Lobby Page';
  const images = getAllImages(pageData);
  const kpis = getKpis(pageData);
  const businessAreas = getBusinessAreas(pageData);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-6">
        <div className="px-8">
          <div className="flex items-center text-sm mb-3 opacity-90">
            <Link to="/" className="text-white hover:text-gray-200 flex items-center">
              <HomeOutlined className="mr-1" />
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>{pageTitle}</span>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-wide">{pageTitle}</h1>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Images Section */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {images.map((img, index) => (
              <img
                key={index}
                className="w-full h-64 md:h-80 rounded-lg shadow-lg object-cover"
                src={getImageUrl(img.Image)}
                alt={img.Name || `Image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* KPI Section */}
        {kpis.length > 0 && (
          <>
            <div className="bg-gray-200 px-6 py-4 mb-6 rounded-lg font-semibold text-gray-800 flex items-center text-lg">
              <LineChartOutlined className="mr-3 text-xl" />
              KEY PERFORMANCE INDICATORS
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {kpis.map((kpi, index) => {
                // Extract KPI ID and value from API data if available
                const kpiId = kpi.ProjectionDataSource?.Filter?.split("'")[1];
                const kpiApiData = pageData.kpiApiData;
                const kpiApiVal = kpiApiData && kpiId && kpiApiData[kpiId] ? kpiApiData[kpiId] : {};
                const value = typeof kpiApiVal.Measure !== "undefined" ? kpiApiVal.Measure : null;
                
                // Extract target from Footer
                const targetMatch = kpi.Footer?.match(/TARGET: (\d+)%?/);
                const target = targetMatch ? Number(targetMatch[1]) : null;
                const suffix = kpi.Suffix || '';
                
                return (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      {kpi.Title || kpi.Name}
                    </div>
                    <div className={`text-4xl font-bold mb-2 ${getKpiColor(value, target)}`}>
                      {value !== null ? value + suffix : '-'}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {kpi.Footer || ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Business Areas Section */}
        {businessAreas.length > 0 && (
          <>
            <div className="bg-gray-200 px-6 py-4 mb-6 rounded-lg font-semibold text-gray-800 flex items-center text-lg">
              <BankOutlined className="mr-3 text-xl" />
              BUSINESS AREAS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {businessAreas.map((area, index) => {
                // Extract page ID from WebUrl
                let targetPageId = area.WebUrl || '';
                
                // Remove any leading slashes or "lobby/" prefix
                targetPageId = targetPageId.replace(/^\/+/, '').replace(/^lobby\//, '');
                
                // If it's an external URL (http/https), use regular anchor
                if (targetPageId.startsWith('http')) {
                  return (
                    <a
                      key={index}
                      href={targetPageId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-lg text-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                      <h5 className="text-xl font-semibold uppercase tracking-wide">{area.BodyText}</h5>
                    </a>
                  );
                }
                
                // For internal navigation, use Link with token/pageId structure
                return (
                  <Link
                    key={index}
                    to={`/lobby/${accessToken}/${targetPageId}`}
                    className="block bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-lg text-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  >
                    <h5 className="text-xl font-semibold uppercase tracking-wide">{area.BodyText}</h5>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Show raw data toggle (optional) */}
        <details className="mt-8 mb-4">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            View Raw JSON Data
          </summary>
          <div className="mt-2 bg-white p-4 rounded shadow text-black">
            <pre className="overflow-auto max-h-96 text-xs text-black">
              {JSON.stringify(pageData, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

export default LobbyPage;