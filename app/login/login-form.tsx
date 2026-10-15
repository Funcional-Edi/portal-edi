"use client";

import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { getPostLoginPath } from "./actions";

interface LoginFormProps {
  ssoConfigured: boolean;
  /** Já vem falso quando há SSO configurado (ver `env.isDevLoginAvailable`). */
  devAuthEnabled: boolean;
  localEmergencyEnabled: boolean;
}

/** Mensagem por código do erro. Qualquer outro código = "Credenciais inválidas" (não revela se a conta existe). */
const SSO_ERROR_MESSAGES: Record<string, string> = {
  sso_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  sso_unavailable: "SSO indisponível no momento. Tente novamente em instantes.",
  local_rate_limit: "Muitas tentativas. Aguarde 15 minutos e tente novamente.",
  local_mfa_required: "Informe o código para continuar.",
};
const INVALID_CREDENTIALS = "Credenciais inválidas.";

const inputClass =
  "w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600";

/**
 * Formulário de login (home `/`). SSO configurado = e-mail + senha; sem SSO
 * (só em desenvolvimento) = login dev só com e-mail.
 */
export function LoginForm({ ssoConfigured, devAuthEnabled, localEmergencyEnabled }: LoginFormProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const method = ssoConfigured ? "sso" : "dev";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [askCode, setAskCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!ssoConfigured && !devAuthEnabled) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
        Nenhum método de login configurado. Defina{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
          FUNCIONAL_SSO_GRAPHQL_URL
        </code>{" "}
        ou{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">DEV_AUTH_ENABLED=true</code>{" "}
        no <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">.env.local</code>.
      </p>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const signInCallback = callbackUrl ?? "/";

    if (method === "dev") {
      const devResult = await signIn("dev", { email, redirect: false, callbackUrl: signInCallback });
      if (devResult?.error) {
        setLoading(false);
        setError("Login dev falhou. Verifique DEV_AUTH_ENABLED=true no .env.local.");
        return;
      }
      window.location.href = await getPostLoginPath(callbackUrl);
      return;
    }

    if (localEmergencyEnabled) {
      const localResult = await signIn("local", {
        email,
        password,
        mfaCode: askCode ? mfaCode : "",
        redirect: false,
        callbackUrl: signInCallback,
      });
      if (localResult?.code === "local_mfa_required") {
        setAskCode(true);
        setLoading(false);
        setError(null);
        return;
      }
      if (!localResult?.error) {
        window.location.href = await getPostLoginPath(callbackUrl);
        return;
      }
      if (askCode || localResult.code === "local_rate_limit") {
        setLoading(false);
        setMfaCode("");
        setError((localResult.code && SSO_ERROR_MESSAGES[localResult.code]) || INVALID_CREDENTIALS);
        return;
      }
    }

    const result = await signIn("sso", {
      email,
      password,
      redirect: false,
      callbackUrl: signInCallback,
    });

    if (result?.error) {
      setLoading(false);
      setPassword("");
      setError((result.code && SSO_ERROR_MESSAGES[result.code]) || INVALID_CREDENTIALS);
      return;
    }

    window.location.href = await getPostLoginPath(callbackUrl);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Entrar"
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="text-sm">
        <label htmlFor="login-email" className="font-medium text-slate-700">
          {method === "sso" ? "Login" : "E-mail"}
        </label>
        <div className="relative mt-1">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="login-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
            className={inputClass}
          />
        </div>
      </div>

      {method === "sso" ? (
        <div className="text-sm">
          <label htmlFor="login-password" className="font-medium text-slate-700">
            Senha
          </label>
          <div className="relative mt-1">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      ) : null}

      {askCode ? (
        <div className="text-sm">
          <label htmlFor="login-mfa-code" className="font-medium text-slate-700">
            Código
          </label>
          <input
            id="login-mfa-code"
            required
            autoComplete="one-time-code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
            className={`${inputClass} pl-3`}
          />
        </div>
      ) : null}

      {/* Sempre no DOM: leitor de tela só anuncia mudança em região viva que já existe. */}
      <p id="login-error" aria-live="assertive" aria-atomic="true" className="text-sm text-red-600">
        {error}
      </p>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {loading ? "Entrando…" : method === "dev" ? "Entrar (dev)" : "Entrar"}
      </button>
    </form>
  );
}
