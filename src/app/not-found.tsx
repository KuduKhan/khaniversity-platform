import Link from "next/link";
import { PublicHeader } from "@/components/brand";
export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="section">
        <p className="eyebrow">404 / A DIFFERENT PATH</p>
        <h1>This page isn’t in the curriculum.</h1>
        <p>Find your way back to the academy.</p>
        <Link className="button" href="/">
          Back home →
        </Link>
      </main>
    </>
  );
}
