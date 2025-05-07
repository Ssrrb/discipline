import { create } from "zustand"; // Import the Zustand state management library

// Define the interface for the store's shape
interface useStoreModalInterface {
  isOpen: boolean; // Tracks whether the modal is open
  onOpen: () => void; // Function to open the modal
  onClose: () => void; // Function to close the modal
}

// Create a Zustand store to manage modal state globally
export const useStoreModal = create<useStoreModalInterface>((set) => ({
  isOpen: false, // Initial state: modal is closed
  onOpen: () => set({ isOpen: true }), // Opens the modal
  onClose: () => set({ isOpen: false }), // Closes the modal
}));
