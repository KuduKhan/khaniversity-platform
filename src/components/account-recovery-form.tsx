"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AccountRecoveryForm({ connected, reset = false }: { connected: boolean; reset?: boolean }) {
  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (reset && value !== confirm) { setNotice("The passwords do not match."); return; }
    setBusy(true);
    setNotice("");
    try {
      const result = await fetch(reset ? "/api/account/password" : "/api/account/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { password: value } : { email: value }),
      });
      const body = await result.json();
      if (!result.ok) { setNotice(body.error || "Unable to continue."); return; }
      setNotice(body.message || "Request received.");
      if (body.redirect === "/signin") router.replace("/signin");
    } catch {
      setNotice("Connection failed. Please try again.");
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit}>
    <label htmlFor="recovery-value">{reset ? "New password (12–128 characters)" : "Your account email"}</label>
    <input id="recovery-value" autoComplete={reset ? "new-password" : "email"}
      type={reset ? "password" : "email"} minLength={reset ? 12 : undefined}
      maxLength={reset ? 128 : 254} required value={value}
      onChange={event => setValue(event.target.value)} />
    {reset && <>
      <label htmlFor="recovery-confirm">Confirm new password</label>
      <input id="recovery-confirm" type="password" autoComplete="new-password"
        minLength={12} maxLength={128} required value={confirm}
        onChange={event => setConfirm(event.target.value)} />
    </>}
    <button className="button" disabled={!connected || busy}>
      {busy ? "Please wait…" : reset ? "Update my password →" : "Send recovery instructions →"}
    </button>
    <p role="status">{notice}</p>
    <p className="fine"><Link className="text-link" href="/signin">Return to sign in →</Link></p>
  </form>;
}
