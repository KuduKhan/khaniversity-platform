import { PublicHeader, Footer } from "@/components/brand";
import { AccountRecoveryForm } from "@/components/account-recovery-form";
import { configured } from "@/lib/database/server";
export const dynamic = "force-dynamic";
export default function RecoverAccountPage() {
  const connected = configured();
  return <>
    <PublicHeader />
    <main id="main" className="auth-page">
      <div>
        <p className="eyebrow">KHANIVERSITY · ACCOUNT SECURITY</p>
        <h1>Recover your learning account.</h1>
        <p className="lead">We will send instructions if the email matches an account. Your course progress will remain unchanged.</p>
      </div>
      <section className="auth-card">
        <h2>Password recovery</h2>
        {!connected && <p className="notice">Account recovery requires a connected Supabase environment.</p>}
        <AccountRecoveryForm connected={connected} reset={false} />
      </section>
    </main>
    <Footer />
  </>;
}
