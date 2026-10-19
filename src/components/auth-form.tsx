"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AuthForm({ connected }: { connected: boolean }) {
  const [mode, setMode] = useState("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <>
      <div className="tabs">
        <button
          type="button"
          aria-pressed={mode === "signin"}
          onClick={() => {
            setMode("signin");
            setMessage("");
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          aria-pressed={mode === "signup"}
          onClick={() => {
            setMode("signup");
            setMessage("");
          }}
        >
          Create account
        </button>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage("");
          const form = new FormData(e.currentTarget);
          try {
            const response = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: form.get("email"),
                password: form.get("password"),
                mode,
              }),
            });
            const result = await response.json();
            if (result.redirect) {
              router.push(result.redirect);
              router.refresh();
            } else setMessage(result.error || result.message);
          } catch {
            setMessage("Connection failed. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
        />
        <label htmlFor="password">
          Password <small>12 characters minimum</small>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={12}
          maxLength={128}
          required
        />
        <button className="button" disabled={busy || !connected}>
          {busy
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in to your academy →"
              : "Create your student account →"}
        </button>
        <p role="status">{message}</p>
        {mode === "signin" && <p className="fine"><a className="text-link" href="/recover">Forgot your password?</a></p>}
      </form>
    </>
  );
}
