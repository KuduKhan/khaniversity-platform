import Link from "next/link";
import { WorkspaceNavigation } from "./workspace-navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BrainCircuit,
  Code2,
  FlaskConical,
  Award,
  Users,
  LogOut,
} from "lucide-react";
export function StudentShell({
  children,
  preview,
  active = "dashboard",
  email,
  staff = false,
}: {
  children: React.ReactNode;
  preview: boolean;
  active?: string;
  email?: string;
  staff?: boolean;
}) {
  const base = preview ? "/preview" : "";
  return (
    <div className="student-shell">
      <WorkspaceNavigation preview={preview}>
        <nav aria-label="Student navigation">
          <Link
            aria-current={active === "dashboard" ? "page" : undefined}
            href={`${base}/dashboard`}
          >
            <LayoutDashboard size={18} />
            Overview
          </Link>
          <Link
            aria-current={active === "lesson" ? "page" : undefined}
            href={`${base}/learn/cs101/computational-thinking`}
          >
            <BookOpen size={18} /> Learning Studio
          </Link>
          <Link
            aria-current={active === "diagnostic" ? "page" : undefined}
            href={`${base}/path`}
          >
            <BrainCircuit size={18} /> Adaptive path
          </Link>
          <Link
            aria-current={active === "codelab" ? "page" : undefined}
            href={`${base}/codelab`}
          >
            <Code2 size={18} /> Python CodeLab
          </Link>
          <Link
            aria-current={active === "labs" ? "page" : undefined}
            href={`${base}/labs`}
          >
            <FlaskConical size={18} /> Tech labs
          </Link>
          {!preview && (
            <Link
              aria-current={active === "community" ? "page" : undefined}
              href="/community"
            >
              <Users size={18} /> Peer learning
            </Link>
          )}
          <Link
            aria-current={active === "passport" ? "page" : undefined}
            href={`${base}/passport`}
          >
            <Award size={18} /> Skills Passport
          </Link>
          <Link className="catalog-nav-link" href="/catalog">
            <GraduationCap size={18} /> Academic catalog
          </Link>
          {!preview && staff && (
            <div className="nav-group" role="group" aria-label="Administration">
              <span className="nav-group-label">Administration</span>
              <Link
                aria-current={active === "admin" ? "page" : undefined}
                href="/admin"
              >
                <GraduationCap size={18} /> Academic operations
              </Link>
            </div>
          )}
        </nav>
        <div className="sidebar-bottom">
          {!preview && (
            <div className="identity">
              <span className="avatar">S</span>
              <div>
                <strong>Student account</strong>
                <small>{email}</small>
              </div>
            </div>
          )}
          {preview ? (
            <Link className="exit-link" href="/">
              <LogOut size={16} aria-hidden /> Exit preview
            </Link>
          ) : (
            <form action="/auth/signout" method="post">
              <button className="exit-link">Sign out</button>
            </form>
          )}
        </div>
      </WorkspaceNavigation>
      <div className="workspace">
        <header className="workspace-header">
          <span>
            <Link className="workspace-breadcrumb" href={`${base}/dashboard`}>StudentOS</Link> <span className="slash">/</span>{" "}
            {(
              {
                lesson: "Learning Studio",
                diagnostic: "Adaptive Path",
                codelab: "Python CodeLab",
                labs: "Technology Labs",
                passport: "Skills Passport",
                community: "Peer Learning",
                credentials: "Credentials",
                admin: "Academic Operations",
              } as Record<string, string>
            )[active] || "Overview"}
          </span>
          <span className="workspace-status">
            <span className="live-dot" />
            {preview ? "LOCAL PREVIEW" : "STUDENT PORTAL"}
          </span>
          {!preview && (
            <form
              className="mobile-signout"
              action="/auth/signout"
              method="post"
            >
              <button className="header-signout">Sign out</button>
            </form>
          )}
        </header>
        {preview && (
          <div className="preview-banner">
            Progress stays in this browser
            <Link href="/signin">Student sign in ↗</Link>
          </div>
        )}
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
