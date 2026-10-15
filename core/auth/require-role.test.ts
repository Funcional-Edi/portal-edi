import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/auth", () => ({
  auth: vi.fn(async () => ({
    user: {
      email: "editor@empresa.com",
      role: "editor",
      authMethod: "sso",
    },
  })),
}));

vi.mock("@/core/auth/access-list", () => ({
  loadAccessList: vi.fn(async () => ({
    admins: ["admin@empresa.com"],
    editors: [],
    clients: [],
    defaultRole: "client",
  })),
}));

import { requireContentEditor } from "@/core/auth/require-role";

describe("require-role", () => {
  it("bloqueia usuario removido da lista na proxima ação sensível", async () => {
    const session = await requireContentEditor();
    expect(session).toBeNull();
  });
});
