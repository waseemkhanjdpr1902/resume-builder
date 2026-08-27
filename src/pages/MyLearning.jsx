import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../provider/AuthProvider";
import { academyCourses } from "../data/academyCourses";
import { loadCourseProgress } from "../services/academyService";
import "../css/academy-learning.css";

export default function MyLearning() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!user) return;
    Promise.all(academyCourses.map(async course => ({ course, progress: await loadCourseProgress(user.id, course.slug) })))
      .then(results => setItems(results.filter(item => item.progress.enrolled || item.progress.completed.length)));
  }, [user?.id]);
  if (loading) return <main className="learning-page"><div className="learning-shell lesson-loading">Loading your learning…</div></main>;
  if (!user) return <Navigate to="/login?redirectTo=/academy/my-learning" replace/>;
  return <main className="learning-page"><section className="my-learning-hero"><div className="learning-shell"><span>YOUR ACADEMY</span><h1>My Learning</h1><p>Continue your courses and keep your preparation moving.</p></div></section>
    <section className="learning-shell learning-dashboard">
      {items.length ? <div className="enrolled-grid">{items.map(({course,progress}) => {
        const percent=Math.round(progress.completed.length/course.lessons.length*100);
        return <article key={course.slug}><div className="enrolled-icon"><FiBookOpen/></div><small>{course.profession}</small><h2>{course.title}</h2><div className="progress-track"><i style={{width:`${percent}%`}}/></div><p><FiCheckCircle/> {percent}% complete · {progress.completed.length}/{course.lessons.length} lessons</p><Link to={`/academy/course/${course.slug}`}>Continue course <FiArrowRight/></Link></article>;
      })}</div> : <div className="empty-state"><FiBookOpen/><h2>Your learning space is ready</h2><p>Enrol in a course to save lesson progress here.</p><Link className="learning-primary" to="/academy">Explore courses</Link></div>}
    </section>
  </main>;
}
