import Link from "next/link";
import { Fragment } from "react";
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
  // Group by learner intent. A single destination owns the syllabus and course
  // navigation; direct lesson links stay available from the course journey.
  const navigationGroups = [
    {
      label: "CAMPUS",
      links: [
        { key: "dashboard", label: "Home", href: base + "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "MY LEARNING",
      links: [
        { key: "learning", label: "My Learning", href: base + "/learn/cs101", icon: BookOpen },
        { key: "diagnostic", label: "Adaptive path", href: base + "/path", icon: BrainCircuit },
      ],
    },
    {
      label: "PRACTICE & LABS",
      links: [
        { key: "codelab", label: "Python CodeLab", href: base + "/codelab", icon: Code2 },
        { key: "labs", label: "Tech labs", href: base + "/labs", icon: FlaskConical },
      ],
    },
    {
      label: "MY ACHIEVEMENTS",
      links: [
        { key: "passport", label: "Skills Passport", href: base + "/passport", icon: Award },
        ...(!preview ? [{ key: "transcript", label: "Academic record", href: "/transcript", icon: ScrollText }] : []),
      ],
    },
    {
      label: "CAMPUS RESOURCES",
      links: [
        ...(!preview ? [{ key: "community", label: "Peer learning", href: "/community", icon: Users }] : []),
        { key: "catalog", label: "Academic catalog", href: "/catalog", icon: GraduationCap },
      ],
    },
  ];
  const currentTitle = active === "lesson"
    ? "Learning Studio"
    : active === "syllabus" ? "My Learning"
    : navigationGroups.flatMap((group) => group.links).find((link) => link.key === active)?.label ??
      (active === "admin" ? "Academic operations" : active === "credentials" ? "Credentials" : "Home");

  return (
    <div className="student-shell">
      <WorkspaceNavigation preview={preview}>
        <nav aria-label="Student navigation">
          {navigationGroups.map((group) => group.links.length > 0 && (
            <Fragment key={group.label}>
              <span className="workspace-nav-caption" aria-hidden="true">{group.label}</span>
              {group.links.map(({ key, label, href, icon: Icon }) => (
                <Link
                  key={key}
                  href={href}
                  className={key === "catalog" ? "catalog-nav-link" : undefined}
                  aria-current={(key === "learning" && (active === "syllabus" || active === "lesson")) || active === key ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden="true" /> {label}
                </Link>
              ))}
            </Fragment>
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
