import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  CredentialsSignin: class extends Error {
    code = "credentials";
  },
}));

import {
  authenticateLocalEmergencyUser,
  hashLocalPassword,
  hashRecoveryCode,
  LocalInvalidCredentialsError,
  LocalLoginRateLimitError,
} from "@/core/auth/local-account";
import { resetAllMemoryRateLimits } from "@/core/auth/rate-limit";

const EMAIL = "emergency@funcional.com.br";
const PASSWORD = "senha-super-forte-12345";
const RECOVERY_CODE = "ABCD-EFGH-IJKL";
describe("conta local de emergencia", () => {
  let contentRoot = "";

  beforeEach(() => {
    contentRoot = mkdtempSync(path.join(tmpdir(), "portal-edi-local-account-"));
    vi.stubEnv("AUTH_SECRET", "auth-secret-test");
    vi.stubEnv("CONTENT_ROOT", contentRoot);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetAllMemoryRateLimits();
    rmSync(contentRoot, { recursive: true, force: true });
  });

  async function setupEnvAccount() {
    const passwordHash = await hashLocalPassword(PASSWORD);
    process.env.LOCAL_EMERGENCY_ACCOUNTS_JSON = JSON.stringify([
      {
        email: EMAIL,
        role: "admin",
        passwordHash,
        totpSecret: "JBSWY3DPEHPK3PXP",
        recoveryCodeHashes: [hashRecoveryCode(RECOVERY_CODE)],
      },
    ]);
  }

  it("recusa senha errada", async () => {
    await setupEnvAccount();
    await expect(
      authenticateLocalEmergencyUser({
        email: EMAIL,
        password: "senha-errada",
        mfaCode: RECOVERY_CODE,
        ip: "1.1.1.1",
      })
    ).rejects.toBeInstanceOf(LocalInvalidCredentialsError);
  });

  it("recusa codigo MFA/recovery invalido", async () => {
    await setupEnvAccount();
    await expect(
      authenticateLocalEmergencyUser({
        email: EMAIL,
        password: PASSWORD,
        mfaCode: "000000",
        ip: "1.1.1.2",
      })
    ).rejects.toBeInstanceOf(LocalInvalidCredentialsError);
  });

  it("codigo de recuperacao nao pode ser reutilizado", async () => {
    await setupEnvAccount();
    await expect(
      authenticateLocalEmergencyUser({
        email: EMAIL,
        password: PASSWORD,
        mfaCode: RECOVERY_CODE,
        ip: "1.1.1.3",
      })
    ).resolves.toMatchObject({ email: EMAIL, role: "admin" });

    await expect(
      authenticateLocalEmergencyUser({
        email: EMAIL,
        password: PASSWORD,
        mfaCode: RECOVERY_CODE,
        ip: "1.1.1.4",
      })
    ).rejects.toBeInstanceOf(LocalInvalidCredentialsError);
  });

  it("aplica rate limit de 5 tentativas em 15 minutos", async () => {
    await setupEnvAccount();
    for (let i = 0; i < 5; i += 1) {
      await expect(
        authenticateLocalEmergencyUser({
          email: EMAIL,
          password: "senha-errada",
          mfaCode: RECOVERY_CODE,
          ip: "2.2.2.2",
        })
      ).rejects.toBeInstanceOf(LocalInvalidCredentialsError);
    }

    await expect(
      authenticateLocalEmergencyUser({
        email: EMAIL,
        password: "senha-errada",
        mfaCode: RECOVERY_CODE,
        ip: "2.2.2.2",
      })
    ).rejects.toBeInstanceOf(LocalLoginRateLimitError);
  });
});
