"use client"; // Ensures the component runs in the browser (not on the server) in Next.js

// Import dialog-related UI components from the project's component library
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Define the expected props for the Modal component
interface ModalProps {
  title: string; // Title displayed at the top of the modal
  description: string; // Short description displayed under the title
  isOpen: boolean; // Controls whether the modal is visible
  onClose: () => void; // Callback when the modal is closed
  children: React.ReactNode; // Content to render inside the modal
}

// Modal is a reusable component for displaying custom content in a styled dialog
export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children,
}) => {
  // Handle open/close changes from the Dialog component
  const onChange = (open: boolean) => {
    // If the dialog is being closed, invoke the onClose callback
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle> {/* Renders the modal title */}
          <DialogDescription>{description}</DialogDescription>{" "}
          {/* Renders the modal description */}
        </DialogHeader>
        <div>{children}</div>{" "}
        {/* Renders any custom content passed as children */}
      </DialogContent>
    </Dialog>
  );
};
