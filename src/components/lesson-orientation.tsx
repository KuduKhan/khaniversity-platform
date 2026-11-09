import { getModuleGuide } from "@/modules/academics/course-guide";

/** Shared pedagogical orientation across the first and follow-on CS101 lessons. */
export function LessonOrientation({ moduleId }: { moduleId: string }) {
  const guide = getModuleGuide(moduleId);
  if (!guide) return null;

  return (
    <section className="lesson-orientation" aria-label="Lesson orientation">
      <div>
        <strong>{guide.stage.title}</strong>
        <span>
          Approx. {guide.studyMinutes} minutes ·{" "}
          {guide.prerequisite ? `Builds on ${guide.prerequisite.title}` : "No programming prerequisites"}
        </span>
      </div>
      <div>
        <strong>Practice focus</strong>
        <span>{guide.practiceFocus}</span>
      </div>
      <div>
        <strong>Capstone connection</strong>
        <span>{guide.capstoneConnection}</span>
      </div>
      <nav aria-label="Module activities">
        <a href={`#practice-studio-${moduleId}`}>Guided practice</a>
        <a href="#check">Knowledge check</a>
      </nav>
    </section>
  );
}
