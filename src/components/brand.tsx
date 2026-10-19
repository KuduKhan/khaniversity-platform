import Link from "next/link";
import { PublicNavigation } from "./public-navigation";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="KHANIVERSITY home">
      <span className="monogram" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" focusable="false">
          <rect x="1" y="1" width="62" height="62" rx="15" fill="#112c35" />
          <path d="m10 15 22-9 22 9-22 9-22-9Z" fill="#ddbe77" />
          <path
            d="M19 21v6c7 5 19 5 26 0v-6l-13 5-13-5Z"
            fill="#ddbe77"
            opacity=".72"
          />
          <path
            d="M54 15v13"
            stroke="#ddbe77"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="54" cy="30" r="2" fill="#ddbe77" />
          <path
            d="M17 34h13v2h-3v8l11-8h-3v-2h13v2h-5L32 45l13 11h4v2H35v-2h3l-11-9v9h3v2H17v-2h4V36h-4v-2Z"
            fill="#faf9f5"
          />
        </svg>
      </span>
      {!compact && (
        <span className="brand-wordmark">
          <span className="brand-name">KHANIVERSITY</span>
          <small>
            <span>LEARN. BUILD.</span>{" "}
            <span>INNOVATE. MASTER.</span>
          </small>
        </span>
      )}
    </Link>
  );
}
export function PublicHeader() {
  return (
    <header className="public-header">
      <Brand />
      <PublicNavigation />
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-intro">
        <Brand />
        <p>
          Independent online learning academy.
          <br />
          Knowledge into practice, one step at a time.
        </p>
      </div>
      <aside className="footer-achievements" aria-label="Learning achievements">
        <span>LEARNING ACHIEVEMENTS</span>
        <p>
          Progress and achievements reflect learning within KHANIVERSITY. No
          accredited degree awards.
        </p>
      </aside>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} KHANIVERSITY</small>
        <span>Virtual University</span>
      </div>
    </footer>
  );
}
