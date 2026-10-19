import { PublicHeader, Footer } from "@/components/brand";
import { AccountRecoveryForm } from "@/components/account-recovery-form";
import { configured } from "@/lib/database/server";
export const dynamic = "force-dynamic";
export default function ResetPasswordPage() {
  const connected = configured();
  return <>
    <PublicHeader />
    <main id="main" className="auth-page">
      <div>
        <p className="eyebrow">KHANIVERSITY · ACCOUNT SECURITY</p>
        <h1>Choose a new password.</h1>
        <p className="lead">Use the secure link emailed to your account. After updating, sign in again.</p>
      </div>
      <section className="auth-card">
        <h2>Secure password update</h2>
        {!connected && <p className="notice">Account recovery requires a connected Supabase environment.</p>}
        <AccountRecoveryForm connected={connected} reset={true} />
      </section>
    </main>
    <Footer />
  </>;
}
