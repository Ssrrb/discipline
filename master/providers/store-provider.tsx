"use client";
import { useEffect, useState } from "react";
//Avoid hydration errors in the root layout
import { StoreModal } from "@/components/modals/store-modal";

export const ModalProvider = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <>
      <StoreModal />
    </>
  );
};
