import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Root } from "../../src/ui/Root.js";
import { idealVueFreelanceLille } from "../scoring/fixtures.js";

describe("Root", () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, "", "/");
    vi.unstubAllGlobals();
  });

  it("loads opportunities from the local API", async () => {
    window.history.pushState({}, "", "/opportunities");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            opportunities: [
              {
                ...idealVueFreelanceLille,
                score: 91,
                opportunityClass: "hot"
              }
            ]
          })
      })
    );

    render(<Root />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: idealVueFreelanceLille.title })).toBeInTheDocument();
    });
  });
});
