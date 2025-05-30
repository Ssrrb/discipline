"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash, ImagePlus } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = (result: any) => {
    const newUrl = result.info.secure_url;
    console.log("ImageUpload: Cloudinary URL received:", newUrl); // <-- ADD THIS
    const updatedUrls = [...value, newUrl];
    console.log("ImageUpload: Calling onChange with:", updatedUrls); // <-- ADD THIS
    onChange(updatedUrls);
  };

  const handleUpload = (
    e: React.MouseEvent<HTMLButtonElement>,
    open: () => void
  ) => {
    e.preventDefault();
    open();
  };

  const handleRemove = (urlToRemove: string) => {
    onRemove(urlToRemove);
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-4">
      {/* Uploaded images gallery */}
      {value.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value
            .filter((url) => typeof url === "string" && url.trim() !== "")
            .map((url) => (
              <div
                key={url}
                className="relative group h-32 w-full rounded-lg overflow-hidden border border-gray-200"
              >
                <Image src={url} alt="Uploaded" fill className="object-cover" />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove(url)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No images uploaded yet.
        </p>
      )}

      {/* Upload button area */}
      <CldUploadWidget onSuccess={onUpload} uploadPreset="image-uploader-ssrb">
        {({ open }) => (
          <Button
            type="button"
            onClick={(e) => handleUpload(e, open)}
            disabled={disabled}
            className="flex items-center gap-2"
            variant="outline"
          >
            <ImagePlus className="h-4 w-4" />
            Upload Image
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
