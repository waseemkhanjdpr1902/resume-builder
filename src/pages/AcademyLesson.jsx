import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLock } from "react-icons/fi";
import { useAuth } from "../provider/AuthProvider";
import { getAcademyCourse, getAcademyLesson } from "../data/academyCourses";
import { hasAcademyPremiumAccess, loadCourseProgress, saveLessonCompletion } from "../services/academyService";
import "../css/academy-learning.css";

export default function AcademyLesson() {
  const { courseSlug, lessonSlug } = useParams(), course = getAcademyCourse(courseSlug), lesson = getAcademyLesson(course, lessonSlug);
  const { user, loading } = useAuth(), navigate = useNavigate();
  const [ready, setReady] = useState(false), [premium, setPremium] = useState(false), [completed, setCompleted] = useState(false);
  useEffect(() => {
    if (!course || !lesson || loading) return;
    Promise.all([hasAcademyPremiumAccess(user?.id), loadCourseProgress(user?.id, course.slug)]).then(([access, progress]) => {
      setPremium(access); setCompleted(progress.completed.includes(lesson.slug)); setReady(true);
    });
  }, [courseSlug, lessonSlug, user?.id, loading]);
  if (!course || !lesson) return <Navigate to="/academy" replace/>;
  if (!ready) return <main className="learning-page"><div className="learning-shell lesson-loading">Loading lesson…</div></main>;
  if (!lesson.free && !premium) return <main className="learning-page"><div className="learning-shell access-card"><FiLock/><h1>Member lesson</h1><p>Upgrade your plan to access this lesson and the complete Academy learning library.</p><Link className="learning-primary" to="/pricing">View plans</Link><Link to={`/academy/course/${course.slug}`}>Back to course</Link></div></main>;
  const index = course.lessons.findIndex(item => item.slug === lesson.slug), next = course.lessons[index + 1];
  const toggle = async () => {
    if (!user) return navigate(`/login?redirectTo=/academy/course/${course.slug}/lesson/${lesson.slug}`);
    await saveLessonCompletion(user.id, course.slug, lesson.slug, !completed); setCompleted(!completed);
  };
  return <main className="learning-page lesson-page"><div className="learning-shell lesson-shell">
    <Link className="back-link" to={`/academy/course/${course.slug}`}><FiArrowLeft/> {course.title}</Link>
    <div className="lesson-heading"><span>Lesson {index + 1} of {course.lessons.length} · {lesson.minutes} minutes</span><h1>{lesson.title}</h1></div>
    <article className="lesson-content">{lesson.content.map(([title, text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      <div className="lesson-note"><strong>Professional reminder</strong><p>This learning content is educational and does not replace clinical judgement, employer policy or current regulator guidance.</p></div>
    </article>
    <footer className="lesson-footer"><button className={completed ? "completion done" : "completion"} onClick={toggle}><FiCheckCircle/> {completed ? "Completed" : "Mark as complete"}</button>
      {next && <Link to={`/academy/course/${course.slug}/lesson/${next.slug}`}>Next lesson <FiArrowRight/></Link>}</footer>
  </div></main>;
}
