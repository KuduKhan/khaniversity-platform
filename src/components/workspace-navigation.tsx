"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GraduationCap, LayoutDashboard, X } from "lucide-react";
import { Brand } from "./brand";

export function WorkspaceNavigation({
  children,
  preview,
}: {
  children: React.ReactNode;
  preview: boolean;
}) {
  const [open, setOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (!sidebar.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  return (
    <aside
      ref={sidebar}
      className={`sidebar${open ? " navigation-open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <div className="sidebar-header">
        <Brand />
        <div
          className="workspace-header-actions"
          aria-label="Workspace shortcuts"
        >
          <Link
            href="/catalog"
            className="workspace-academy-shortcut"
            aria-label="Explore the academy"
            title="Explore the academy"
          >
            <GraduationCap size={16} aria-hidden />
          </Link>
          <button
            ref={toggle}
            type="button"
            className="workspace-menu-toggle"
            aria-expanded={open}
            aria-controls="workspace-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X size={16} aria-hidden />
            ) : (
              <LayoutDashboard size={16} aria-hidden />
            )}
          </button>
          {preview ? (
            <Link href="/signin" className="workspace-account-shortcut">
              Sign in
            </Link>
          ) : (
            <form action="/auth/signout" method="post">
              <button className="workspace-account-shortcut">Sign out</button>
            </form>
          )}
        </div>
      </div>
      <div
        id="workspace-navigation"
        className="workspace-navigation"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        {children}
      </div>
    </aside>
  );
}
