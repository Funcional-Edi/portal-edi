import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const writeOverride = vi.hoisted(() => ({
  fail: null as null | (() => never),
}));

vi.mock("@/core/db/adapters", async () => {
  const actual = await vi.importActual<typeof import("@/core/db/adapters")>("@/core/db/adapters");
  return {
    ...actual,
    writeContentJson: (...args: Parameters<typeof actual.writeContentJson>) => {
      writeOverride.fail?.();
      return actual.writeContentJson(...args);
    },
  };
});

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
  LocalMfaRequiredError,
} from "@/core/auth/local-account";
import { resetAllMemoryRateLimits } from "@/core/auth/rate-limit";
import { GithubContentError } from "@/core/db/adapters/github-content-error";

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
    writeOverride.fail = null;
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

  it("senha certa sem codigo pede o codigo antes de entrar", async () => {
    await setupEnvAccount();
    await expect(
      authenticateLocalEmergencyUser({
        email: EMAIL,
        password: PASSWORD,
        mfaCode: "",
        ip: "1.1.1.9",
      })
    ).rejects.toBeInstanceOf(LocalMfaRequiredError);
  });

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

  it("entra mesmo quando o GitHub nao grava o acesso", async () => {
    await setupEnvAccount();
    writeOverride.fail = () => {
      throw new GithubContentError("NOT_CONFIGURED", "sem token de escrita");
    };

    await expect(
      authenticateLocalEmergencyUser({
        email: EMAIL,
        password: PASSWORD,
        mfaCode: RECOVERY_CODE,
        ip: "9.9.9.9",
      })
    ).resolves.toMatchObject({ email: EMAIL, authMethod: "local" });
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

  it("pedir o codigo nao consome a trava", async () => {
    await setupEnvAccount();
    for (let i = 0; i < 6; i += 1) {
      await expect(
        authenticateLocalEmergencyUser({
          email: EMAIL,
          password: PASSWORD,
          mfaCode: "",
          ip: "3.3.3.3",
        })
      ).rejects.toBeInstanceOf(LocalMfaRequiredError);
    }
  });

  it("aplica rate limit de 10 senhas erradas em 15 minutos", async () => {
    await setupEnvAccount();
    for (let i = 0; i < 10; i += 1) {
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
