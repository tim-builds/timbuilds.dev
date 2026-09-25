/* Explicit public-file export for Cloudflare Pages and Workers Static Assets. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'dist');
const marker=path.join(target,'.timbuilds-export');
const roots=['index.html','.nojekyll','portfolio','projects','openhoops','.well-known','legacy-stubs'];
const files=[];
const privateNames=new Set(['.git','.qa','.env','.dev.vars','node_modules','functions','_worker.js']);
const forbidden=/\.(dcr|cct|cst|dir|pem|key|pfx|zip|exe)$/i;
function collect(relative){
 const parts=relative.split(path.sep);
 if(parts.some(part=>privateNames.has(part)||/^\.env(?:\.|$)/i.test(part))||forbidden.test(relative))throw new Error('Non-public export path refused: '+relative);
 const full=path.join(root,relative),stat=fs.lstatSync(full);
 if(stat.isSymbolicLink())throw new Error('Refusing symbolic link: '+relative);
 if(stat.isDirectory()){for(const name of fs.readdirSync(full).sort())collect(path.join(relative,name));}
 else if(stat.isFile())files.push(relative);
}
roots.forEach(collect);
if(fs.existsSync(target)&&(!fs.lstatSync(target).isDirectory()||fs.lstatSync(target).isSymbolicLink()))throw new Error('dist must be a real directory.');
if(fs.existsSync(target)&&!fs.existsSync(marker))throw new Error('dist exists without the export marker; refusing to replace it.');
if(fs.existsSync(target))fs.rmSync(target,{recursive:true});
fs.mkdirSync(target,{recursive:true});
fs.writeFileSync(marker,'Disposable generated public-site export.\n');
const manifest=[];
for(const relative of files){
 const bytes=fs.readFileSync(path.join(root,relative)),destination=path.join(target,relative);
 fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
 manifest.push({path:relative.replaceAll('\\','/'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
// A real 404 prevents an unknown OpenHoops URL from becoming the portfolio SPA.
fs.writeFileSync(path.join(target,'404.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — timBuilds</title><h1>Page not found</h1><p>The requested page does not exist.</p><a href="/">Desktop</a> · <a href="/openhoops/">OpenHoops</a></html>\n');
// Preserve authored HTML on proxied custom domains without changing zone settings.
// Explicit, nonoverlapping paths keep the reset response no-store and avoid
// changing caching/compression for images, JavaScript, CSS or WebAssembly.
const htmlRoutes=new Map();
for(const {path:file} of [...manifest,{path:'404.html'}]){
 if(!file.endsWith('.html'))continue;
 const clean=file==='index.html'?'/':file.endsWith('/index.html')?'/'+file.slice(0,-10):'/'+file.slice(0,-5);
 const cache=['openhoops/reset.html','openhoops/confirm.html'].includes(file)?'no-store, no-transform':'public, max-age=0, must-revalidate, no-transform';
 for(const route of ['/'+file,clean])htmlRoutes.set(route,cache);
}
if(htmlRoutes.size+1>100)throw new Error('Generated header rules exceed the Pages limit.');
const headers='/*\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n\n'+[...htmlRoutes].map(([route,cache])=>route+'\n  Cache-Control: '+cache+'\n').join('\n');
fs.writeFileSync(path.join(target,'_headers'),headers);
// The marker protects local cleanups, but it is not a public website asset.
fs.writeFileSync(path.join(target,'.assetsignore'),'.timbuilds-export\n');
fs.mkdirSync(path.join(root,'.qa'),{recursive:true});
fs.writeFileSync(path.join(root,'.qa','cloudflare-export-manifest.json'),JSON.stringify({sourceCommit:process.env.CF_PAGES_COMMIT_SHA||process.env.GITHUB_SHA||null,files:manifest},null,2)+'\n');
console.log(JSON.stringify({files:files.length,bytes:manifest.reduce((n,f)=>n+f.bytes,0),output:'dist',excluded:['CNAME','.git','.qa','tools','owner recovery files'],deployed:false},null,2));
