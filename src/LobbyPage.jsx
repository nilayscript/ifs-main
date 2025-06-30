import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

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
        setPageData(result.data.page);
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

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black text-sm font-mono w-[100vw]">
      <h1 className="text-xl font-bold mb-4">Lobby Page Data</h1>
      <div className="flex items-center mb-4">
        <span className="mr-2 font-semibold">Page ID:</span>
        <span className="bg-blue-100 px-2 py-1 rounded">{pageId}</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin indicator={antIcon} tip="Loading lobby page data..." />
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Raw JSON Data:</h2>
          <pre className="overflow-auto max-h-[70vh] p-4 bg-gray-50 rounded">
            {pageData ? JSON.stringify(pageData, null, 2) : "No data available"}
          </pre>
        </div>
      )}
    </div>
  );
}

export default LobbyPage;
