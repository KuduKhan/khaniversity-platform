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
  ScrollText,
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
  // A single route registry owns destination labels, icons, and active states.
  const learningLinks = [
    { key: "dashboard", label: "Overview", href: base + "/dashboard", icon: LayoutDashboard },
    { key: "lesson", label: "Learning Studio", href: base + "/learn/cs101/computational-thinking", icon: BookOpen },
    { key: "diagnostic", label: "Adaptive path", href: base + "/path", icon: BrainCircuit },
    { key: "codelab", label: "Python CodeLab", href: base + "/codelab", icon: Code2 },
    { key: "labs", label: "Tech labs", href: base + "/labs", icon: FlaskConical },
  ];
  const recordLinks = [
    ...(!preview ? [{ key: "community", label: "Peer learning", href: "/community", icon: Users }] : []),
    { key: "passport", label: "Skills Passport", href: base + "/passport", icon: Award },
    ...(!preview ? [{ key: "transcript", label: "Academic record", href: "/transcript", icon: ScrollText }] : []),
    { key: "catalog", label: "Academic catalog", href: "/catalog", icon: GraduationCap },
  ];
  const currentTitle =
    [...learningLinks, ...recordLinks].find((link) => link.key === active)?.label ??
    (active === "admin" ? "Academic operations" : active === "credentials" ? "Credentials" : "Overview");

  return (
    <div className="student-shell">
      <WorkspaceNavigation preview={preview}>
        <nav aria-label="Student navigation">
          <span className="workspace-nav-caption" aria-hidden="true">LEARN</span>
          {learningLinks.map(({ key, label, href, icon: Icon }) => (
            <Link key={key} href={href} aria-current={active === key ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" /> {label}
            </Link>
          ))}
          <span className="workspace-nav-caption" aria-hidden="true">ACADEMIC RESOURCES</span>
          {recordLinks.map(({ key, label, href, icon: Icon }) => (
            <Link key={key} href={href} className={key === "catalog" ? "catalog-nav-link" : undefined}
              aria-current={active === key ? "page" : undefined}>
              <Icon size={18} aria-hidden="true" /> {label}
            </Link>
          ))}
          {!preview && staff && (
            <div className="nav-group" role="group" aria-label="Administration">
              <span className="nav-group-label">Administration</span>
              <Link aria-current={active === "admin" ? "page" : undefined} href="/admin">
                <GraduationCap size={18} aria-hidden="true" /> Academic operations
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
            {currentTitle}
          </span>
          <span className="workspace-status">
            <span className="live-dot" />
            {preview ? "LOCAL PREVIEW" : "STUDENT PORTAL"}
          </span>
        </header>
        {preview && (
          <div className="preview-banner">
            Preview mode · Learning activity stays in this browser and is not an official academic record.
          </div>
        )}
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
