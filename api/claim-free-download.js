import { createClient } from "@supabase/supabase-js";
import { requireUser, secureJsonPost } from "./_security.js";

export default async function handler(request,response){
  if(!secureJsonPost(request,response,8_000))return;
  const user=await requireUser(request,response);if(!user)return;
  const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.VITE_SUPABASE_ANON_KEY;
  const token=(request.headers.authorization||"").replace(/^Bearer\s+/i,"");
  const client=createClient(url,key,{auth:{persistSession:false},global:{headers:{Authorization:`Bearer ${token}`}}});
  const {error}=await client.from("download_usage").insert({owner_id:user.id,download_type:"free_cv"});
  if(!error)return response.status(200).json({granted:true,access:"free"});
  if(error.code==="23505")return response.status(200).json({granted:false,reason:"free_download_used"});
  console.error("Free download claim failed",error.message);
  return response.status(503).json({error:"Free download verification is temporarily unavailable"});
}
