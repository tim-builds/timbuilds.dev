/* Private, loopback-only integration harness. Contains no game or emulator binaries. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),site=path.resolve(here,'../..');
const configPath=process.argv[2];
if(!configPath)throw Error('Usage: node tools/classic-lab/serve.mjs <private-config.json> [port]');
const config=JSON.parse(fs.readFileSync(path.resolve(configPath),'utf8'));
if(config.privateTest!==true)throw Error('The configuration must explicitly acknowledge privateTest: true.');
const engine=fs.realpathSync(config.engine);
const games=new Map(Object.entries(config.games).map(([id,g])=>{
 if(!/^[a-z0-9-]+$/.test(id)||!g.files||!g.files[g.entry])throw Error('Invalid game configuration');
 return [id,{...g,files:new Map(Object.entries(g.files).map(([name,file])=>{
  if(!/^[a-zA-Z0-9_.-]+\.(dcr|cct|cst|dir)$/i.test(name))throw Error('Invalid game filename');
  return [name,fs.realpathSync(file)];
 }))}];
}));
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.dcr':'application/x-director','.cct':'application/x-director','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
let origin;
function send(res,bytes,file,extra={}){res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store',...extra});res.end(bytes);}
const server=http.createServer((req,res)=>{
 if(req.headers.host!==new URL(origin).host){res.writeHead(403).end();return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 try{
  const u=new URL(req.url,origin),name=decodeURIComponent(u.pathname);
  if(name.includes('..')||name.includes('\\')||name.includes('\0')){res.writeHead(403).end();return;}
  if(name==='/__classic__/config.json'){send(res,JSON.stringify([...games].map(([id,g])=>({id,title:g.title}))),name);return;}
  if(name==='/__classic__/frame.html'){
   const g=games.get(u.searchParams.get('game'));if(!g){res.writeHead(404).end();return;}
   const attrs=Object.entries(g.parameters||{}).map(([k,v])=>{if(!/^sw[0-9]+$/i.test(k))throw Error('Only documented sw* embedding parameters allowed');return `${k}="${safe(v)}"`;}).join(' ');
   const csp=`default-src 'none';script-src ${origin} 'wasm-unsafe-eval';style-src ${origin} 'unsafe-inline';img-src ${origin} data: blob:;font-src ${origin} data: blob:;connect-src ${origin} blob: data:;worker-src ${origin} blob:;media-src blob: data:;object-src ${origin};base-uri 'none';form-action 'none';frame-src 'none'`;
   const html=`<!doctype html><html><head><meta charset="utf-8"><title>${safe(g.title)}</title><style>html,body{margin:0;width:640px;height:420px;overflow:hidden;background:#000;color:#fff}</style><script defer src="/\u005f_classic__/frame.js"></script><script defer src="/\u005f_classic__/engine/dirplayer-polyfill.js"></script></head><body data-parent-origin="${origin}"><embed type="application/x-director" width="640" height="420" src="/\u005f_classic__/game/${safe(u.searchParams.get('game'))}/${safe(g.entry)}" ${attrs}></body></html>`;
   send(res,html,name,{'Content-Security-Policy':csp,'Access-Control-Allow-Origin':'null','Referrer-Policy':'no-referrer'});return;
  }
  if(name.startsWith('/__classic__/game/')){
   const [, , ,id,filename]=name.split('/');const file=games.get(id)?.files.get(filename);
   if(!file){res.writeHead(404).end();return;}send(res,fs.readFileSync(file),file,{'Access-Control-Allow-Origin':'null'});return;
  }
  if(name.startsWith('/__classic__/engine/')){
   const file=fs.realpathSync(path.join(engine,name.slice('/__classic__/engine/'.length)));
   if(!file.startsWith(engine+path.sep)||!['.js','.wasm','.json','.ttf','.png'].includes(path.extname(file))){res.writeHead(403).end();return;}
   send(res,fs.readFileSync(file),file,{'Access-Control-Allow-Origin':'null'});return;
  }
  if(['/__classic__/host.js','/__classic__/frame.js'].includes(name)){send(res,fs.readFileSync(path.join(here,path.basename(name))),name,{'Access-Control-Allow-Origin':'null'});return;}
  if(name!=='/'&&!/^\/(portfolio|projects|openhoops|\.well-known|legacy-stubs)\//.test(name)){res.writeHead(404).end();return;}
  let file=path.join(site,name==='/'?'index.html':name);if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');file=fs.realpathSync(file);
  if(!file.startsWith(site+path.sep)){res.writeHead(403).end();return;}
  let bytes=fs.readFileSync(file);if(name==='/')bytes=bytes.toString('utf8').replace('</body>','<script defer src="/__classic__/host.js"></script></body>');send(res,bytes,file);
 }catch(error){res.writeHead(error.code==='ENOENT'?404:400).end('Unavailable lab resource');}
});
server.listen(Number(process.argv[3]||0),'127.0.0.1',()=>{origin='http://127.0.0.1:'+server.address().port;console.log('Private classic-game lab: '+origin);});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
