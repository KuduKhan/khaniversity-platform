"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, GraduationCap, LayoutDashboard } from "lucide-react";

export function PublicNavigation() {
  const pathname = usePathname();

  return (
    <div className="public-navigation">
      <nav id="public-navigation-links" aria-label="Main navigation">
        <Link
          className="header-catalog"
          href="/catalog"
          aria-label="Explore the academy"
          title="Explore the academy"
          aria-current={
            pathname.startsWith("/catalog") || pathname.startsWith("/schools")
              ? "page"
              : undefined
          }
        >
          <GraduationCap size={18} aria-hidden />{" "}
          <span>Explore the academy</span>
        </Link>
        <Link
          className="button header-workspace"
          href="/preview/dashboard"
          aria-label="Learning workspace"
          title="Learning workspace"
          aria-current={pathname.startsWith("/preview") ? "page" : undefined}
        >
          <LayoutDashboard size={18} aria-hidden />{" "}
          <span>Learning workspace</span>
        </Link>
        <Link
          className="header-signin"
          href="/signin"
          aria-current={pathname === "/signin" ? "page" : undefined}
        >
          Sign in <ArrowUpRight size={16} aria-hidden />
        </Link>
      </nav>
    </div>
  );
}
