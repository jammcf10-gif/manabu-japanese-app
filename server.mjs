import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||8787);
const OPENAI_API_KEY=process.env.OPENAI_API_KEY||'';
const MAX_JSON=220_000;
const MAX_AUDIO=12_000_000;
const buckets=new Map();

function securityHeaders(res,type='text/plain; charset=utf-8'){
  res.setHeader('Content-Type',type);
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Cross-Origin-Opener-Policy','same-origin');
  res.setHeader('Permissions-Policy','camera=(self), microphone=(self), geolocation=()');
  res.setHeader('Cache-Control',type.includes('text/html')?'no-cache':'public, max-age=3600');
}
function json(res,status,obj){securityHeaders(res,'application/json; charset=utf-8');res.statusCode=status;res.end(JSON.stringify(obj))}
function limited(ip,key,limit,windowMs=60_000){const id=`${ip}:${key}`,now=Date.now();let b=buckets.get(id)||[];b=b.filter(t=>now-t<windowMs);if(b.length>=limit){buckets.set(id,b);return true}b.push(now);buckets.set(id,b);return false}
async function body(req,max){const chunks=[];let total=0;for await(const c of req){total+=c.length;if(total>max)throw Object.assign(new Error('Request too large'),{status:413});chunks.push(c)}return Buffer.concat(chunks)}
async function openaiFetch(url,opts){if(!OPENAI_API_KEY)throw Object.assign(new Error('OPENAI_API_KEY is not configured on the server.'),{status:503});const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),35_000);try{return await fetch(url,{...opts,signal:ctrl.signal,headers:{...(opts.headers||{}),Authorization:`Bearer ${OPENAI_API_KEY}`}})}finally{clearTimeout(timer)}}
async function handleAI(req,res,ip){
  if(limited(ip,'ai',30))return json(res,429,{error:{message:'Too many AI requests. Please wait a moment.'}});
  try{const raw=await body(req,MAX_JSON);const data=JSON.parse(raw.toString('utf8'));const model=String(data.model||'gpt-5.6-luna').slice(0,80),instructions=String(data.instructions||'').slice(0,12_000),input=String(data.input||'').slice(0,30_000);if(!input)return json(res,400,{error:{message:'Missing input.'}});const r=await openaiFetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input})});const text=await r.text();securityHeaders(res,'application/json; charset=utf-8');res.statusCode=r.status;res.end(text)}catch(e){json(res,e.status||500,{error:{message:e.name==='AbortError'?'AI request timed out.':e.message||'AI request failed.'}})}
}
async function handleTranscribe(req,res,ip){
  if(limited(ip,'transcribe',12))return json(res,429,{error:{message:'Too many transcription requests. Please wait a moment.'}});
  try{const raw=await body(req,MAX_AUDIO);const ct=req.headers['content-type']||'';if(!ct.startsWith('multipart/form-data'))return json(res,400,{error:{message:'Expected multipart audio upload.'}});const r=await openaiFetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{'Content-Type':ct},body:raw});const text=await r.text();securityHeaders(res,'application/json; charset=utf-8');res.statusCode=r.status;res.end(text)}catch(e){json(res,e.status||500,{error:{message:e.name==='AbortError'?'Transcription timed out.':e.message||'Transcription failed.'}})}
}
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.css':'text/css; charset=utf-8'};
async function serveStatic(req,res){
  let pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/'||pathname==='')pathname='/index.html';
  const rel=decodeURIComponent(pathname).replace(/^\/+/, '');
  const root=path.resolve(__dirname);
  const file=path.resolve(__dirname,rel);
  if(!file.startsWith(root+path.sep))return json(res,403,{error:{message:'Forbidden'}});
  try{
    const data=await fs.readFile(file);
    securityHeaders(res,MIME[path.extname(file)]||'application/octet-stream');
    res.statusCode=200;
    if(req.method==='HEAD')return res.end();
    return res.end(data);
  }catch{
    // PWA/iOS can relaunch a saved app at a previously visited client-side URL.
    // For browser navigations, always fall back to the app shell instead of a 404.
    const acceptsHtml=String(req.headers.accept||'').includes('text/html');
    const looksLikeRoute=!path.extname(pathname);
    if(acceptsHtml||looksLikeRoute){
      try{
        const data=await fs.readFile(path.join(__dirname,'index.html'));
        securityHeaders(res,'text/html; charset=utf-8');
        res.statusCode=200;
        if(req.method==='HEAD')return res.end();
        return res.end(data);
      }catch{}
    }
    return json(res,404,{error:{message:'Not found'}});
  }
}
const server=http.createServer(async(req,res)=>{const ip=req.socket.remoteAddress||'unknown';if(req.method==='POST'&&req.url?.startsWith('/api/manabu-ai'))return handleAI(req,res,ip);if(req.method==='POST'&&req.url?.startsWith('/api/manabu-transcribe'))return handleTranscribe(req,res,ip);if(!['GET','HEAD'].includes(req.method||''))return json(res,405,{error:{message:'Method not allowed'}});return serveStatic(req,res)});
server.listen(PORT,()=>console.log(`Manabu beta running at http://localhost:${PORT}`));
