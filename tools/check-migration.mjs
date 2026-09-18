import assert from 'node:assert/strict';
export async function checkMigration({evaluate,send,until,origin,pass}){
 const stub='window.__mockReset=true;window.supabase={createClient(){return {auth:{setSession:async args=>{window.__resetArgs=args;return {error:null};},updateUser:async()=>{throw Error("No password submission is allowed in this migration test");}}};}};';
 const onPaused=async p=>{if(p.request.url.startsWith('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'))await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:Buffer.from(stub).toString('base64')});else await send('Fetch.failRequest',{requestId:p.requestId,errorReason:'BlockedByClient'});};
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
 await send('Page.navigate',{url:origin+'/openhoops/add-friend.html#u=migration_test'});
 await until(()=>evaluate('document.querySelector("#open")?.getAttribute("href")?.startsWith("openhoops:")'),'friend handoff');
 assert.equal(await evaluate('document.querySelector("#open").getAttribute("href")'),'openhoops://add-friend?u=migration_test');
 assert.equal(await evaluate('location.hash'),'#u=migration_test');
 await send('Fetch.disable');delete globalThis.__migrationFetchPaused;
 pass('Cloudflare-style .html redirects retain reset/friend fragments and friend handoff; reset uses a mocked Supabase client, not a real account');
}
