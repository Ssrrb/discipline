import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useStoreModal } from "@/hooks/use-store-modal";
import SetupPage from "@/app/(root)/(routes)/page";

jest.mock("@/hooks/use-store-modal", () => {
  const mockStore = {
    onOpen: jest.fn(),
    onClose: jest.fn(),
    isOpen: false,
  };
  const useStoreModal = jest.fn((selector) => selector(mockStore));
  return { useStoreModal };
});

const mockUseStoreModal = jest.mocked(useStoreModal);

beforeEach(() => {
  mockUseStoreModal.mockClear();
  mockUseStoreModal.mockImplementation((selector) => {
    const mockStore = {
      onOpen: jest.fn(),
      onClose: jest.fn(),
      isOpen: false,
    };
    return selector(mockStore);
  });
});

describe("SetupPage", () => {
  it("calls onOpen when component mounts and modal is not open", () => {
    render(<SetupPage />);
    expect(mockUseStoreModal.mock.results[0].value).toHaveBeenCalledTimes(1);
  });

  it("does not call onOpen when modal is already open", () => {
    mockUseStoreModal.mockImplementation((selector) => {
      const mockStore = {
        onOpen: jest.fn(),
        onClose: jest.fn(),
        isOpen: true,
      };
      return selector(mockStore);
    });
    render(<SetupPage />);
    expect(mockUseStoreModal.mock.results[0].value).not.toHaveBeenCalled();
  });
});
