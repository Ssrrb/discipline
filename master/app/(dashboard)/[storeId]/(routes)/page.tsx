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
      {/*TODO: Add Visual Graphs for the store, such as products sold, revenue, etc.*/}
      {/*TODO: Add a Sales page for the webapp where users can load their sales in a csv format and upload it to the database*/}
    </div>
  );
};

export default DashboardPage;
