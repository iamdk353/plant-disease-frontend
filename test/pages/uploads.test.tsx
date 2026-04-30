import { render, screen } from "@testing-library/react";
import UploadsPage from "@/app/uploads/page";

describe("UploadsPage", () => {
  it("renders placeholder page content", () => {
    render(<UploadsPage />);
    expect(screen.getByText("page")).toBeTruthy();
  });
});
