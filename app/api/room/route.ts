import { env } from 'cloudflare:workers';
import { newRoom, publicRoom, apply, type Room } from '@/lib/game';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Room-Token'}});
export async function OPTIONS(){return json({});}
export async function POST(req:Request){try{
 const raw=await req.text();if(raw.length>12000)return json({error:'Request is too large.'},413);const b=JSON.parse(raw);const db=env.DB!;const action=b.action;const token=req.headers.get('X-Room-Token')||'';
 if(!/^[a-f0-9-]{36}$/.test(token))return json({error:'A valid session is required.'},401);
 // Keep public room discovery bounded. Existing players use unguessable bearer tokens.
 if(action==='create'||action==='join'){
 const ip=req.headers.get('cf-connecting-ip')||'unknown';
 const bucket=Math.floor(Date.now()/60000);
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+':'+bucket));
 const key=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')+':'+action;
 const hit=await db.prepare('INSERT INTO request_limits (id,count,expires) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+120000).first<{count:number}>();
 if((hit?.count||0)>(action==='create'?6:30))return json({error:'Too many attempts. Please wait a minute and try again.'},429);
 await db.prepare('DELETE FROM request_limits WHERE id IN (SELECT id FROM request_limits WHERE expires<? LIMIT 50)').bind(Date.now()).run();
 }
 if(action==='create'){
 const name=String(b.name||'Detective').trim().slice(0,24);if(!b.demo&&(!b.truth?.trim()||!b.redHerring?.trim()||!b.smokingGun?.trim()))return json({error:'Fill in all three pieces of the memory.'},400);
 const input={...b,truth:String(b.truth||'').slice(0,800),redHerring:String(b.redHerring||'').slice(0,500),smokingGun:String(b.smokingGun||'').slice(0,500),archetype:String(b.archetype||'The case of us').slice(0,60)};
 for(let i=0;i<5;i++){const bytes=crypto.getRandomValues(new Uint8Array(4));const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const code=Array.from(bytes,x=>chars[x%chars.length]).join('');const r=newRoom(code,token,name,input);try{await db.prepare('INSERT INTO rooms (code,data,revision,updated) VALUES (?,?,0,?)').bind(code,JSON.stringify(r),Date.now()).run();return json({...publicRoom(r,token),revision:0});}catch(e){if(!String(e).includes('UNIQUE'))throw e;}}
 return json({error:'Could not reserve a room. Try again.'},503);
 }
 const code=String(b.code||'').toUpperCase();if(!/^[A-Z2-9]{4}$/.test(code))return json({error:'Enter the four-character room code.'},400);
 for(let attempt=0;attempt<8;attempt++){
 const row=await db.prepare('SELECT data,revision FROM rooms WHERE code=?').bind(code).first<{data:string;revision:number}>();if(!row)return json({error:'That room was not found. Check the code.'},404);const r:Room=JSON.parse(row.data);
 if(Date.now()-r.created>86400000)return json({error:'This room has expired. Open a new case.'},410);
 if(action==='join'){if(!r.players.some(p=>p.token===token)){if(r.solo||r.phase==='reveal')return json({error:'This case is closed to new detectives.'},400);if(r.players.length>=8)return json({error:'This room already has eight people.'},400);r.players.push({id:crypto.randomUUID(),token,name:String(b.name||'Detective').trim().slice(0,24),role:'detective',seen:Date.now()});}}
 else apply(r,token,action,b);
 const result=await db.prepare('UPDATE rooms SET data=?,revision=revision+1,updated=? WHERE code=? AND revision=?').bind(JSON.stringify(r),Date.now(),code,row.revision).run();if(result.meta.changes)return json({...publicRoom(r,token),revision:row.revision+1});
 }return json({error:'The room is busy. Please try again.'},409);
 }catch(e){return json({error:e instanceof Error?e.message:'Unable to reach the case archive.'},400);}}
