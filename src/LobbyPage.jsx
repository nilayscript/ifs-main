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
    if (val === null || val === undefined || target === null || target === undefined) return '';
    if (val >= target) return 'text-green-600';
    if (val >= target * 0.9) return 'text-yellow-600';
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
      <div className="min-h-screen p-6 bg-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>No data available</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            ← Back to Dashboard
          </Link>
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
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-4 mb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm mb-2">
            <Link to="/" className="text-white hover:text-gray-200 flex items-center">
              <HomeOutlined className="mr-1" />
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>{pageTitle}</span>
          </div>
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Images Section */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {images.map((img, index) => (
              <img
                key={index}
                className="w-full rounded-lg shadow-md object-cover"
                src={getImageUrl(img.Image)}
                alt={img.Name || `Image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* KPI Section */}
        {kpis.length > 0 && (
          <>
            <div className="bg-gray-100 px-4 py-3 mb-4 rounded font-semibold text-gray-700 flex items-center">
              <LineChartOutlined className="mr-2" />
              KEY PERFORMANCE INDICATORS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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
                  <div key={index} className="bg-white rounded-lg p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-600 mb-2">
                      {kpi.Title || kpi.Name}
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${getKpiColor(value, target)}`}>
                      {value !== null ? value + suffix : '-'}
                    </div>
                    <div className="text-xs text-gray-500">
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
            <div className="bg-gray-100 px-4 py-3 mb-4 rounded font-semibold text-gray-700 flex items-center">
              <BankOutlined className="mr-2" />
              BUSINESS AREAS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {businessAreas.map((area, index) => {
                const url = area.WebUrl 
                  ? (area.WebUrl.startsWith('http') ? area.WebUrl : '/' + area.WebUrl)
                  : '#';
                
                return (
                  <a
                    key={index}
                    href={url}
                    className="block bg-purple-700 hover:bg-purple-800 text-white p-6 rounded-lg text-center transition-transform hover:-translate-y-1 shadow-md"
                  >
                    <h5 className="text-lg font-semibold">{area.BodyText}</h5>
                  </a>
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
          <div className="mt-2 bg-white p-4 rounded shadow">
            <pre className="overflow-auto max-h-96 text-xs">
              {JSON.stringify(pageData, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

export default LobbyPage;