import Link from "next/link";
import { PublicHeader, Footer } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/database/server";
export const dynamic = "force-dynamic";
export default function SignIn() {
  const connected = configured();
  return (
    <>
      <PublicHeader />
      <main id="main" className="auth-page">
        <div>
          <p className="eyebrow">A SPACE FOR YOUR NEXT CHAPTER</p>
          <h1>
            Welcome to
            <br />
            your academy.
          </h1>
          <p className="lead">
            Build your understanding, one clear idea at a time.
          </p>
          <div className="auth-quote">
            “Learning is a process.
            <br />
            Make room for yours.”
          </div>
        </div>
        <section className="auth-card">
          <h2>Continue your journey</h2>
          <p>Your lessons and progress, in one place.</p>
          {!connected && (
            <div className="notice">
              Student accounts need a Supabase connection. The local preview is
              ready to explore.
            </div>
          )}
          <AuthForm connected={connected} />
          <div className="auth-divider">JUST EXPLORING?</div>
          <Link className="button outline" href="/preview/dashboard">
            Open local preview ↗
          </Link>
          <p className="fine">
            Preview progress is saved on this device. No account or personal
            details required.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
