import React, { useState, useEffect } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const ImageComponent = ({
  imagePath,
  accessToken,
  title,
  webUrl,
  altText = "Image",
  className = "w-full h-[25rem] rounded-lg shadow-lg object-cover",
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imagePath) {
      setImageUrl("/placeholder-image.png");
      setLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const url = `https://oiey7mgyme.execute-api.ap-south-1.amazonaws.com/prod/get-image?path=${encodeURIComponent(
          imagePath
        )}&token=${encodeURIComponent(accessToken)}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const imageData = await response.text(); // Base64 text
          setImageUrl(imageData);
        } else {
          setError(true);
          setImageUrl("/placeholder-image.png");
        }
      } catch (err) {
        console.error("Error fetching image:", err);
        setError(true);
        setImageUrl("/placeholder-image.png");
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imagePath, accessToken]);

  const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[25rem] bg-gray-100 rounded-lg">
        <Spin indicator={antIcon} />
      </div>
    );
  }

  const imageElement = (
    <img
      className={className}
      src={imageUrl}
      alt={altText}
      onError={() => {
        setError(true);
        setImageUrl("/placeholder-image.png");
      }}
    />
  );

  return (
    <div className="relative group w-full">
      {webUrl ? (
        <a
          href={webUrl.startsWith("http") ? webUrl : `#${webUrl}`}
          target={webUrl.startsWith("http") ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="block"
        >
          {imageElement}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold">{title}</h3>
            </div>
          )}
        </a>
      ) : (
        <>
          {imageElement}
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold">{title}</h3>
            </div>
          )}
        </>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <span className="text-gray-500">Image not available</span>
        </div>
      )}
    </div>
  );
};

export default ImageComponent;
