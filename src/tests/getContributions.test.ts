import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock del JSON de properties
vi.mock("@/data/properties.json", () => ({
  GH_STATISTICS_API_ENDPOINT: "https://api.example.com/",
  GH_USERNAME: "pablo",
}));

import { getContributions } from "@/lib/getContributions";

describe("getContributions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("si year es vacío, usa 'last' en la URL", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          contributions: [{ date: "2025-01-01", count: 1 }],
          total: { last: 1 },
        }),
      } as any);

    const result = await getContributions("");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/pablo?y=last"
    );
    expect(result).toEqual({
      days: [{ date: "2025-01-01", count: 1 }],
      total: 1,
    });
  });

  it("devuelve null si la respuesta no es ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as any);

    const result = await getContributions("2024");

    expect(result).toBeNull();
  });

  it("devuelve days y total (y total = 0 si no existe)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        contributions: [],
        total: {}, // Object.values([])[0] => undefined => || 0
      }),
    } as any);

    const result = await getContributions("2023");

    expect(result).toEqual({
      days: [],
      total: 0,
    });
  });
});
