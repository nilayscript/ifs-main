import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import {
  LoadingOutlined,
  HomeOutlined,
  LineChartOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import LinkObjectCards from "./components/LinkObjectCards";
import { getNonKPIData } from "./utils/getNonKPIData";
import { CopyOutlined } from "@ant-design/icons";
import BarChartComponent from "./components/BarChartComponent";
import LineChartComponent from "./components/LineChartComponent";
import PieChartComponent from "./components/PieChartComponent";
import GaugeComponent from "./components/GaugeComponent";
import TableComponent from "./components/TableComponent";
import ImageComponent from "./components/ImageComponent";

const defaultThemes = [
  {
    themeName: "Theme 0",
    textColor: "#FFFFFF",
    backgroundColor: "#7B27C2",
    primaryColor: "#7B27C2",
    secondaryColor: "#9F7AEA",
    barChartColor: "#553C9A",
    chartColors: ["#6B46C1", "#9F7AEA", "#D6BCFA", "#B794F4"],
    statusColors: {
      success: "#48BB78",
      warning: "#ECC94B",
      error: "#E53E3E",
    },
    iconColors: { active: "#48BB78", inactive: "#E53E3E" },
  },
];

function LobbyPage({ user }) {
  const params = new URLSearchParams(location.search);
  const initialToken = params.get("accessToken");
  const pageId = params.get("pageId");
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({});
  const [nonKpiData, setNonKpiData] = useState({});
  const [kpiLoading, setKpiLoading] = useState({});
  const [nonKpiLoading, setNonKpiLoading] = useState({});
  const [fetchError, setFetchError] = useState(null);
  const [filters, setFilters] = useState(null);
  const [lobbySettings, setLobbySettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const fetchLobbySettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch(
        `https://api.v2.digisigns.in/api/v1/ifs/get-lobby-settings/${pageId}`
      );
      const result = await res.json();
      if (res.ok && result.data) {
        setLobbySettings(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch settings");
      }
    } catch (err) {
      console.error("Failed to fetch lobby settings:", err);
      setFetchError(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

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
      const res = await fetch(
        `https://kjuc8qy9qk.execute-api.ap-south-1.amazonaws.com/prod/get-lobby-page/${pageId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

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
      const res = await fetch(
        `https://1td8zqu882.execute-api.ap-south-1.amazonaws.com/prod/get-kpi-data/${kpiId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

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

  const fetchFilters = async () => {
    try {
      const res = await fetch(
        `https://x027g5pm15.execute-api.ap-south-1.amazonaws.com/prod/get-page-filters?pageId=${pageId}`,
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
      fetchLobbySettings();
    }
  }, [accessToken, pageId]);

  useEffect(() => {
    if (user?.access_token && user.access_token !== initialToken) {
      navigate(`/lobby?accessToken=${user.access_token}&pageId=${pageId}`, {
        replace: true,
      });
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
              console.log(`Fetching KPI data for ID: ${kpiId}`);
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

  const theme = lobbySettings?.theme || defaultThemes[0];

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex flex-col gap-2 justify-center items-center bg-white w-[100vw]">
        <Spin indicator={antIcon} size="large" />
        <p className="text-[18px] font-[500] text-black">Loading ....</p>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen w-[100vw]">
        <div>
          <div className="bg-red-500 border border-red-200 rounded-lg p-6 text-red-700 w-full mx-auto">
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
      <div
        className="py-8 shadow-lg w-full"
        style={{
          background: theme.textColor,
          color: theme.backgroundColor,
        }}
      >
        <div className="px-4 md:px-8 lg:px-12 w-full">
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
              <div
                className="bg-gray-100 border-l-4 px-6 py-4 mb-6 font-semibold text-gray-800 flex items-center text-lg"
                style={{ borderLeftColor: theme.textColor }}
              >
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
                  <ImageComponent
                    key={imgIdx}
                    imagePath={img.Image}
                    accessToken={accessToken}
                    title={img.Title}
                    webUrl={img.WebUrl}
                    altText={img.Name || `Image ${imgIdx + 1}`}
                  />
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
                            <div
                              className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide"
                              style={{ color: theme.secondaryColor }}
                            >
                              {title}
                            </div>
                            {isLoadingKpi ? (
                              <div className="flex items-center justify-center h-12">
                                <LoadingOutlined
                                  className="text-2xl"
                                  style={{ color: theme.textColor }}
                                />
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
                            className="rounded-[12px] p-5 shadow-xl transition-shadow cursor-pointer w-full"
                          >
                            <div className="text-xs font-bold text-[#3A3A3A] mb-2 uppercase tracking-wide">
                              {kpi.Title}
                            </div>
                            {isLoading ? (
                              <LoadingOutlined
                                className="text-2xl"
                                style={{ color: theme.textColor }}
                              />
                            ) : (
                              <>
                                <div
                                  className="text-4xl font-[700] mb-1 w-full p-2"
                                  style={{ color: theme.textColor }}
                                >
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
                                <div className="text-[9px] font-[600] text-wrap text-[#3A3A3A] uppercase p-2">
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
                            theme={theme}
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
                          theme={theme}
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
                          theme={theme}
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
                          theme={theme}
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
                          theme={theme}
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
                        theme={theme}
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
                        className="block text-white p-8 rounded-lg text-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                        style={{
                          background: theme.textColor,
                          color: theme.backgroundColor,
                        }}
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
                      to={`/lobby?accessToken=${accessToken}&pageId=${targetPageId}`}
                      className="block text-white p-8 rounded-lg text-center transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                      style={{
                        background: theme.textColor,
                        color: theme.backgroundColor,
                      }}
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
        {/* <details className="mt-12 mb-6">
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
        </details> */}
      </div>
    </div>
  );
}

export default LobbyPage;
