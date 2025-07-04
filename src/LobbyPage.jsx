import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import {
  LoadingOutlined,
  HomeOutlined,
  LineChartOutlined,
  BankOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import ObjectCards from "./components/LinkObjectCards";
import LinkObjectCards from "./components/LinkObjectCards";
import { getNonKPIData } from "./utils/getNonKPIData";
import { CopyOutlined } from "@ant-design/icons";
import BarChartComponent from "./components/BarChartComponent";
import LineChartComponent from "./components/LineChartComponent";
import PieChartComponent from "./components/PieChartComponent";
import GaugeComponent from "./components/GaugeComponent";
import TableComponent from "./components/TableComponent";

function LobbyPage({ user }) {
  const { accessToken: initialToken, pageId } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({});
  const [nonKpiData, setNonKpiData] = useState({});
  const [kpiLoading, setKpiLoading] = useState({});
  const [nonKpiLoading, setNonKpiLoading] = useState({});
  const [fetchError, setFetchError] = useState(null);
  const [filters, setFilters] = useState(null);

  const navigate = useNavigate();

  const accessToken = user?.access_token || initialToken;

  const fetchLobbyPage = async () => {
    if (!accessToken || !pageId) {
      console.error("Missing accessToken or pageId:", {
        accessToken: !!accessToken,
        pageId,
      });
      // message.error("Missing required parameters");
      setFetchError("Missing required parameters");
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);
    try {
      // console.log("Fetching lobby page:", pageId);
      const res = await fetch(`/.netlify/functions/get-lobby-page/${pageId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // console.log("Response status:", res.status);
      const result = await res.json();
      // console.log("Response data:", result);

      if (res.ok && result?.page) {
        if (res.ok && result?.page) {
          const page = result.page;
          const pageParams = page.Parameters?.Parameter || [];
          setPageData({ ...page, pageParams });
        }

        // message.success("Lobby page data fetched");
      } else {
        console.error("Failed to fetch lobby page:", result);
        setFetchError(result.message || "Failed to fetch lobby page data.");
        // message.error(result.message || "Failed to fetch lobby page data.");
      }
    } catch (err) {
      console.error("Lobby page fetch error:", err);
      setFetchError(
        err.message || "Network error while fetching lobby page data."
      );
      // message.error("Network error while fetching lobby page data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchKpiData = async (kpiId) => {
    if (!kpiId || kpiData[kpiId]) return;

    setKpiLoading((prev) => ({ ...prev, [kpiId]: true }));

    try {
      const res = await fetch(`/.netlify/functions/get-kpi-data/${kpiId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const result = await res.json();
        // console.log("KPI Data Response:", result);

        if (result.data) {
          setKpiData((prev) => ({
            ...prev,
            [kpiId]: result.data,
          }));
        } else if (result.error) {
          console.error(`Error in KPI ${kpiId} response:`, result.error);
        }
      } else {
        console.error(`Failed to fetch KPI ${kpiId}:`, res.status);
      }
    } catch (err) {
      console.error(`Error fetching KPI ${kpiId}:`, err);
    } finally {
      setKpiLoading((prev) => ({ ...prev, [kpiId]: false }));
    }
  };

  const fetchNonKpiData = async (elementId, pageParams) => {
    if (!elementId || nonKpiData[elementId]) return;

    setNonKpiLoading((prev) => ({ ...prev, [elementId]: true }));

    try {
      const result = await getNonKPIData(
        elementId,
        accessToken,
        pageParams,
        pageId
      );
      setNonKpiData((prev) => ({
        ...prev,
        [elementId]: result,
      }));
    } catch (err) {
      console.error(`Error fetching non-KPI data for ${elementId}:`, err);
      setNonKpiData((prev) => ({
        ...prev,
        [elementId]: null,
      }));
    } finally {
      setNonKpiLoading((prev) => ({ ...prev, [elementId]: false }));
    }
  };

  const getAuthenticatedImageUrl = (imgPath) => {
    if (!imgPath) return "/placeholder-image.png";
    return `/.netlify/functions/get-image?path=${encodeURIComponent(
      imgPath
    )}&token=${encodeURIComponent(accessToken)}`;
  };

  const fetchFilters = async () => {
    try {
      const res = await fetch(
        `/.netlify/functions/get-page-filters?pageId=${pageId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.ok) {
        const { filters } = await res.json();
        setFilters(filters);
      } else {
        console.warn("⚠️ Failed to fetch filters");
      }
    } catch (err) {
      console.error("❌ Error fetching filters:", err);
    }
  };

  useEffect(() => {
    if (accessToken && pageId) {
      fetchLobbyPage();
      fetchFilters();
    }
  }, [accessToken, pageId]);

  useEffect(() => {
    if (user?.access_token && user.access_token !== initialToken) {
      navigate(`/lobby/${user.access_token}/${pageId}`, { replace: true });
    }
  }, [user?.access_token, initialToken, pageId, navigate]);

  useEffect(() => {
    if (pageData) {
      const structure = getPageStructure(pageData);
      structure.forEach((group) => {
        group.counters.forEach((counter) => {
          // Fetch KPI data if it has ProjectionDataSource
          if (counter.ProjectionDataSource?.Filter) {
            const filter = counter.ProjectionDataSource.Filter;
            const match =
              filter.match(/Id\s+eq\s+'(\d+)'/i) ||
              filter.match(/Id\s*=\s*'(\d+)'/i);

            if (match && match[1]) {
              const kpiId = match[1];
              // console.log(`Fetching KPI data for ID: ${kpiId}`);
              fetchKpiData(kpiId);
            }
          } else if (counter.ID) {
            // Fetch non-KPI data for regular counters
            // console.log(`Fetching non-KPI data for counter: ${counter.ID}`);
            fetchNonKpiData(counter.ID, pageData.pageParams);
          }
        });
      });
    }
  }, [pageData]);

  const getPageStructure = (data) => {
    let pageLayout = data?.page?.Layout || data?.Layout || data?.layout;

    if (!pageLayout?.Groups?.Group) {
      console.warn("No groups found in page layout:", pageLayout);
      return [];
    }

    const groups = Array.isArray(pageLayout.Groups.Group)
      ? pageLayout.Groups.Group
      : [pageLayout.Groups.Group];

    return groups.map((group, groupIndex) => ({
      index: groupIndex,
      isSeparator: group.IsSeparator || false,
      separatorTitle: group.SeparatorTitle || "",
      separatorId: group.SeparatorId || "",
      images: group.Elements?.Image
        ? Array.isArray(group.Elements.Image)
          ? group.Elements.Image
          : [group.Elements.Image]
        : [],
      texts: group.Elements?.Text
        ? Array.isArray(group.Elements.Text)
          ? group.Elements.Text
          : [group.Elements.Text]
        : [],
      counters: group.Elements?.Counter
        ? Array.isArray(group.Elements.Counter)
          ? group.Elements.Counter
          : [group.Elements.Counter]
        : [],
      linksList: group.Elements?.LinksList
        ? Array.isArray(group.Elements.LinksList)
          ? group.Elements.LinksList
          : [group.Elements.LinksList]
        : [],
      barCharts: group.Elements?.BarChart
        ? Array.isArray(group.Elements.BarChart)
          ? group.Elements.BarChart
          : [group.Elements.BarChart]
        : [],
      lineCharts: group.Elements?.LineChart
        ? Array.isArray(group.Elements.LineChart)
          ? group.Elements.LineChart
          : [group.Elements.LineChart]
        : [],
      pieCharts: group.Elements?.PieChart
        ? Array.isArray(group.Elements.PieChart)
          ? group.Elements.PieChart
          : [group.Elements.PieChart]
        : [],
      gaugeCharts: group.Elements?.AnalogGauge
        ? Array.isArray(group.Elements.AnalogGauge)
          ? group.Elements.AnalogGauge
          : [group.Elements.AnalogGauge]
        : [],
      lists: group.Elements?.List
        ? Array.isArray(group.Elements.List)
          ? group.Elements.List
          : [group.Elements.List]
        : [],
    }));
  };

  const getKpiColor = (val, target) => {
    if (
      val === null ||
      val === undefined ||
      target === null ||
      target === undefined
    ) {
      return "text-gray-700";
    }
    if (val >= target) return "text-green-600";
    if (val >= target * 0.9) return "text-amber-600";
    return "text-red-600";
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-2 justify-center items-center bg-white w-[100vw]">
        <Spin indicator={antIcon} size="large" />
        <p className="text-[18px] font-[500] text-black">
          Loading lobby page data...
        </p>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-white w-[100vw]">
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 w-full mx-auto">
            <p className="text-lg mb-3">No data available</p>
            {fetchError && (
              <p className="text-sm mb-3 font-semibold">Error: {fetchError}</p>
            )}
            <p className="text-sm mb-3">Page ID: {pageId}</p>
            <p className="text-sm mb-3">
              Access Token: {accessToken ? "Present" : "Missing"}
            </p>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium"
            >
              <HomeOutlined className="mr-2" />
              Back to Dashboard
            </Link>
            <div className="mt-4">
              <button
                onClick={() => fetchLobbyPage()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle =
    pageData?.page?.PageTitle ||
    pageData?.PageTitle ||
    pageData?.title ||
    "Lobby Page";
  const pageStructure = getPageStructure(pageData);

  return (
    <div className="min-h-screen bg-gray-50 w-[100vw]">
      <ObjectCards />
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white py-6 shadow-lg w-full">
        <div className="px-4 md:px-8 lg:px-12 w-full">
          <div className="flex items-center text-sm mb-3 opacity-90 w-full">
            <Link
              to="/"
              className="text-white hover:text-gray-200 flex items-center"
            >
              <HomeOutlined className="mr-1" />
              Dashboard
            </Link>
            <span className="mx-2">/</span>
            <span>{pageTitle}</span>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-wide">
            {pageTitle}
          </h1>
        </div>
      </div>
      {filters && (
        <div className="text-gray-500 text-sm flex flex-wrap gap-3 p-2 items-center">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="bg-white/10">
              <span className="font-medium">{key}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="px-4 md:px-8 lg:px-12 py-6 w-full">
        {pageStructure.map((group, idx) => (
          <div key={idx} className="mb-8 w-full">
            {group.isSeparator && group.separatorTitle && (
              <div className="bg-gray-100 border-l-4 border-purple-600 px-6 py-4 mb-6 font-semibold text-gray-800 flex items-center text-lg">
                <AppstoreOutlined className="mr-3 text-xl" />
                {group.separatorTitle}
              </div>
            )}
            {group.images.length > 0 && (
              <div
                className={`grid ${
                  group.images.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-1 xl:grid-cols-2"
                } gap-6 mb-6 w-full`}
              >
                {group.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative group w-full">
                    {img.WebUrl ? (
                      <Link
                        to={`/lobby/${accessToken}/${img.WebUrl.replace(
                          /^\/+/,
                          ""
                        ).replace(/^lobby\//, "")}`}
                        className="block"
                      >
                        <img
                          className="w-full h-[25rem] rounded-lg shadow-lg object-cover group-hover:shadow-xl transition-shadow"
                          src={getAuthenticatedImageUrl(img.Image)}
                          alt={img.Name || `Image ${imgIdx + 1}`}
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                        {img.Title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
                            <h3 className="text-white text-xl font-semibold">
                              {img.Title}
                            </h3>
                          </div>
                        )}
                      </Link>
                    ) : (
                      <img
                        className="w-full h-[25rem] rounded-lg shadow-lg object-cover"
                        src={getAuthenticatedImageUrl(img.Image)}
                        alt={img.Name || `Image ${imgIdx + 1}`}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {group.counters.length > 0 && (
              <>
                {/* Render Projection KPIs */}
                <div className="mb-4 w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6 w-full">
                    {group.counters
                      .filter((kpi) => !!kpi.ProjectionDataSource)
                      .map((kpi, kpiIdx) => {
                        const filter = kpi.ProjectionDataSource.Filter;
                        const match =
                          filter.match(/Id\s+eq\s+'(\d+)'/i) ||
                          filter.match(/Id\s*=\s*'(\d+)'/i);
                        const kpiId = match ? match[1] : null;
                        const apiData = kpiId ? kpiData[kpiId] : null;
                        const isLoadingKpi = kpiId ? kpiLoading[kpiId] : false;

                        const measure = apiData?.Measure ?? null;
                        const target =
                          apiData?.Target ??
                          (kpi.Footer?.match(/TARGET: ([\d.]+)/)?.[1]
                            ? parseFloat(
                                kpi.Footer.match(/TARGET: ([\d.]+)/)[1]
                              )
                            : null);
                        const title = apiData?.Title || kpi.Title || kpi.Name;
                        const suffix = kpi.Suffix || "";

                        return (
                          <div
                            key={kpi.ID || kpiIdx}
                            className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              {title}
                            </div>
                            {isLoadingKpi ? (
                              <div className="flex items-center justify-center h-12">
                                <LoadingOutlined className="text-2xl text-purple-600" />
                              </div>
                            ) : (
                              <>
                                <div
                                  className={`text-3xl font-bold mb-1 ${getKpiColor(
                                    measure,
                                    target
                                  )}`}
                                >
                                  {measure !== null
                                    ? `${measure}${suffix}`
                                    : "-"}{" "}
                                </div>
                                <div className="text-xs text-gray-500 uppercase">
                                  {target !== null
                                    ? `TARGET: ${target}${suffix}`
                                    : kpi.Footer || ""}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
                {/* Render Simple Counters (Non-KPI) */}
                <div className="mb-4 w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
                    {group.counters
                      .filter((kpi) => !kpi.ProjectionDataSource)
                      .map((kpi, kpiIdx) => {
                        const isLoading = nonKpiLoading[kpi.ID] || false;
                        const value = nonKpiData[kpi.ID] || null;

                        return (
                          <div
                            key={kpi.ID || kpiIdx}
                            className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                          >
                            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              {kpi.Title}
                            </div>
                            {isLoading ? (
                              <div className="flex items-center justify-center h-12">
                                <LoadingOutlined className="text-2xl text-purple-600" />
                              </div>
                            ) : (
                              <>
                                <div className="text-3xl font-bold mb-1 text-gray-900">
                                  {value !== null
                                    ? `${
                                        kpi.RoundValue
                                          ? Math.round(value)
                                          : value
                                      }${
                                        kpi.Suffix ||
                                        (Number(value) <= 100 &&
                                        Number(value) >= 0
                                          ? "%"
                                          : "")
                                      }`
                                    : "-"}
                                </div>
                                <div className="text-xs text-gray-500 uppercase">
                                  {kpi.Footer || ""}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
            {/* Render Links Lists */}
            {group.linksList.length > 0 && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {group.linksList.map((linksList, listIdx) => {
                  const title = linksList?.Title;
                  const parentElementId = linksList?.ID;
                  return (
                    <div
                      key={listIdx}
                      className="bg-white rounded-lg shadow-md p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <LinkOutlined className="mr-2" />
                        {title || "Liks"}
                      </h3>
                      {linksList.Links?.Link && (
                        <div className="space-y-2">
                          <LinkObjectCards
                            links={
                              Array.isArray(linksList.Links.Link)
                                ? linksList.Links.Link
                                : [linksList.Links.Link]
                            }
                            parentElementId={parentElementId}
                            pageParams={pageData.pageParams}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Render Bar Charts */}
            {group.barCharts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
                {group.barCharts.map((chart, chartIdx) => {
                  return (
                    <div
                      key={`bar-${chartIdx}`}
                      className="bg-white rounded-lg shadow-md p-6 w-full"
                    >
                      <div className="flex items-center mb-4">
                        <BarChartOutlined className="mr-2 text-purple-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {chart.Title || "Bar Chart"}
                        </h3>
                      </div>
                      <div className="text-gray-500 text-center py-8">
                        <BarChartComponent
                          chart={chart}
                          pageParams={pageData.pageParams}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Render Line Charts */}
            {group.lineCharts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
                {group.lineCharts.map((chart, chartIdx) => {
                  const elementId = chart.ID;
                  return (
                    <div
                      key={`line-${chartIdx}`}
                      className="bg-white rounded-lg shadow-md p-6 w-full"
                    >
                      <div className="flex items-center mb-4">
                        <LineChartOutlined className="mr-2 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {chart.Title || "Line Chart"}
                        </h3>
                      </div>
                      <div className="text-gray-500 text-center py-8">
                        <LineChartComponent
                          chart={chart}
                          pageParams={pageData.pageParams}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Render Pie Charts */}
            {group.pieCharts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
                {group.pieCharts.map((chart, chartIdx) => {
                  const elementId = chart.ID;

                  return (
                    <div
                      key={`pie-${chartIdx}`}
                      className="bg-white rounded-lg shadow-md p-6 flex flex-col w-full h-full"
                    >
                      <div className="flex items-center mb-4">
                        <BarChartOutlined className="mr-2 text-pink-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {chart.Title || "Pie Chart"}
                        </h3>
                      </div>
                      <div className="flex-grow w-full h-[300px]">
                        <PieChartComponent
                          elementId={elementId}
                          pageParams={pageData.pageParams}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {group.gaugeCharts.length > 0 && (
              <div className="flex items-center my-2 p-2 gap-4 w-full">
                {group.gaugeCharts.map((chart, chartIdx) => {
                  const elementId = chart.ID;

                  return (
                    <div
                      key={`pie-${chartIdx}`}
                      className="bg-white rounded-lg shadow-md p-6 flex flex-col w-full h-full"
                    >
                      <div className="flex items-center mb-4">
                        <BarChartOutlined className="mr-2 text-pink-600" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {chart.Title || "Pie Chart"}
                        </h3>
                      </div>
                      <div className="flex-grow w-full h-[300px]">
                        <GaugeComponent
                          elementId={elementId}
                          pageParams={pageData.pageParams}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Render Lists */}
            {group.lists.length > 0 && (
              <div className="grid grid-cols-1 gap-6 mb-6">
                {group.lists.map((list, listIdx) => (
                  <div
                    key={listIdx}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-4">
                      <TableComponent
                        list={list}
                        pageParams={pageData.pageParams}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Render text elements (navigation tiles) */}
            {group.texts.length > 0 && (
              <div
                className={`grid gap-6 ${
                  group.texts.length <= 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : group.texts.length === 3
                    ? "grid-cols-1 md:grid-cols-3"
                    : group.texts.length === 4
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {group.texts.map((text, textIdx) => {
                  let targetPageId = text.WebUrl || "";
                  targetPageId = targetPageId
                    .replace(/^\/+/, "")
                    .replace(/^lobby\//, "");

                  if (targetPageId.startsWith("http")) {
                    return (
                      <a
                        key={textIdx}
                        href={targetPageId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-lg text-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                      >
                        <h5 className="text-xl font-semibold uppercase tracking-wide">
                          {text.BodyText}
                        </h5>
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={textIdx}
                      to={`/lobby/${accessToken}/${targetPageId}`}
                      className="block bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-lg text-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                      <h5 className="text-xl font-semibold uppercase tracking-wide">
                        {text.BodyText}
                      </h5>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Show raw data toggle (optional) */}
        <details className="mt-12 mb-6">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium flex items-center justify-between">
            <span>View Raw JSON Data</span>
            <CopyOutlined
              className="ml-2 text-gray-500 hover:text-black cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent toggling the <details>
                navigator.clipboard.writeText(
                  JSON.stringify(pageData, null, 2)
                );
                // message.success("Copied JSON to clipboard");
              }}
            />
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
