/** Separate private runtime. Never deploy its data/config through public Pages. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {createAuth} from './auth.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),site=path.resolve(here,'../..');
if(!process.argv[2])throw Error('Usage: node tools/private-demo/serve.mjs <private-config.json> [port]');
const config=JSON.parse(fs.readFileSync(path.resolve(process.argv[2]),'utf8'));
if(config.privateTest!==true||config.ownerOnly!==true)throw Error('Explicit privateTest and ownerOnly acknowledgments required.');
const engine=fs.realpathSync(config.engine);
const games=new Map(Object.entries(config.games).map(([id,g])=>{
 if(!/^[a-z0-9-]+$/.test(id)||!g.files?.[g.entry])throw Error('Invalid game configuration');
 return [id,{...g,files:new Map(Object.entries(g.files).map(([name,file])=>{
  if(!/^[a-zA-Z0-9_.-]+\.(dcr|cct|cst|dir)$/i.test(name))throw Error('Invalid game filename');
  return [name,fs.realpathSync(file)];
 }))}];
}));
const getOrigin=()=>fs.readFileSync(config.originFile,'utf8').trim();
const auth=createAuth({getOrigin,passwordHash:config.passwordHash});
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.dcr':'application/x-director','.cct':'application/x-director','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};
const compressed=new Map();
const server=http.createServer(async(req,res)=>{
 try{
  const access=await auth.authorize(req,res);if(!access)return;
  const {url:u,prefix,origin}=access;
  const name=decodeURIComponent(u.pathname);
  if(name.includes('..')||name.includes('\\')||name.includes('\0')){res.writeHead(403).end();return;}
  function send(bytes,file,extra={}){
   const type=mime[path.extname(file)]||'application/octet-stream';let body=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);
   const headers={'Content-Type':type,...extra};
   if(body.length>4096&&/text|javascript|json|wasm/.test(type)&&/\bgzip\b/.test(req.headers['accept-encoding']||'')){
    // Cache compression only for file buffers, not HTML containing access tickets.
    const key=file+':'+body.length;
    if(Buffer.isBuffer(bytes)){if(!compressed.has(key))compressed.set(key,gzipSync(body));body=compressed.get(key);}else body=gzipSync(body);
    headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding';
   }
   headers['Content-Length']=body.length;res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:body);
  }
  if(name==='/__classic__/config.json'){
   send(JSON.stringify([...games].map(([id,g])=>({id,title:g.title,frame:prefix+'/__classic__/frame.html?game='+id}))),name);return;
  }
  if(name==='/__classic__/frame.html'){
   const id=u.searchParams.get('game'),g=games.get(id);if(!g){res.writeHead(404).end();return;}
   const attrs=Object.entries(g.parameters||{}).map(([k,v])=>{if(!/^sw[0-9]+$/i.test(k))throw Error('Only sw* embedding parameters allowed');return `${k}="${safe(v)}"`;}).join(' ');
   const csp=`default-src 'none'; script-src ${origin} 'wasm-unsafe-eval'; style-src 'unsafe-inline'; img-src ${origin} data: blob:; font-src ${origin} data: blob:; connect-src ${origin} blob: data:; worker-src ${origin} blob:; media-src blob: data:; object-src ${origin}; base-uri 'none'; form-action 'none'; frame-src 'none'; frame-ancestors 'self'`;
   const html=`<!doctype html><html><head><meta charset="utf-8"><title>${safe(g.title)}</title><style>html,body{margin:0;width:640px;height:420px;overflow:hidden;background:#000;color:#fff;touch-action:none}canvas{touch-action:none}</style><script defer src="${prefix}/__classic__/frame.js"></script><script defer src="${prefix}/__classic__/engine/dirplayer-polyfill.js"></script></head><body data-parent-origin="${origin}"><embed type="application/x-director" width="640" height="420" src="${prefix}/__classic__/game/${id}/${safe(g.entry)}" ${attrs}></body></html>`;
   send(html,name,{'Content-Security-Policy':csp,'Access-Control-Allow-Origin':'null'});return;
  }
  if(name.startsWith('/__classic__/game/')){
   const m=name.match(/^\/__classic__\/game\/([a-z0-9-]+)\/([a-zA-Z0-9_.-]+)$/),file=m&&games.get(m[1])?.files.get(m[2]);
   if(!file){res.writeHead(404).end();return;}send(fs.readFileSync(file),file,{'Access-Control-Allow-Origin':'null'});return;
  }
  if(name.startsWith('/__classic__/engine/')){
   const file=fs.realpathSync(path.join(engine,name.slice('/__classic__/engine/'.length)));
   if(!file.startsWith(engine+path.sep)||!['.js','.wasm','.json','.ttf','.png'].includes(path.extname(file))){res.writeHead(403).end();return;}
   send(fs.readFileSync(file),file,{'Access-Control-Allow-Origin':'null'});return;
  }
  if(name==='/__classic__/frame.js'){send(fs.readFileSync(path.join(here,'frame.js')),name,{'Access-Control-Allow-Origin':'null'});return;}
  if(['/__classic__/host.js','/__classic__/touchpad.js'].includes(name)){send(fs.readFileSync(path.join(here,path.basename(name))),name);return;}
  if(name!=='/'&&!/^\/(portfolio|projects|openhoops|\.well-known|legacy-stubs)\//.test(name)){res.writeHead(404).end();return;}
  let file=path.join(site,name==='/'?'index.html':name);if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');file=fs.realpathSync(file);
  if(!file.startsWith(site+path.sep)){res.writeHead(403).end();return;}
  let bytes=fs.readFileSync(file);
  if(name==='/'){
   bytes=bytes.toString('utf8').replace('</body>','<script defer src="/__classic__/touchpad.js"></script><script defer src="/__classic__/host.js"></script></body>');
   res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; worker-src 'self' blob:; media-src 'self' blob: data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`);
  }
  send(bytes,file);
 }catch(error){if(!res.headersSent)res.writeHead(error.code==='ENOENT'?404:400).end('Resource unavailable.');else res.end();}
});
server.requestTimeout=10000;server.headersTimeout=10000;server.maxHeadersCount=50;
server.listen(Number(process.argv[3]||8806),'127.0.0.1',()=>console.log('Private demo gateway listening on loopback port '+server.address().port+'. HTTPS origin and login are required.'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));