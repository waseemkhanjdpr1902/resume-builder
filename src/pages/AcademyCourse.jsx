import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiClock, FiLock, FiPlayCircle } from "react-icons/fi";
import { useAuth } from "../provider/AuthProvider";
import { getAcademyCourse } from "../data/academyCourses";
import { hasAcademyPremiumAccess, loadCourseProgress, saveEnrollment } from "../services/academyService";
import "../css/academy-learning.css";

export default function AcademyCourse() {
  const { courseSlug } = useParams(), course = getAcademyCourse(courseSlug);
  const { user, loading } = useAuth(), navigate = useNavigate();
  const [progress, setProgress] = useState({ enrolled: false, completed: [] });
  const [premium, setPremium] = useState(false);
  useEffect(() => {
    if (!course || loading) return;
    Promise.all([loadCourseProgress(user?.id, course.slug), hasAcademyPremiumAccess(user?.id)])
      .then(([saved, access]) => { setProgress(saved); setPremium(access); });
  }, [courseSlug, user?.id, loading]);
  if (!course) return <main className="learning-page"><div className="learning-shell empty-state"><h1>Course not found</h1><Link to="/academy">Return to Academy</Link></div></main>;
  const percent = Math.round(progress.completed.length / course.lessons.length * 100);
  const enroll = async () => {
    if (!user) return navigate(`/login?redirectTo=/academy/course/${course.slug}`);
    await saveEnrollment(user.id, course.slug); setProgress(value => ({ ...value, enrolled: true }));
  };
  return <main className="learning-page">
    <section className="course-hero"><div className="learning-shell">
      <Link className="back-link" to="/academy"><FiArrowLeft/> Academy</Link>
      <span className="course-eyebrow">{course.profession} · {course.level}</span>
      <h1>{course.title}</h1><p>{course.description}</p>
      <div className="course-meta"><span><FiClock/> {course.duration}</span><span>{course.lessons.length} lessons</span><span>{course.free ? "Free course" : "Includes premium lessons"}</span></div>
      {progress.enrolled ? <div className="progress-card"><div><b>{percent}% complete</b><span>{progress.completed.length} of {course.lessons.length} lessons</span></div><div className="progress-track"><i style={{width:`${percent}%`}}/></div></div> :
        <button className="learning-primary" onClick={enroll}>Enrol and start <FiPlayCircle/></button>}
    </div></section>
    <section className="learning-shell course-layout">
      <div><h2>Course lessons</h2><div className="lesson-list">{course.lessons.map((lesson, index) => {
        const locked = !lesson.free && !premium, done = progress.completed.includes(lesson.slug);
        return <article key={lesson.slug} className={locked ? "locked" : ""}>
          <span className="lesson-status">{done ? <FiCheck/> : locked ? <FiLock/> : index + 1}</span>
          <div><small>{lesson.minutes} min {lesson.free ? "· Free preview" : ""}</small><h3>{lesson.title}</h3></div>
          {locked ? <Link to="/pricing">Unlock</Link> : <Link to={`/academy/course/${course.slug}/lesson/${lesson.slug}`}>{done ? "Review" : "Start"}</Link>}
        </article>;
      })}</div></div>
      <aside className="outcomes-card"><h3>What you will learn</h3>{course.outcomes.map(item=><p key={item}><FiCheck/> {item}</p>)}<small>Educational preparation only. Verify current licensing rules with the relevant official regulator.</small></aside>
    </section>
  </main>;
}
