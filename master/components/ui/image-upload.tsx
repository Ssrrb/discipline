"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus } from "lucide-react";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (value: string[]) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Initialize component and set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle successful image upload from Cloudinary
  const onUpload = (result: any) => {
    console.log("Image upload successful:", result.info);

    // Get the secure URL from Cloudinary response
    const newUrl = result.info.secure_url;

    // Create new array with existing URLs plus new one
    const updatedUrls = [...value, newUrl];

    // Update parent component with new URLs
    onChange(updatedUrls);
  };

  // Handle upload button click
  const handleUpload = (
    e: React.MouseEvent<HTMLButtonElement>,
    open: () => void
  ) => {
    e.preventDefault();
    console.log("Opening Cloudinary upload widget");
    open();
  };

  // Handle image removal
  const handleRemove = (urlToRemove: string) => {
    console.log("Removing image:", urlToRemove);

    // Filter out the URL to remove
    const updatedUrls = value.filter((url) => url !== urlToRemove);

    // Update parent component with new URLs
    onRemove(updatedUrls);
  };

  // Return null while component is mounting
  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url: string) => (
          <div
            key={url}
            className="relative h-24 w-24 overflow-hidden rounded-md"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                disabled={disabled}
                variant="destructive"
                size="icon"
                onClick={() => handleRemove(url)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image src={url} alt="Image" fill className="object-cover" />
          </div>
        ))}
        <CldUploadWidget
          onSuccess={onUpload}
          uploadPreset="image-uploader-ssrb"
        >
          {({ open }) => (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="cursor-pointer"
                disabled={disabled}
                variant="secondary"
                onClick={(e) => handleUpload(e, open)}
              >
                {" "}
                Upload an image{" "}
              </Button>
              <ImagePlus className="h-4 w-4" />
            </div>
          )}
        </CldUploadWidget>
      </div>
    </div>
  );
};

export default ImageUpload;
