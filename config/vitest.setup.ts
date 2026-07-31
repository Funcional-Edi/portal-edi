import { vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((loader: (...args: unknown[]) => unknown) => {
    return (...args: unknown[]) => loader(...args);
  }),
  revalidateTag: vi.fn(),
}));
