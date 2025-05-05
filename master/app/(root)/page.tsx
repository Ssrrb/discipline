"use client";

import { Modal } from "@/components/ui/modal";
import React from "react";

export default function Home() {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Modal
        title="Hello"
        description="This is a centered modal"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="text-center">
          <p>This is the modal content</p>
        </div>
      </Modal>
    </div>
  );
}
