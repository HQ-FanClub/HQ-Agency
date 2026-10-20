'use strict';
// FORMA Studio private local gateway. Binds to localhost only.
// No API credentials are shipped with this source.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const PORT=Number(process.env.PORT)||3210;
function loadEnv(){
 const f=path.join(root,'.env');if(!fs.existsSync(f))return;
 for(const line of fs.readFileSync(f,'utf8').split(/\r?\n/)){
  const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);if(!m||process.env[m[1]])continue;
  let v=m[2].trim();if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);
  process.env[m[1]]=v;
 }
}
loadEnv();
const CHAT_GATEWAY=process.env.FORMA_CHAT_BACKEND||'https://forma-ai-backend.hqd.workers.dev';
const SITE_ORIGIN=process.env.FORMA_FRONTEND_ORIGIN||'https://forma-creative-os.hqd.workers.dev';
let NVIDIA_KEYS=(process.env.NVIDIA_KEYS||'').split(',').map(x=>x.trim()).filter(Boolean);
const modelRoutes={
 'flux-schnell':'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell',
 'flux-dev':'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev',
 'sdxl':'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium'
};
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const hits=[];
function respond(res,status,json){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(json))}
function readBody(req,max=35000){return new Promise((resolve,reject)=>{let total=0,chunks=[];req.on('data',b=>{total+=b.length;if(total>max){reject(Error('Payload too large'));req.destroy();return}chunks.push(b)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch(e){reject(Error('Invalid JSON'))}});req.on('error',reject)})}
function limit(){const now=Date.now();while(hits.length&&now-hits[0]>60000)hits.shift();if(hits.length>=15)return false;hits.push(now);return true}
async function upstream(url,opts,timeoutMs=120000){const ctrl=new AbortController(),id=setTimeout(()=>ctrl.abort(),timeoutMs);try{return await fetch(url,{...opts,signal:ctrl.signal})}finally{clearTimeout(id)}}
async function handler(req,res){
 const url=new URL(req.url,'http://localhost:'+PORT);
 if(url.pathname==='/api/health')return respond(res,200,{status:'online',imagesConfigured:NVIDIA_KEYS.length>0,chatGateway:CHAT_GATEWAY});
 if(url.pathname==='/api/local-keys'&&req.method==='POST'){
  // Browser-only onboarding, bound to loopback. No cross-origin key configuration.
  const host=req.headers.host||'';
  const origin=req.headers.origin||'';
  if(!/^((localhost)|(127\.0\.0\.1)):\d{2,5}$/.test(host)||origin!=='http://'+host){
   return respond(res,403,{error:'Key setup is only allowed from this local FORMA window.'});
  }
  let body;try{body=await readBody(req,15000)}catch(e){return respond(res,400,{error:'Invalid key request'})}
  const incoming=String(body&&body.keys||'').split(/[\s,]+/).filter(Boolean);
  const keys=[...new Set(incoming)];
  if(keys.length<1||keys.length>30||keys.some(k=>!/^nvapi-[A-Za-z0-9_-]{25,230}$/.test(k))){
   return respond(res,400,{error:'Paste one or more NVIDIA API keys, separated by commas or newlines.'});
  }
  try{
   const envPath=path.join(root,'.env');
   let current=fs.existsSync(envPath)?fs.readFileSync(envPath,'utf8'):'';
   const value='NVIDIA_KEYS='+keys.join(',');
   if(/^NVIDIA_KEYS=.*$/m.test(current))current=current.replace(/^NVIDIA_KEYS=.*$/m,value);
   else current+=(current.endsWith('\n')?'':'\n')+value+'\n';
   fs.writeFileSync(envPath,current,{encoding:'utf8',mode:0o600});
   NVIDIA_KEYS=keys;
   return respond(res,200,{configured:true,count:keys.length,message:'Saved privately to this laptop. You can now try AI image generation.'});
  }catch(e){return respond(res,500,{error:'Could not save local key file. Check folder permissions.'})}
 }
 if(url.pathname==='/api/chat'&&req.method==='POST'){
  if(!limit())return respond(res,429,{error:'Local request limit reached. Wait a minute.'});
  let data;try{data=await readBody(req)}catch(e){return respond(res,400,{error:e.message})}
  if(!data||typeof data.message!=='string'||!data.message.trim()||data.message.length>7800)return respond(res,400,{error:'Invalid message'});
  try{
   const r=await upstream(CHAT_GATEWAY.replace(/\/$/,'')+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Origin':SITE_ORIGIN},body:JSON.stringify({agent:data.agent||'graphic-designer',message:data.message})},60000);
   const body=await r.json().catch(()=>({error:'Chat service returned an invalid response'}));return respond(res,r.status,body);
  }catch(e){return respond(res,502,{error:e.name==='AbortError'?'Chat timed out':'Chat backend unavailable'})}
 }
 if(url.pathname==='/api/generate'&&req.method==='POST'){
  if(!NVIDIA_KEYS.length)return respond(res,503,{error:'Image engine not configured. Add newly rotated NVIDIA_KEYS to local .env.'});
  if(!limit())return respond(res,429,{error:'Local request limit reached. Wait a minute.'});
  let body;try{body=await readBody(req)}catch(e){return respond(res,400,{error:e.message})}
  const prompt=typeof body.prompt==='string'?body.prompt.trim().slice(0,1000):'';
  const model=typeof body.model==='string'?body.model:'flux-schnell';
  if(!prompt)return respond(res,400,{error:'Image prompt required'});
  if(!Object.prototype.hasOwnProperty.call(modelRoutes,model))return respond(res,400,{error:'Unsupported image model'});
  const seed=Math.floor(Math.random()*999999),payload={prompt,seed};
  if(model==='sdxl'){
   payload.aspect_ratio=['1:1','16:9','9:16','5:4','4:5','3:2','2:3'].includes(body.aspect_ratio)?body.aspect_ratio:'1:1';
   payload.cfg_scale=7;payload.steps=25;
  }
  let last='Image provider unavailable';
  for(const key of NVIDIA_KEYS.slice(0,Math.min(NVIDIA_KEYS.length,3))){
   try{
    const r=await upstream(modelRoutes[model],{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)},120000);
    if(!r.ok){last='Provider HTTP '+r.status; if([401,403,404,422].includes(r.status))break;continue}
    const contentType=r.headers.get('content-type')||'';
    let b64=null;
    if(contentType.startsWith('image/')){b64=Buffer.from(await r.arrayBuffer()).toString('base64')}
    else{
     const d=await r.json().catch(()=>({}));
     b64=d?.artifacts?.[0]?.base64||d?.data?.[0]?.b64_json||d?.image||null;
    }
    if(b64)return respond(res,200,{artifacts:[{base64:b64}]});
    last='Provider returned no image';
   }catch(e){last=e.name==='AbortError'?'Provider timed out':'Image provider connection failed'}
  }
  return respond(res,502,{error:last+'. Check credentials, entitlement, endpoint and provider quota.'});
 }
 if(url.pathname.startsWith('/api/'))return respond(res,404,{error:'This API route is not available in local prototype.'});
 if(req.method!=='GET'&&req.method!=='HEAD')return respond(res,405,{error:'Method not allowed'});
 let relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
 if(relative.includes('..')||relative.includes('\\')||relative.includes('\0'))return respond(res,403,{error:'Forbidden'});
 let target=path.resolve(root,'.'+relative);if(!target.startsWith(root+path.sep))return respond(res,403,{error:'Forbidden'});
 try{const st=fs.statSync(target);if(!st.isFile())throw Error('Not a file');res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});fs.createReadStream(target).pipe(res)}
 catch(e){respond(res,404,{error:'Not found'})}
}
const server=http.createServer((req,res)=>handler(req,res).catch(e=>respond(res,500,{error:'Internal server error'})));
server.listen(PORT,'127.0.0.1',()=>{console.log('\nFORMA STUDIO — LOCAL TEST\nhttp://localhost:'+PORT+'\nOllama: Cloudflare gateway ('+CHAT_GATEWAY+')\nImage model credentials: '+(NVIDIA_KEYS.length?'configured':'NOT configured')+'\nNo public listener.\n')});