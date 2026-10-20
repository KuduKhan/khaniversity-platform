"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Compass,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from "lucide-react";

export function PublicNavigation() {
  const pathname = usePathname();
  const [openedFrom, setOpenedFrom] = useState<string | null>(null);
  const open = openedFrom === pathname;
  const toggle = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  function close() {
    setOpenedFrom(null);
  }

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpenedFrom(null);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <div
      className="public-navigation"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          close();
          toggle.current?.focus();
        }
      }}
    >
      <button
        ref={toggle}
        type="button"
        className="public-menu-toggle"
        aria-expanded={open}
        aria-controls="public-navigation-links"
        aria-label={open ? "Close site menu" : "Open site menu"}
        onClick={() => setOpenedFrom(open ? null : pathname)}
      >
        {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        <span>Menu</span>
      </button>
      <nav
        id="public-navigation-links"
        className={open ? "site-menu-open" : ""}
        aria-label="Main navigation"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) close();
        }}
      >
        <Link
          className="header-platforms"
          href="/platforms"
          aria-current={pathname === "/platforms" ? "page" : undefined}
        >
          <Layers3 size={18} aria-hidden />
          <span>Platforms</span>
        </Link>
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
          <GraduationCap size={17} aria-hidden />
          <span>Explore the academy</span>
        </Link>
        <Link
          className="header-admissions"
          href="/admissions"
          aria-current={pathname === "/admissions" ? "page" : undefined}
        >
          <Compass size={18} aria-hidden />
          <span>Getting started</span>
        </Link>
        <Link
          className="header-signin"
          href="/signin"
          aria-current={pathname === "/signin" ? "page" : undefined}
        >
          <LogIn size={18} aria-hidden />
          <span>Sign in</span>
        </Link>
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
