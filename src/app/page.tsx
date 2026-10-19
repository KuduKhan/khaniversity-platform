import Link from "next/link";
import {
  ArrowUpRight,
  Braces,
  Layers3,
  Compass,
  ArrowRight,
  Check,
  BrainCircuit,
  Route,
  Code2,
  FlaskConical,
  ClipboardCheck,
  Award,
} from "lucide-react";
import { PublicHeader, Footer } from "@/components/brand";

const systems = [
  {
    number: "01",
    name: "AI Professor",
    href: "/preview/learn/cs101/computational-thinking",
    action: "Open the lesson and its tutor",
    icon: BrainCircuit,
    status: "Guided preview · server setup needed",
    description:
      "Open the CS101 lesson for worked examples, guided hints, and a lesson-grounded tutor. The tutor also offers authored guidance when live AI is unavailable.",
  },
  {
    number: "02",
    name: "Adaptive Learning Engine",
    href: "/preview/path",
    action: "Build your learning path",
    icon: Route,
    status: "Preview live",
    description:
      "Take a six-question diagnostic and get a focused practice recommendation based on your answers.",
  },
  {
    number: "03",
    name: "KHANIVERSITY CodeLab",
    href: "/preview/codelab",
    action: "Open the Python workspace",
    icon: Code2,
    status: "Preview live",
    description:
      "Write and run Python in your browser, then complete a guided challenge with automated checks.",
  },
  {
    number: "04",
    name: "Virtual Technology Labs",
    href: "/preview/labs",
    action: "Enter the technology labs",
    icon: FlaskConical,
    status: "Interactive preview",
    description:
      "Work through network and cloud decision scenarios, receive feedback, and save your evidence locally.",
  },
  {
    number: "05",
    name: "Intelligent Assessment System",
    href: "/preview/learn/cs101/computational-thinking#check",
    action: "Take the lesson knowledge check",
    icon: ClipboardCheck,
    status: "Expanded preview",
    description:
      "Check your understanding with lesson questions and deterministic practice checks. Results in this preview stay on this device.",
  },
  {
    number: "06",
    name: "Skills Passport & Certifications",
    href: "/preview/passport",
    action: "View your skills passport",
    icon: Award,
    status: "Local evidence live",
    description:
      "Export and print a local record of lesson, code, and lab evidence. It is not a verified credential or accredited degree.",
  },
];

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" /> THE COMPUTER SCIENCE ACADEMY
            </p>
            <h1 id="hero-title">
              <span>Build knowledge.</span>
              <span>Create possibility.</span>
            </h1>
            <p className="hero-intro">
              Your next chapter starts with understanding.
            </p>
            <p className="hero-description">
              Learn the foundations of computer science through clear lessons,
              deliberate practice, and a path built around mastery.
            </p>
            <div className="actions">
              <Link className="button gold" href="/catalog/cs101">
                Explore CS101 <ArrowRight size={18} />
              </Link>
              <Link
                className="text-link hero-workspace-link"
                href="/preview/dashboard"
              >
                Enter the learning workspace <ArrowUpRight size={17} />
              </Link>
            </div>
            <ul className="hero-note" aria-label="Course format">
              <li>
                <Check size={13} aria-hidden /> Beginner friendly
              </li>
              <li>
                <Check size={13} aria-hidden /> Self-paced
              </li>
              <li>
                <Check size={13} aria-hidden /> Free foundation preview
              </li>
            </ul>
          </div>
          <div className="hero-art">
            <span className="art-coord">
              <span /> KH / CS / 001
            </span>
            <div className="orbit orbit-one" aria-hidden="true" />
            <div className="orbit orbit-two" aria-hidden="true" />
            <div className="gateway" aria-hidden="true">
              <div />
              <div />
              <div />
              <div />
            </div>
            <div className="art-caption">
              <span>
                THE FOUNDATION OF
                <br />
                WHAT COMES NEXT.
              </span>
              <span className="art-caption-icon">
                <ArrowUpRight size={24} aria-hidden />
              </span>
            </div>
          </div>
        </section>
        <div className="principles">
          <span>A UNIVERSITY OF POSSIBILITY</span>
          <p>Think clearly.</p>
          <i />
          <p>Build deliberately.</p>
          <i />
          <p>Grow through practice.</p>
        </div>
        <section className="section course-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ONE FOCUSED START. A WIDER HORIZON.</p>
              <h2>Start with the foundations.</h2>
            </div>
            <p>
              A structured introduction to how computers work
              <br />
              and how you can make them work for you.
            </p>
          </div>
          <div className="featured-course">
            <div className="course-visual">
              <Braces size={72} strokeWidth={1} />
              <span>CS / 101</span>
              <p>
                COMPUTER SCIENCE
                <br />
                FOUNDATIONS
              </p>
            </div>
            <div className="course-details">
              <div className="tags">
                <span className="tag">SCHOOL OF COMPUTER SCIENCE</span>
                <span className="tag subtle">FOUNDATION PREVIEW</span>
              </div>
              <h3>
                Introduction to Computer
                <br />
                Science & Python
              </h3>
              <p>
                From computational thinking to your first practical program. A
                ten-module curriculum designed to turn curiosity into
                capability.
              </p>
              <div className="course-meta">
                <span>10 complete modules</span>
                <span>No experience required</span>
                <span>10 lessons available</span>
              </div>
              <Link className="text-link" href="/catalog/cs101">
                Discover the course <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
        <section
          className="systems-section"
          id="systems"
          aria-labelledby="systems-title"
        >
          <div className="systems-intro">
            <div>
              <p className="eyebrow">THE KHANIVERSITY LEARNING MODEL</p>
              <h2 id="systems-title">Six systems. One connected journey.</h2>
            </div>
            <p>
              Choose a system and get straight to work. Your preview progress is
              saved on this device.
            </p>
          </div>
          <div
            className="systems-journey"
            aria-label="A connected learning journey"
          >
            <span>Understand</span>
            <i aria-hidden="true" />
            <span>Personalize</span>
            <i aria-hidden="true" />
            <span>Build</span>
            <i aria-hidden="true" />
            <span>Experiment</span>
            <i aria-hidden="true" />
            <span>Demonstrate</span>
            <i aria-hidden="true" />
            <span>Carry forward</span>
          </div>
          <div className="systems-grid">
            {systems.map(
              ({
                number,
                name,
                icon: Icon,
                status,
                description,
                href,
                action,
              }) => (
                <Link className="system-card" href={href} key={name}>
                  <div className="system-card-top">
                    <span className="system-number">SYSTEM {number}</span>
                    <span
                      className={`system-status ${status.toLowerCase().includes("live") ? "is-live" : ""}`}
                    >
                      <i aria-hidden="true" />
                      {status}
                    </span>
                  </div>
                  <Icon
                    className="system-icon"
                    size={25}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <div className="system-outcome">
                    <Check size={14} aria-hidden="true" />
                    {action} <ArrowUpRight size={14} aria-hidden="true" />
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>
        <section className="section approach">
          <div>
            <p className="eyebrow">LEARNING WITH INTENTION</p>
            <h2>
              Understanding first. <br />
              Everything else follows.
            </h2>
          </div>
          <article>
            <Compass />
            <h3>A clear path</h3>
            <p>
              Know what you’re learning, why it matters, and what comes next.
            </p>
          </article>
          <article>
            <Braces />
            <h3>Ideas into practice</h3>
            <p>Work through examples and check your understanding as you go.</p>
          </article>
          <article>
            <Layers3 />
            <h3>Progress with purpose</h3>
            <p>Return to your lesson and build a record of your learning.</p>
          </article>
        </section>
        <section className="closing">
          <p className="eyebrow">YOUR FIRST STEP IS READY</p>
          <h2>Curiosity is a good place to start.</h2>
          <Link className="button gold" href="/preview/dashboard">
            Step inside the academy <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
