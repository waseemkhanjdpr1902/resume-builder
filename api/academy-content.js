import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { fullBank, professions } from "./_exam-bank.js";
import { requireUser, secureJsonPost } from "./_security.js";

const slugify=value=>String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const validQuestion=item=>item&&typeof item.question==="string"&&Array.isArray(item.options)&&item.options.length===4&&Number.isInteger(item.answer)&&item.answer>=0&&item.answer<4&&typeof item.explanation==="string";
const parseGhostJson=text=>{
  if(!text)return null;
  const cleaned=text.replace(/^\s*```(?:json)?/i,"").replace(/```\s*$/,"").trim();
  try{return JSON.parse(cleaned);}catch{return null;}
};
async function ghostPost(slug){
  const base=String(process.env.GHOST_CONTENT_API_URL||"").replace(/\/$/,"");
  const key=process.env.GHOST_CONTENT_API_KEY;
  if(!base||!key)return null;
  const url=`${base}/ghost/api/content/posts/slug/${encodeURIComponent(slug)}/?key=${encodeURIComponent(key)}&fields=title,slug,excerpt,plaintext,feature_image&formats=plaintext`;
  const response=await fetch(url,{headers:{Accept:"application/json"}});
  if(!response.ok)return null;
  return (await response.json())?.posts?.[0]||null;
}
async function activeSubscription(userId,token){
  if(String(process.env.VITE_RESUAI_TESTING_ACCESS||"false").toLowerCase()==="true")return true;
  const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(url&&key){
    const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data}=await admin.from("subscription_records").select("expires_at").eq("owner_id",userId).in("status",["active","paid"]).order("created_at",{ascending:false}).limit(1);
    if(data?.[0]&&(!data[0].expires_at||new Date(data[0].expires_at)>new Date()))return true;
  }
  const secret=process.env.RAZORPAY_KEY_SECRET;
  if(!secret||!token)return false;
  try{
    const [payload,signature]=token.split(".");
    const expected=crypto.createHmac("sha256",secret).update(payload).digest("base64url");
    if(!signature||expected.length!==signature.length||!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(signature)))return false;
    const value=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
    return value.userId===userId&&(!value.expiresAt||value.expiresAt>Math.floor(Date.now()/1000));
  }catch{return false;}
}
export default async function handler(request,response){
  if(!secureJsonPost(request,response,12000))return;
  const type=request.body?.type||"questions";
  if(type==="course"||type==="lesson"){
    const slug=slugify(request.body?.slug);
    if(!slug)return response.status(400).json({error:"Course slug is required"});
    try{
      const post=await ghostPost(`academy-${slug}`);
      const course=parseGhostJson(post?.plaintext)?.course;
      if(!course||!Array.isArray(course.lessons))return response.status(200).json({course:null,lesson:null,source:"built-in"});
      if(type==="course"){
        const metadata={...course,lessons:course.lessons.map(({content,...lesson})=>lesson)};
        return response.status(200).json({course:metadata,source:"ghost"});
      }
      const lessonSlug=slugify(request.body?.lessonSlug);
      const lesson=course.lessons.find(item=>item.slug===lessonSlug);
      if(!lesson)return response.status(404).json({error:"Lesson not found"});
      if(!lesson.free){
        if(!request.headers.authorization)return response.status(401).json({error:"Please sign in to continue"});
        const user=await requireUser(request,response);
        if(!user)return;
        if(!(await activeSubscription(user.id,request.body?.accessToken)))return response.status(403).json({error:"An active Academy subscription is required"});
      }
      return response.status(200).json({lesson,source:"ghost"});
    }catch{return response.status(200).json({course:null,lesson:null,source:"built-in"});}
  }
  const profession=professions.includes(request.body?.profession)?request.body.profession:"Nurse";
  const preview=fullBank(profession).slice(0,5);
  if(!request.headers.authorization)return response.status(200).json({questions:preview,access:"preview",total:fullBank(profession).length,source:"built-in"});
  const user=await requireUser(request,response);
  if(!user)return;
  const paid=await activeSubscription(user.id,request.body?.accessToken);
  if(!paid)return response.status(200).json({questions:preview,access:"preview",total:fullBank(profession).length,source:"built-in"});
  let questions=null,source="built-in";
  try{
    const post=await ghostPost(`mcq-${slugify(profession)}`);
    const content=parseGhostJson(post?.plaintext);
    if(Array.isArray(content?.questions)&&content.questions.every(validQuestion)){questions=content.questions;source="ghost";}
  }catch{/* fall back to reviewed built-in bank */}
  questions=questions||fullBank(profession);
  return response.status(200).json({questions,access:"subscriber",total:questions.length,source});
}
