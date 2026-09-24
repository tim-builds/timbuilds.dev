import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'openhoops/confirm.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'confirmation page script exists');

async function visit(fragment,response){
 const elements=Object.fromEntries(['heading','message','open-app','computer-help'].map(id=>[id,{textContent:'',hidden:id==='open-app'||id==='computer-help'}]));
 const location={hash:fragment,pathname:'/openhoops/confirm.html',search:'?fixture=1'};
 const calls=[];
 let replaced;
 const context={
  URLSearchParams,AbortController,setTimeout,clearTimeout,location,
  history:{replaceState(_state,_title,url){replaced=url;location.hash='';}},
  document:{getElementById(id){return elements[id];}},
  fetch:async(url,options)=>{calls.push({url,options,fragmentAtFetch:location.hash});if(response instanceof Error)throw response;return {status:response.status,ok:response.status>=200&&response.status<300,json:async()=>response.body};}
 };
 vm.runInNewContext(script,context);
 await new Promise(resolve=>setTimeout(resolve,0));
 return {elements,calls,replaced};
}

const valid=await visit('#access_token=dummy-token&refresh_token=unused',{status:200,body:{email_confirmed_at:'2026-09-24T12:00:00Z'}});
assert.equal(valid.elements.heading.textContent,'Your email is confirmed.');
assert.equal(valid.elements.message.textContent,'Open the openHoops app to log in.');
assert.equal(valid.elements['open-app'].hidden,false);
assert.equal(valid.calls[0].url,'https://tpqrkdvvnoipxrrxovnb.supabase.co/auth/v1/user');
assert.equal(valid.calls[0].options.headers.Authorization,'Bearer dummy-token');
assert.equal(valid.calls[0].options.credentials,'omit');
assert.equal(valid.calls[0].fragmentAtFetch,'');
assert.equal(valid.replaced,'/openhoops/confirm.html?fixture=1');

for(const [fragment,response,heading] of [
 ['#access_token=dummy-token',{status:401,body:{message:'private dummy-token'}},'This email link has expired or is invalid.'],
 ['#access_token=dummy-token',{status:200,body:{email_confirmed_at:null}},"We couldn't confirm your email."],
 ['#access_token=dummy-token',new Error('network dummy-token'),"We couldn't check your link right now."],
 ['#error=access_denied&error_description=private-dummy-token',null,'This email link has expired or is invalid.'],
 ['#error_code=otp_expired&error_description=private-dummy-token',null,'This email link has expired or is invalid.'],
 ['',null,'No confirmation link found.']
 ]){
 const result=await visit(fragment,response);
 assert.equal(result.elements.heading.textContent,heading);
 assert.equal(result.elements['open-app'].hidden,true);
 assert.ok(!Object.values(result.elements).some(element=>element.textContent.includes('dummy-token')));
 assert.equal(result.replaced,'/openhoops/confirm.html?fixture=1');
 if(!response)assert.equal(result.calls.length,0);
}
console.log('PASS confirmation page: verified success, private failures, token stripping, and no request without a token.');
