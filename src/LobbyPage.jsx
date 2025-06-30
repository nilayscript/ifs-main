import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { message, Spin } from "antd";
import { LoadingOutlined, HomeOutlined, LineChartOutlined, BankOutlined, AppstoreOutlined, BarChartOutlined, UnorderedListOutlined, LinkOutlined } from "@ant-design/icons";

function LobbyPage() {
  const { accessToken, pageId } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elementData, setElementData] = useState({});
  const [elementLoading, setElementLoading] = useState({});

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

  // Fetch data for elements with DataSourceId
  const fetchElementData = async (dataSourceId, elementId) => {
    if (!dataSourceId || elementData[elementId]) return;
    
    setElementLoading(prev => ({ ...prev, [elementId]: true }));
    
    try {
      // Here you would call your backend API to execute the data source query
      // For now, we'll use the KPI endpoint as an example
      const res = await fetch(
        `/.netlify/functions/get-datasource-data/${dataSourceId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setElementData(prev => ({
            ...prev,
            [elementId]: result.data
          }));
        }
      }
    } catch (err) {
      console.error(`Error fetching data for element ${elementId}:`, err);
    } finally {
      setElementLoading(prev => ({ ...prev, [elementId]: false }));
    }
  };

  useEffect(() => {
    fetchLobbyPage();
  }, [accessToken, pageId]);

  // Fetch KPI data when page data is loaded
  useEffect(() => {
    if (pageData) {
      const structure = getPageStructure(pageData);
      structure.forEach(group => {
        group.counters.forEach(counter => {
          // Extract KPI ID from various possible sources
          let kpiId = null;
          
          // Try to get from the element ID directly (common pattern)
          if (counter.ID) {
            // Extract numeric ID from strings like "kpi_132" or just "132"
            const match = counter.ID.match(/(\d+)$/);
            if (match) {
              kpiId = match[1];
            }
          }
          
          // If not found, try DataSourceId
          if (!kpiId && counter.DataSourceId) {
            const match = counter.DataSourceId.match(/(\d+)/);
            if (match) {
              kpiId = match[1];
            }
          }
          
          // If still not found, try from Name
          if (!kpiId && counter.Name) {
            const match = counter.Name.match(/KPI_(\d+)/i);
            if (match) {
              kpiId = match[1];
            }
          }
          
          if (kpiId) {
            fetchKpiData(kpiId);
          }
        });
      });
    }
  }, [pageData]);

  // Helper: Build full image URL
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    return 'https://ifsgcsc2-d02.demo.ifs.cloud' + imgPath;
  };

  // Helper: Extract value from element data
  const getElementValue = (elementId, mappedColumn) => {
    const data = elementData[elementId];
    if (!data || !data.value) return null;
    
    // Handle COUNT(*) or other mapped columns
    if (mappedColumn && data.value[0]) {
      return data.value[0][mappedColumn] || data.value[0]['COUNT'] || data.value[0]['Measure'] || null;
    }
    
    return null;
  };

  // Helper: Extract all page elements organized by groups
  const getPageStructure = (data) => {
    if (!data?.page?.Layout?.Groups?.Group) return [];
    
    const groups = Array.isArray(data.page.Layout.Groups.Group) 
      ? data.page.Layout.Groups.Group 
      : [data.page.Layout.Groups.Group];
    
    const structure = [];
    
    groups.forEach((group, groupIndex) => {
      const groupData = {
        index: groupIndex,
        isSeparator: group.IsSeparator || false,
        separatorTitle: group.SeparatorTitle || '',
        separatorId: group.SeparatorId || '',
        images: [],
        texts: [],
        counters: [],
        linksList: [],
        barCharts: [],
        lists: []
      };
      
      // Extract images
      if (group.Elements?.Image) {
        const images = Array.isArray(group.Elements.Image) 
          ? group.Elements.Image 
          : [group.Elements.Image];
        groupData.images = images;
      }
      
      // Extract text elements
      if (group.Elements?.Text) {
        const texts = Array.isArray(group.Elements.Text) 
          ? group.Elements.Text 
          : [group.Elements.Text];
        groupData.texts = texts;
      }
      
      // Extract counters (KPIs)
      if (group.Elements?.Counter) {
        const counters = Array.isArray(group.Elements.Counter) 
          ? group.Elements.Counter 
          : [group.Elements.Counter];
        groupData.counters = counters;
      }
      
      // Extract links lists
      if (group.Elements?.LinksList) {
        const linksLists = Array.isArray(group.Elements.LinksList) 
          ? group.Elements.LinksList 
          : [group.Elements.LinksList];
        groupData.linksList = linksLists;
      }
      
      // Extract bar charts
      if (group.Elements?.BarChart) {
        const barCharts = Array.isArray(group.Elements.BarChart) 
          ? group.Elements.BarChart 
          : [group.Elements.BarChart];
        groupData.barCharts = barCharts;
      }
      
      // Extract lists
      if (group.Elements?.List) {
        const lists = Array.isArray(group.Elements.List) 
          ? group.Elements.List 
          : [group.Elements.List];
        groupData.lists = lists;
      }
      
      structure.push(groupData);
    });
    
    return structure;
  };

  // KPI color logic
  const getKpiColor = (val, target) => {
    if (val === null || val === undefined || target === null || target === undefined) return 'text-gray-700';
    if (val >= target) return 'text-green-600';
    if (val >= target * 0.9) return 'text-amber-600';
    return 'text-red-600';
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900">
        <Spin indicator={antIcon} tip="Loading lobby page data..." size="large" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="p-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-gray-300 max-w-2xl mx-auto">
            <p className="text-lg mb-3">No data available</p>
            <Link to="/" className="text-purple-400 hover:text-purple-300 inline-flex items-center font-medium">
              <HomeOutlined className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle = pageData?.page?.PageTitle || 'Lobby Page';
  const pageStructure = getPageStructure(pageData);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white py-4 shadow-lg border-b border-gray-700">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="flex items-center text-xs mb-2 text-gray-400">
            <Link to="/" className="text-gray-400 hover:text-white flex items-center">
              <HomeOutlined className="mr-1" />
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>{pageTitle}</span>
          </div>
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-12 py-6">
        {/* Render page structure dynamically */}
        {pageStructure.map((group, idx) => (
          <div key={idx} className="mb-8">
            {/* Render separator if it exists */}
            {group.isSeparator && group.separatorTitle && (
              <div className="bg-transparent border-l-4 border-purple-600 px-6 py-3 mb-6 font-medium text-gray-300 flex items-center">
                <AppstoreOutlined className="mr-3 text-lg" />
                {group.separatorTitle}
              </div>
            )}
            
            {/* Render images */}
            {group.images.length > 0 && (
              <div className={`grid ${group.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-2'} gap-6 mb-6`}>
                {group.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative group">
                    {img.WebUrl ? (
                      <Link 
                        to={`/lobby/${accessToken}/${img.WebUrl.replace(/^\/+/, '').replace(/^lobby\//, '')}`}
                        className="block"
                      >
                        <img
                          className="w-full h-64 md:h-80 rounded-lg shadow-lg object-cover group-hover:shadow-xl transition-shadow"
                          src={getImageUrl(img.Image)}
                          alt={img.Name || `Image ${imgIdx + 1}`}
                        />
                        {img.Title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
                            <h3 className="text-white text-xl font-semibold">{img.Title}</h3>
                          </div>
                        )}
                      </Link>
                    ) : (
                      <img
                        className="w-full h-64 md:h-80 rounded-lg shadow-lg object-cover"
                        src={getImageUrl(img.Image)}
                        alt={img.Name || `Image ${imgIdx + 1}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Render KPI counters */}
            {group.counters.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                {group.counters.map((kpi, kpiIdx) => {
                  // Extract KPI ID
                  let kpiId = null;
                  if (kpi.ID) {
                    const match = kpi.ID.match(/(\d+)$/);
                    if (match) {
                      kpiId = match[1];
                    }
                  }
                  if (!kpiId && kpi.DataSourceId) {
                    const match = kpi.DataSourceId.match(/(\d+)/);
                    if (match) {
                      kpiId = match[1];
                    }
                  }
                  if (!kpiId && kpi.Name) {
                    const match = kpi.Name.match(/KPI_(\d+)/i);
                    if (match) {
                      kpiId = match[1];
                    }
                  }
                  
                  // Get KPI data from API response
                  const apiData = kpiId ? kpiData[kpiId] : null;
                  const isLoadingKpi = kpiId ? kpiLoading[kpiId] : false;
                  
                  // Use API Measure value if available
                  const value = apiData?.Measure || null;
                  
                  // Extract target from Footer
                  const targetMatch = kpi.Footer?.match(/TARGET:\s*([\d.-]+)%?/i);
                  const target = targetMatch ? targetMatch[1] : null;
                  const suffix = kpi.Suffix || (kpi.Footer?.includes('%') ? '%' : '');
                  
                  return (
                    <div 
                      key={kpiIdx} 
                      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer"
                      onClick={() => kpi.WebUrl && window.open(kpi.WebUrl, '_blank')}
                    >
                      <div className="text-xs font-medium text-gray-400 mb-4 uppercase">
                        {kpi.Title || kpi.Name}
                      </div>
                      {isLoadingKpi ? (
                        <div className="flex items-center justify-center h-12">
                          <LoadingOutlined className="text-2xl text-purple-500" />
                        </div>
                      ) : (
                        <>
                          <div className={`text-3xl font-bold mb-3 ${value ? 'text-orange-400' : 'text-gray-300'}`}>
                            {value !== null ? (
                              <>
                                {value}
                                {suffix && <span className="text-2xl ml-1">{suffix}</span>}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {kpi.Footer || (target ? `TARGET: ${target}${suffix}` : '')}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Render Links Lists */}
            {group.linksList.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {group.linksList.map((linksList, listIdx) => (
                  <div key={listIdx} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <LinkOutlined className="mr-2" />
                      {linksList.Title || 'Links'}
                    </h3>
                    {linksList.Links?.Link && (
                      <div className="space-y-2">
                        {(Array.isArray(linksList.Links.Link) ? linksList.Links.Link : [linksList.Links.Link]).map((link, linkIdx) => {
                          let targetUrl = link.WebUrl || '#';
                          if (targetUrl.includes('lobby/') && !targetUrl.startsWith('http')) {
                            const lobbyId = targetUrl.split('lobby/')[1].split('?')[0];
                            targetUrl = `/lobby/${accessToken}/${lobbyId}`;
                          }
                          
                          // Get count value if DataSourceId exists
                          const mappedColumn = link.ColumnMapping?.MappedColumns?.MappedColumn?.[0]?.Column;
                          const count = link.DataSourceId ? getElementValue(link.ID, mappedColumn) : null;
                          const isLoadingLink = link.DataSourceId ? elementLoading[link.ID] : false;
                          
                          return (
                            <Link
                              key={linkIdx}
                              to={targetUrl}
                              className="block px-4 py-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors text-gray-700 hover:text-purple-700 font-medium flex items-center justify-between"
                            >
                              <span>→ {link.LinkTitle}</span>
                              {link.DataSourceId && (
                                <span className="ml-2 text-sm">
                                  {isLoadingLink ? (
                                    <LoadingOutlined className="text-purple-600" />
                                  ) : (
                                    <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                      {count || '0'}
                                    </span>
                                  )}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Render Bar Charts */}
            {group.barCharts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 mb-6">
                {group.barCharts.map((chart, chartIdx) => (
                  <div key={chartIdx} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BarChartOutlined className="mr-2" />
                      {chart.Title || 'Chart'}
                    </h3>
                    <div className="text-gray-500 text-center py-8">
                      Chart visualization would appear here
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Render Lists */}
            {group.lists.length > 0 && (
              <div className="grid grid-cols-1 gap-6 mb-6">
                {group.lists.map((list, listIdx) => (
                  <div key={listIdx} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <UnorderedListOutlined className="mr-2" />
                        {list.Title || 'List'}
                      </h3>
                    </div>
                    <div className="p-4">
                      <div className="text-gray-500 text-center py-4">
                        Data table would appear here
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Render text elements (navigation tiles) */}
            {group.texts.length > 0 && (
              <div className={`grid gap-6 ${
                group.texts.length <= 2 ? 'grid-cols-1 md:grid-cols-2' :
                group.texts.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                group.texts.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}>
                {group.texts.map((text, textIdx) => {
                  let targetPageId = text.WebUrl || '';
                  targetPageId = targetPageId.replace(/^\/+/, '').replace(/^lobby\//, '');
                  
                  if (targetPageId.startsWith('http')) {
                    return (
                      <a
                        key={textIdx}
                        href={targetPageId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-lg text-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                      >
                        <h5 className="text-xl font-semibold uppercase tracking-wide">{text.BodyText}</h5>
                      </a>
                    );
                  }
                  
                  return (
                    <Link
                      key={textIdx}
                      to={`/lobby/${accessToken}/${targetPageId}`}
                      className="block bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white p-12 rounded-lg text-center transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <h5 className="text-xl font-medium tracking-wide">{text.BodyText}</h5>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Show raw data toggle (optional) */}
        <details className="mt-12 mb-6">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
            View Raw JSON Data
          </summary>
          <div className="mt-4 bg-white p-6 rounded-lg shadow-lg">
            <pre className="overflow-auto max-h-96 text-xs text-gray-800">
              {JSON.stringify(pageData, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

export default LobbyPage;