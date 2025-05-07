import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // For the ".toBeInTheDocument()" matcher
import Home from "@/app/(root)/page";

describe("Home Component", () => {
  it("renders the main heading", () => {
    render(<Home />);

    // Find the heading element by its role and name (accessible name)
    const heading = screen.getByRole("heading", { name: /Home/i });

    // Assert that the heading is present in the document
    expect(heading).toBeInTheDocument();
  });
});
