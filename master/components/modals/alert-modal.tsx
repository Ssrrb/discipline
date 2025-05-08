"use client";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone. This will permanently delete your account"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          disabled={loading}
          onClick={onConfirm}
          variant="destructive"
          className="cursor-pointer ml-auto"
        >
          Continuar
        </Button>
        <Button
          disabled={loading}
          onClick={onClose}
          variant="outline"
          className="cursor-pointer"
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};
