import assert from 'node:assert/strict';
export async function checkMigration({evaluate,send,until,origin,pass}){
 const stub='window.__mockReset=true;window.supabase={createClient(){return {auth:{setSession:async args=>{window.__resetArgs=args;return {error:null};},updateUser:async()=>{throw Error("No password submission is allowed in this migration test");}}};}};';
 let confirmResponse={status:200,body:{email_confirmed_at:'2026-09-24T12:00:00Z'}};
 const observed=[];
 const onPaused=async p=>{
  if(p.request.url.startsWith('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')){
   await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:Buffer.from(stub).toString('base64')});
  }else if(p.request.url==='https://tpqrkdvvnoipxrrxovnb.supabase.co/auth/v1/user'){
   if(p.request.method==='OPTIONS')await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:204,responseHeaders:[{name:'Access-Control-Allow-Origin',value:'*'},{name:'Access-Control-Allow-Headers',value:'authorization,apikey'},{name:'Access-Control-Allow-Methods',value:'GET,OPTIONS'}]});
   else{
    observed.push({url:p.request.url,method:p.request.method,authorization:p.request.headers.Authorization||p.request.headers.authorization});
    if(confirmResponse.networkFailure)await send('Fetch.failRequest',{requestId:p.requestId,errorReason:'InternetDisconnected'});
    else await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:confirmResponse.status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(JSON.stringify(confirmResponse.body)).toString('base64')});
   }
  }else await send('Fetch.failRequest',{requestId:p.requestId,errorReason:'BlockedByClient'});
 };
 // The caller supplies a test-only CDP event hook; never contacts production authentication.
 globalThis.__migrationFetchPaused=onPaused;
 await send('Fetch.enable',{patterns:[{urlPattern:'https://cdn.jsdelivr.net/*'},{urlPattern:'https://*.supabase.co/*'}]});
 for(const route of ['/openhoops/reset.html','/openhoops/reset']){
  await send('Page.navigate',{url:origin+route+'#access_token=migration-dummy-token&refresh_token=migration-dummy-refresh'});
  await until(()=>evaluate('!!window.__resetArgs'),'mocked reset session');
  assert.deepEqual(await evaluate('window.__resetArgs'),{access_token:'migration-dummy-token',refresh_token:'migration-dummy-refresh'});
  assert.equal(await evaluate('location.origin'),new URL(origin).origin);
  assert.ok((await evaluate('location.hash')).includes('access_token=migration-dummy-token'));
 }
 let sequence=0;
 async function confirm(fragment,expectedHeading,success){
  await send('Page.navigate',{url:origin+'/openhoops/'+(sequence++%2?'confirm':'confirm.html')+'?case='+sequence+fragment});
  await until(()=>evaluate('document.querySelector("#heading")?.textContent === '+JSON.stringify(expectedHeading)),'confirmation result: '+expectedHeading);
  assert.equal(await evaluate('location.hash'),'','confirmation fragment removed');
  assert.equal(await evaluate('document.querySelector("#open-app").hidden'),!success);
  assert.equal(await evaluate('document.body.textContent.includes("migration-dummy-token")'),false);
  if(success){assert.equal(await evaluate('document.querySelector("#open-app").getAttribute("href")'),'openhoops://');assert.ok((await evaluate('document.querySelector("#computer-help").textContent')).includes('phone'));}
 }
 await confirm('#access_token=migration-dummy-token','Your email is confirmed.',true);
 assert.deepEqual(observed,[{url:'https://tpqrkdvvnoipxrrxovnb.supabase.co/auth/v1/user',method:'GET',authorization:'Bearer migration-dummy-token'}]);
 confirmResponse={status:401,body:{message:'private error migration-dummy-token'}};
 await confirm('#access_token=migration-dummy-token','This email link has expired or is invalid.',false);
 confirmResponse={status:200,body:{email_confirmed_at:null}};
 await confirm('#access_token=migration-dummy-token',"We couldn't confirm your email.",false);
 confirmResponse={networkFailure:true};
 await confirm('#access_token=migration-dummy-token',"We couldn't check your link right now.",false);
 const before=observed.length;
 await confirm('#error=access_denied&error_description=migration-dummy-token','This email link has expired or is invalid.',false);
 await confirm('#error_code=otp_expired&error_description=migration-dummy-token','This email link has expired or is invalid.',false);
 await confirm('','No confirmation link found.',false);
 assert.equal(observed.length,before,'error and missing-token links never contact Supabase');
 pass('Confirmation verifies the token and confirmed account; invalid, missing, and network failures stay private and never show success');
 await send('Page.navigate',{url:origin+'/openhoops/add-friend.html#u=migration_test'});
 await until(()=>evaluate('document.querySelector("#open")?.getAttribute("href")?.startsWith("openhoops:")'),'friend handoff');
 assert.equal(await evaluate('document.querySelector("#open").getAttribute("href")'),'openhoops://add-friend?u=migration_test');
 assert.equal(await evaluate('location.hash'),'#u=migration_test');
 await send('Fetch.disable');delete globalThis.__migrationFetchPaused;
 pass('Cloudflare-style .html routes retain reset, confirmation, and friend fragments; authentication uses mocks, not real accounts');
}
