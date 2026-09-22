/** Read-only production checks. No real login, recovery request or account mutation. */
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const domains=['timbuilds.dev','tim-builds.dev'];
const routes=['/','/openhoops/privacy.html','/openhoops/terms.html','/openhoops/delete-account.html','/openhoops/reset.html?probe=www','/openhoops/add-friend.html?probe=www','/openhoops/court.html?g=11111111-1111-4111-8111-111111111111','/.well-known/assetlinks.json','/projects/solitaire/','/missing-www-test?next=https%3A%2F%2Fexample.com%2F&x=1&x=2','/openhoops/reset.html?q=a%20b%2Fc%23d&empty=&plus=a+b'];
const results=[];
for(const host of domains){
 for(const protocol of ['http','https'])for(const route of routes){
  const source=protocol+'://www.'+host+route,target='https://'+host+route;
  const r=await fetch(source,{redirect:'manual',signal:AbortSignal.timeout(20000)});
  assert.equal(r.status,301,source+' must be a permanent redirect');assert.equal(r.headers.get('location'),target,'exact path/query and matching apex only');
  assert.equal(r.headers.get('server'),'cloudflare');assert.equal(r.headers.get('clear-site-data'),null);assert.equal(r.headers.get('x-github-request-id'),null,'no redirect dependency on GitHub');
  await r.arrayBuffer();results.push({source,target,status:r.status});
 }
 for(const route of ['/','/openhoops/reset.html?probe=www','/.well-known/assetlinks.json','/missing-www-test?probe=1']){
  const r=await fetch('https://www.'+host+route,{signal:AbortSignal.timeout(20000)});assert.equal(r.status,route.startsWith('/missing-')?404:200);
  assert.equal(new URL(r.url).hostname,host);assert.equal(new URL(r.url).search,new URL('https://'+host+route).search);
  if(route.startsWith('/openhoops/reset'))assert.match(r.headers.get('cache-control')||'',/no-store/);await r.arrayBuffer();
 }
 const r=await fetch('https://'+host+'/',{redirect:'manual',signal:AbortSignal.timeout(20000)});assert.equal(r.status,200,'apex must not redirect');assert.match(r.headers.get('cache-control')||'',/no-transform/);await r.arrayBuffer();
 console.log('PASS '+host+': HTTP/HTTPS WWW redirects, strict TLS, encoded paths/queries, matching apex, true 404, recovery no-store, no GitHub redirect or loop.');
}
fs.mkdirSync(path.join(root,'.qa'),{recursive:true});fs.writeFileSync(path.join(root,'.qa/www-http-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),redirects:results,accountOperations:false},null,2));
console.log('PASS '+results.length+' exact WWW redirects and both apexes unchanged. Fragments require the separate browser test.');
