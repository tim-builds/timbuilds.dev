import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {randomBytes,createHash} from 'node:crypto';
import {createAuth} from './auth.mjs';
let now=100000,checks=0;
const origin='https://owner.example',password=randomBytes(24).toString('base64url');
const auth=createAuth({getOrigin:()=>origin,passwordHash:createHash('sha256').update(password).digest('hex'),now:()=>now,sessionMs:10000});
async function req(url='/',{method='GET',headers={},body=''}={}){
 const r=Readable.from(body?[Buffer.from(body)]:[]);Object.assign(r,{url,method,headers:{host:'owner.example','x-forwarded-proto':'https',...headers},socket:{remoteAddress:'127.0.0.1'}});
 const res={status:200,headers:{},body:'',setHeader(k,v){this.headers[k.toLowerCase()]=v;},writeHead(s,h={}){this.status=s;for(const [k,v]of Object.entries(h))this.setHeader(k,v);return this;},end(b=''){this.body+=b;return this;}};
 const access=await auth.authorize(r,res);return {access,...res};
}
const expect=(v,s,msg)=>{assert.equal(v,s,msg);checks++;};
expect((await req('/')).status,200,'only login form is public');
expect((await req('/')).headers['referrer-policy'],'same-origin','preserve same-origin form Origin; never accept null origins');
for(const p of ['/__classic__/config.json','/__classic__/frame.html?game=golf','/__classic__/frame.js','/__classic__/engine/dirplayer-polyfill.js','/__classic__/game/billiards/csplmain.dcr','/__classic__/game/golf/csmgholes.cct','/.git/config','/.qa/private-demo/config.json','/portfolio/desktop.js']){
 const r=await req(p);expect(r.status,401,p+' unauthenticated');expect(r.access,null,'no authorized access');
}
for(const h of [{host:'attacker.example'},{'x-forwarded-proto':'http'},{'x-forwarded-proto':''},{host:'attacker.example','x-forwarded-host':'owner.example'},{host:'owner.example:80'}])expect((await req('/',{headers:h})).status,403,'untrusted origin transport denied');
const post={method:'POST',headers:{origin,'content-type':'application/x-www-form-urlencoded','cf-connecting-ip':'login-good'},body:new URLSearchParams({password}).toString()};
expect((await req('/__auth/login',{...post,headers:{...post.headers,origin:'https://attacker.example'}})).status,403,'login CSRF denied');
expect((await req('/__auth/login',{...post,body:'password=wrong'})).status,401,'incorrect password');
const login=await req('/__auth/login',post);expect(login.status,303,'valid login');
const cookie=login.headers['set-cookie'];for(const flag of ['__Host-','Secure','HttpOnly','SameSite=Strict','Path=/']){assert.ok(cookie.includes(flag));checks++;}
const headers={cookie:cookie.split(';')[0]};
let page=await req('/',{headers});assert.ok(page.access);checks++;
const prefix=page.access.prefix;
for(const p of ['/__classic__/frame.html?game=golf','/__classic__/frame.js','/__classic__/engine/dirplayer-polyfill.js','/__classic__/game/golf/csmgholes.cct']){const r=await req(prefix+p,{headers:{origin:'null'}});assert.ok(r.access,p);checks++;}
for(const p of ['/__classic__/config.json','/__classic__/host.js'])expect((await req(prefix+p)).status,403,'ticket cannot access desktop/config');
expect((await req('/__frame/'+ 'a'.repeat(43)+'/__classic__/game/golf/csmgholes.cct')).status,401,'guessed ticket denied');
expect((await req('/__classic__/config.json',{headers:{...headers,origin:'null'}})).status,403,'opaque frame cannot access config using cookie');
expect((await req('/portfolio/desktop.js',{headers:{...headers,'sec-fetch-site':'cross-site'}})).status,403,'cross-site embedding denied');
for(const p of ['//attacker.example/','/portfolio/%2e%2e/.qa','/portfolio/foo%2fbar','/portfolio/foo%5cbar','/portfolio/%00'])expect((await req(p,{headers})).status,400,'bad path rejected');
expect((await req('/__classic__/frame.js',{method:'PUT',headers})).status,405,'write denied');
expect((await req('/__auth/logout',{method:'POST',headers:{...headers,origin:'https://attacker.example'}})).status,403,'logout CSRF denied');
expect((await req('/__auth/logout',{method:'POST',headers:{...headers,origin}})).status,204,'logout');
expect((await req(prefix+'/__classic__/game/golf/csmgholes.cct')).status,401,'ticket revoked on logout');
expect((await req('/__classic__/config.json',{headers})).status,401,'session revoked');
const login2=await req('/__auth/login',post),headers2={cookie:login2.headers['set-cookie'].split(';')[0]};
const prefix2=(await req('/',{headers:headers2})).access.prefix;now+=10001;
expect((await req('/__classic__/config.json',{headers:headers2})).status,401,'session expired');
expect((await req(prefix2+'/__classic__/frame.js')).status,401,'ticket expires with session');
for(let i=0;i<5;i++)expect((await req('/__auth/login',{...post,headers:{...post.headers,'cf-connecting-ip':'bad'},body:'password=wrong'})).status,401,'attempt allowed but rejected');
expect((await req('/__auth/login',{...post,headers:{...post.headers,'cf-connecting-ip':'bad'}})).status,429,'password guessing rate limited');
console.log(`PASS: ${checks} authorization, expiry, revocation, origin, traversal and rate-limit assertions.`);