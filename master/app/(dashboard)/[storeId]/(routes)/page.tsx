"use client";
import ImageUpload from "@/components/ui/image-upload";
import { useState } from "react";

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageChange = (urls: string[]) => {
    setImageUrls(urls);
  };

  const handleImageRemove = (urls: string[]) => {
    setImageUrls(urls);
  };

  return (
    <div>
      This will be a dashboard!
      <ImageUpload
        value={imageUrls}
        onChange={handleImageChange}
        onRemove={handleImageRemove}
        disabled={loading}
      />
    </div>
  );
};
//TODO: Add a component for the user to add its phone number and an API to send it to the database

export default DashboardPage;
