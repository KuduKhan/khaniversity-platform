"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUpRight, GraduationCap, LayoutDashboard, Menu, X } from "lucide-react";

export function PublicNavigation() {
  const pathname = usePathname();
  const [openedFrom, setOpenedFrom] = useState<string | null>(null);
  const open = openedFrom === pathname;
  const toggle = useRef<HTMLButtonElement>(null);
  function close() { setOpenedFrom(null); }

  return (
    <div className="public-navigation">
      <button
        ref={toggle}
        type="button"
        className="public-menu-toggle"
        aria-expanded={open}
        aria-controls="public-navigation-links"
        aria-label={open ? "Close site menu" : "Open site menu"}
        onClick={() => setOpenedFrom(open ? null : pathname)}
      >
        {open ? <X size={21} aria-hidden /> : <Menu size={21} aria-hidden />}
        <span>Menu</span>
      </button>
      <nav
        id="public-navigation-links"
        className={open ? "site-menu-open" : ""}
        aria-label="Main navigation"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            close();
            toggle.current?.focus();
          }
        }}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) close();
        }}
      >
        <Link
          className="header-platforms"
          href="/platforms"
          aria-current={pathname === "/platforms" ? "page" : undefined}
        >Platforms</Link>
        <Link
          className="header-catalog"
          href="/catalog"
          aria-label="Explore the academy"
          title="Explore the academy"
          aria-current={pathname.startsWith("/catalog") || pathname.startsWith("/schools") ? "page" : undefined}
        >
          <GraduationCap size={17} aria-hidden />
          <span>Explore the academy</span>
        </Link>
        <Link
          className="header-admissions"
          href="/admissions"
          aria-current={pathname === "/admissions" ? "page" : undefined}
        >Getting started</Link>
        <Link
          className="header-signin"
          href="/signin"
          aria-current={pathname === "/signin" ? "page" : undefined}
        >Sign in <ArrowUpRight size={15} aria-hidden /></Link>
        <Link
          className="button header-workspace"
          href="/preview/dashboard"
          aria-label="Learning workspace"
          title="Learning workspace"
          aria-current={pathname.startsWith("/preview") ? "page" : undefined}
        >
          <LayoutDashboard size={17} aria-hidden />
          <span>Learning workspace</span>
        </Link>
      </nav>
    </div>
  );
}
