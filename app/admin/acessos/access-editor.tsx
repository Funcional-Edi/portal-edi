"use client";

import { useState } from "react";

function EmailList({
  title,
  hint,
  emails,
  onChange,
}: {
  title: string;
  hint: string;
  emails: string[];
  onChange: (emails: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const email = draft.trim().toLowerCase();
    if (!email || emails.includes(email)) return;
    onChange([...emails, email]);
    setDraft("");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{hint}</p>
      <ul className="mt-4 space-y-2">
        {emails.length === 0 ? <li className="text-sm text-slate-500">Nenhum e-mail nesta lista.</li> : null}
        {emails.map((email) => (
          <li key={email} className="flex items-center justify-between gap-3 text-sm">
            <span>{email}</span>
            <button
              type="button"
              className="text-slate-500 underline"
              onClick={() => onChange(emails.filter((item) => item !== email))}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          type="email"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="nome@empresa.com"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="button" onClick={add} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          Incluir
        </button>
      </div>
    </section>
  );
}

type FirstAccessMap = Record<string, string>;

function membersWithRole(admins: string[], editors: string[]) {
  return [
    ...admins.map((email) => ({ email, role: "Admin master" })),
    ...editors.map((email) => ({ email, role: "Editor EDI" })),
  ];
}

function FirstAccessColumn({ email, firstAccess }: { email: string; firstAccess: FirstAccessMap }) {
  const date = firstAccess[email];
  return <span>{date ? new Date(date).toLocaleString("pt-BR") : "aguardando"}</span>;
}

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
  const [adminPassword, setAdminPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admins: adminEmails,
          editors: editorEmails,
          ssoUrl: ssoUrl.trim() !== savedSsoUrl.trim() ? ssoUrl.trim() : null,
          adminPassword,
        }),
      });
      const body = (await response.json()) as {
        error?: string;
        admins?: string[];
        editors?: string[];
        firstAccess?: FirstAccessMap;
        ssoUrl?: string | null;
      };
      if (!response.ok) {
        setMessage(body.error ?? "Não foi possível salvar.");
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
      setMessage("Acessos salvos. Remoção bloqueia na próxima ação do usuário.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <EmailList
        title="Admin master"
        hint="Acesso a tudo. É preciso manter pelo menos um."
        emails={adminEmails}
        onChange={setAdminEmails}
      />
      <EmailList
        title="Editor EDI"
        hint="Edita e envia. Não publica. E-mail exato, nunca o domínio."
        emails={editorEmails}
        onChange={setEditorEmails}
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {saving ? "Salvando…" : "Salvar"}
      </button>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">URL do SSO</h2>
        <p className="mt-1 text-sm text-slate-600">
          URL permitida por <code>SSO_URL_ALLOWED_HOSTS</code>. O portal pede sua senha para confirmar.
        </p>
        <input
          type="url"
          value={ssoUrl}
          onChange={(event) => setSsoUrl(event.target.value)}
          className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="https://sso.exemplo.com.br/graphql/"
        />
        <input
          type="password"
          value={adminPassword}
          onChange={(event) => setAdminPassword(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Confirme sua senha do SSO"
        />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Primeiro acesso</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="py-2">E-mail</th>
              <th className="py-2">Papel</th>
              <th className="py-2">Primeiro acesso</th>
            </tr>
          </thead>
          <tbody>
            {membersWithRole(adminEmails, editorEmails).map((member) => (
              <tr key={member.email} className="border-b border-slate-100">
                <td className="py-2">{member.email}</td>
                <td className="py-2">{member.role}</td>
                <td className="py-2">
                  <FirstAccessColumn email={member.email} firstAccess={firstAccessMap} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
