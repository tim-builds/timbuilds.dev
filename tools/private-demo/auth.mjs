/** Origin-enforced owner demo access. No URL-only or client-side password protection. */
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
const cookieName='__Host-timbuilds_demo';
const hash=s=>createHash('sha256').update(s).digest();
const token=()=>randomBytes(32).toString('base64url');
export function createAuth({getOrigin,passwordHash,now=Date.now,sessionMs=12*60*60*1000}) {
 if(!/^[a-f0-9]{64}$/.test(passwordHash))throw Error('A SHA-256 hash of a cryptographically random owner password is required.');
 const expected=Buffer.from(passwordHash,'hex'),sessions=new Map(),tickets=new Map(),attempts=new Map();
 let globalAttempts=[];
 function prune(){const t=now();for(const [id,s] of sessions)if(s.expires<=t){sessions.delete(id);tickets.delete(s.ticket);}for(const [ip,a] of attempts)if(a.until<=t)attempts.delete(ip);globalAttempts=globalAttempts.filter(x=>x>t-60000);}
 const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=')));
 const session=req=>{const s=sessions.get(cookies(req)[cookieName]);return s&&s.expires>now()?s:null;};
 function headers(res){res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('Pragma','no-cache');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');}
 function deny(res,status=401){res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'}).end(status===401?'Private demo: sign in at the homepage.':'Request refused.');return null;}
 function login(res,status=200){res.setHeader('Referrer-Policy','same-origin');res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");res.writeHead(status,{'Content-Type':'text/html; charset=utf-8'}).end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>timBuilds - Private demo</title><style>html{color-scheme:dark}body{font:17px system-ui;margin:0;min-height:100dvh;display:grid;place-items:center;background:#112226;color:#fafafa}main{width:min(350px,calc(100% - 48px));padding:30px 0}h1{font-size:28px}p{line-height:1.5;color:#bdcdd0}label{display:block;margin-top:28px}input,button{box-sizing:border-box;width:100%;font:inherit;padding:14px;margin-top:10px;border:1px solid #70848a;border-radius:8px}button{background:#dbedef;color:#122226;font-weight:650;cursor:pointer}small{display:block;margin-top:24px;line-height:1.5;color:#9eb3b8}</style></head><body><main><h1>Private demo</h1><p>Tim's personal demo desktop. The games and their files stay locked until you sign in.</p>${status===401?'<p role="alert">That password was not accepted.</p>':''}<form method="post" action="/__auth/login"><label for="password">Demo password</label><input id="password" name="password" type="password" autocomplete="current-password" maxlength="100" required><button type="submit">Unlock demo</button></form><small>Owner only. Sharing this address does not grant access. Do not share the password.</small></main></body></html>`);return null;}
 async function body(req){let s='';for await(const chunk of req){s+=chunk;if(Buffer.byteLength(s)>1024)throw Error('body-limit');}return new URLSearchParams(s);}
 async function authorize(req,res){
  headers(res);prune();
  let origin;try{origin=new URL(getOrigin());}catch{return deny(res,503);}
  // Explicit HTTPS origin; forwarded Host/origin flags never create trust.
  if(origin.protocol!=='https:'||req.headers.host!==origin.host||req.headers['x-forwarded-proto']!=='https')return deny(res,403);
  let u;try{u=new URL(req.url,origin);}catch{return deny(res,400);}
  if(!req.url.startsWith('/')||req.url.startsWith('//')||/[\\\x00-\x1f]/.test(req.url)||/%(?:2e|2f|5c|00)/i.test(req.url))return deny(res,400);
  if(u.pathname==='/__auth/login'&&req.method==='POST'){
   if(req.headers.origin!==origin.origin||!String(req.headers['content-type']||'').startsWith('application/x-www-form-urlencoded'))return deny(res,403);
   const ip=req.headers['cf-connecting-ip']||req.socket.remoteAddress;const a=attempts.get(ip)||{count:0,until:now()+60000};
   if(a.count>=5||globalAttempts.length>=30||attempts.size>=2000)return deny(res,429);
   a.count++;attempts.set(ip,a);globalAttempts.push(now());
   let form;try{form=await body(req);}catch{return deny(res,413);}
   if(!timingSafeEqual(hash((form.get('password')||'').trim()),expected))return login(res,401);
   attempts.delete(ip);
   // Bound memory and do not retain old capability tickets after eviction.
   if(sessions.size>=10){const [id,s]=sessions.entries().next().value;sessions.delete(id);tickets.delete(s.ticket);}
   const id=token(),s={id,ticket:token(),expires:now()+sessionMs};sessions.set(id,s);tickets.set(s.ticket,id);
   res.writeHead(303,{'Location':'/','Set-Cookie':`${cookieName}=${id}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(sessionMs/1000)}`}).end();return null;
  }
  if(u.pathname==='/__auth/logout'&&req.method==='POST'){
   if(req.headers.origin!==origin.origin)return deny(res,403);const s=session(req);if(s){sessions.delete(s.id);tickets.delete(s.ticket);}
   res.writeHead(204,{'Set-Cookie':`${cookieName}=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`}).end();return null;
  }
  if(!['GET','HEAD'].includes(req.method))return deny(res,405);
  // Sandboxed frames cannot use the desktop cookie. Their opaque 256-bit ticket
  // is session-bound, expires/revokes with it and permits ONLY emulator/game files.
  const m=u.pathname.match(/^\/__frame\/([A-Za-z0-9_-]{43})(\/__classic__\/.*)$/);
  if(m){
   const s=sessions.get(tickets.get(m[1]));if(!s||s.expires<=now())return deny(res);
   if(!/^\/__classic__\/(?:frame\.html|frame\.js|engine\/.+|game\/.+)$/.test(m[2]))return deny(res,403);
   return {session:s,url:new URL(m[2]+u.search,origin),prefix:'/__frame/'+m[1],origin:origin.origin};
  }
  const s=session(req);
  if(!s)return u.pathname==='/'&&req.method==='GET'?login(res):deny(res);
  if(u.pathname.startsWith('/__frame/'))return deny(res,403);
  if(req.headers.origin&&req.headers.origin!==origin.origin)return deny(res,403);
  if(req.headers['sec-fetch-site']==='cross-site')return deny(res,403);
  return {session:s,url:u,prefix:'/__frame/'+s.ticket,origin:origin.origin};
 }
 return {authorize};
}