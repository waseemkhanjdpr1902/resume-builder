import supabase from "../../supabaseClient";
import { TESTING_ACCESS_ENABLED } from "../config/testingAccess";

const STORAGE_KEY = "resuai_academy_progress_v1";
const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
};
const writeLocal = data => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const keyFor = (userId, courseSlug) => `${userId || "guest"}:${courseSlug}`;

export const getLocalCourseProgress = (userId, courseSlug) => {
  const record = readLocal()[keyFor(userId, courseSlug)] || {};
  return { enrolled: Boolean(record.enrolled), completed: record.completed || [] };
};

export const saveEnrollment = async (userId, courseSlug) => {
  const all = readLocal(), key = keyFor(userId, courseSlug);
  all[key] = { ...(all[key] || {}), enrolled: true, completed: all[key]?.completed || [] };
  writeLocal(all);
  if (!userId) return;
  try { await supabase.from("academy_enrollments").upsert({ user_id: userId, course_slug: courseSlug }, { onConflict: "user_id,course_slug" }); } catch { /* local progress remains available */ }
};

export const saveLessonCompletion = async (userId, courseSlug, lessonSlug, completed = true) => {
  const all = readLocal(), key = keyFor(userId, courseSlug), previous = all[key] || {};
  const completedSet = new Set(previous.completed || []);
  completed ? completedSet.add(lessonSlug) : completedSet.delete(lessonSlug);
  all[key] = { ...previous, enrolled: true, completed: [...completedSet] };
  writeLocal(all);
  if (!userId) return;
  try {
    await supabase.from("academy_lesson_progress").upsert({
      user_id: userId, course_slug: courseSlug, lesson_slug: lessonSlug, completed, completed_at: completed ? new Date().toISOString() : null
    }, { onConflict: "user_id,course_slug,lesson_slug" });
  } catch { /* local progress remains available */ }
};

export const loadCourseProgress = async (userId, courseSlug) => {
  const local = getLocalCourseProgress(userId, courseSlug);
  if (!userId) return local;
  try {
    const [{ data: enrollment }, { data: lessons }] = await Promise.all([
      supabase.from("academy_enrollments").select("course_slug").eq("user_id", userId).eq("course_slug", courseSlug).maybeSingle(),
      supabase.from("academy_lesson_progress").select("lesson_slug,completed").eq("user_id", userId).eq("course_slug", courseSlug).eq("completed", true)
    ]);
    const cloud = { enrolled: Boolean(enrollment), completed: (lessons || []).map(item => item.lesson_slug) };
    if (cloud.enrolled || cloud.completed.length) {
      const all = readLocal(); all[keyFor(userId, courseSlug)] = cloud; writeLocal(all);
      return cloud;
    }
  } catch { /* database migration may not be installed yet */ }
  return local;
};

export const hasAcademyPremiumAccess = async userId => {
  if (TESTING_ACCESS_ENABLED) return true;
  if (!userId) return false;
  try {
    const { data } = await supabase.from("subscription_records")
      .select("status,current_period_end").eq("user_id", userId).in("status", ["active", "paid"]).order("created_at", { ascending: false }).limit(1);
    const subscription = data?.[0];
    return Boolean(subscription && (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date()));
  } catch { return false; }
};
