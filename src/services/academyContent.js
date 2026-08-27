import supabase from "../../supabaseClient";
const ACCESS_KEY="resuaibuilder_access";
export async function loadExamBank(profession){
  const {data}=await supabase.auth.getSession();
  const bearer=data?.session?.access_token;
  const response=await fetch("/api/academy-content",{method:"POST",headers:{"Content-Type":"application/json",...(bearer?{Authorization:`Bearer ${bearer}`}:{})},body:JSON.stringify({type:"questions",profession,accessToken:localStorage.getItem(ACCESS_KEY)})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(result.error||"Question bank is temporarily unavailable.");
  return result;
}
export async function loadGhostCourse(slug){
  const response=await fetch("/api/academy-content",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"course",slug})});
  if(!response.ok)return null;
  const course=(await response.json().catch(()=>({}))).course;
  if(!course||typeof course.title!=="string"||!Array.isArray(course.lessons)||!course.lessons.every(lesson=>lesson&&typeof lesson.slug==="string"&&typeof lesson.title==="string"&&Array.isArray(lesson.content)))return null;
  return course;
}
