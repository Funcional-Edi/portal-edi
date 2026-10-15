"use client";

import { useState } from "react";

type Role = "admin" | "editor";
type FirstAccessMap = Record<string, string>;

export function AccessEditor({
  admins,
  editors,
  firstAccess,
  initialSsoUrl,
}: {
  admins: string[];
  editors: string[];
  firstAccess: FirstAccessMap;
  initialSsoUrl: string;
}) {
  const [adminEmails, setAdminEmails] = useState(admins);
  const [editorEmails, setEditorEmails] = useState(editors);
  const [firstAccessMap, setFirstAccessMap] = useState(firstAccess);
  const [ssoUrl, setSsoUrl] = useState(initialSsoUrl);
  const [savedSsoUrl, setSavedSsoUrl] = useState(initialSsoUrl);
  const [login, setLogin] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [adminPassword, setAdminPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);

  const people = [
    ...adminEmails.map((email) => ({ email, role: "admin" as const })),
    ...editorEmails.map((email) => ({ email, role: "editor" as const })),
  ].sort((a, b) => a.email.localeCompare(b.email));

  function addPerson() {
    const email = login.trim().toLowerCase();
    if (!email || email.startsWith("@") || !email.includes("@")) {
      setMessage("Use o login completo, por exemplo nome@empresa.com.");
      return;
    }
    if (adminEmails.includes(email) || editorEmails.includes(email)) {
      setMessage("Esse login já está neste SSO.");
      return;
    }
    if (role === "admin") setAdminEmails((current) => [...current, email]);
    else setEditorEmails((current) => [...current, email]);
    setLogin("");
    setMessage("");
  }

  function removePerson(email: string) {
    setAdminEmails((current) => current.filter((item) => item !== email));
    setEditorEmails((current) => current.filter((item) => item !== email));
  }

  function changeRole(email: string, nextRole: Role) {
    removePerson(email);
    if (nextRole === "admin") setAdminEmails((current) => [...current.filter((item) => item !== email), email]);
    else setEditorEmails((current) => [...current.filter((item) => item !== email), email]);
  }

  async function savePeople() {
    if (adminEmails.length === 0) {
      setMessage("Inclua pelo menos um admin master deste SSO.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admins: adminEmails, editors: editorEmails }),
      });
      const body = (await response.json()) as {
        error?: string;
        admins?: string[];
        editors?: string[];
        firstAccess?: FirstAccessMap;
      };
      if (!response.ok) {
        setMessage(body.error ?? "Não foi possível salvar.");
        return;
      }
      setAdminEmails(body.admins ?? []);
      setEditorEmails(body.editors ?? []);
      setFirstAccessMap(body.firstAccess ?? {});
      setMessage("Pessoas deste SSO atualizadas.");
    } finally {
      setSaving(false);
    }
  }

  async function switchSso() {
    setSwitching(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssoUrl: ssoUrl.trim(), adminPassword }),
      });
      const body = (await response.json()) as {
        error?: string;
        admins?: string[];
        editors?: string[];
        firstAccess?: FirstAccessMap;
        ssoUrl?: string | null;
      };
      if (!response.ok) {
        setMessage(body.error ?? "Não foi possível trocar o SSO.");
        return;
      }
      setAdminEmails(body.admins ?? []);
      setEditorEmails(body.editors ?? []);
      setFirstAccessMap(body.firstAccess ?? {});
      if (typeof body.ssoUrl === "string") {
        setSsoUrl(body.ssoUrl);
        setSavedSsoUrl(body.ssoUrl);
      }
      setAdminPassword("");
      setMessage("SSO atualizado. A lista abaixo é só deste endereço.");
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">SSO em uso</p>
        <p className="mt-2 break-all text-sm text-slate-900">{savedSsoUrl || "Nenhum SSO configurado"}</p>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Os logins abaixo entram por este SSO. Quem não estiver na lista entra só para ler.
          Se o endereço mudar, a lista deste SSO continua guardada e o novo começa do zero.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Pessoas deste SSO</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Digite o login que a pessoa já usa nesse SSO. O portal não consulta a lista de usuários
          de lá: você informa o login e escolhe o papel.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder="login@empresa.com"
            aria-label="Login do SSO"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            aria-label="Papel"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="editor">Editor EDI</option>
            <option value="admin">Admin master</option>
          </select>
          <button
            type="button"
            onClick={addPerson}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
          >
            Incluir
          </button>
        </div>

        <ul className="mt-6 divide-y divide-slate-100">
          {people.length === 0 ? (
            <li className="py-6 text-sm text-slate-500">Nenhuma pessoa neste SSO.</li>
          ) : null}
          {people.map((person) => (
            <li key={person.email} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{person.email}</p>
                <p className="text-xs text-slate-500">
                  Primeiro acesso:{" "}
                  {firstAccessMap[person.email]
                    ? new Date(firstAccessMap[person.email]).toLocaleString("pt-BR")
                    : "aguardando"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={person.role}
                  aria-label={`Papel de ${person.email}`}
                  onChange={(event) => changeRole(person.email, event.target.value as Role)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="admin">Admin master</option>
                  <option value="editor">Editor EDI</option>
                </select>
                <button
                  type="button"
                  onClick={() => removePerson(person.email)}
                  className="text-sm text-slate-500 underline"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={savePeople}
          disabled={saving}
          className="mt-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar pessoas"}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Trocar o SSO</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Use outro endereço quando o SSO mudar. Confirme com a sua senha. As pessoas do endereço
          anterior não passam automaticamente para o novo.
        </p>
        <input
          type="url"
          value={ssoUrl}
          onChange={(event) => setSsoUrl(event.target.value)}
          aria-label="Endereço do SSO"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="https://sso.exemplo.com.br/graphql/"
        />
        <input
          type="password"
          value={adminPassword}
          onChange={(event) => setAdminPassword(event.target.value)}
          aria-label="Senha para confirmar a troca"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Sua senha"
        />
        <button
          type="button"
          onClick={switchSso}
          disabled={switching}
          className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {switching ? "Trocando…" : "Usar este SSO"}
        </button>
      </section>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
