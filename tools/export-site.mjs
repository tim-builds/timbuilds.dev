/* Portable static export. No hosting, DNS or account changes; no private owner file is read. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const roots=['index.html','.nojekyll','portfolio','openhoops','.well-known','legacy-stubs'];
const files=[];
function collect(relative){const absolute=path.join(root,relative),stat=fs.lstatSync(absolute);if(stat.isSymbolicLink())throw new Error('Refusing symbolic link: '+relative);if(stat.isDirectory()){for(const name of fs.readdirSync(absolute))collect(path.join(relative,name));}else if(stat.isFile())files.push({path:relative,bytes:stat.size});}
for(const item of roots)collect(item);
const bytes=files.reduce((n,f)=>n+f.bytes,0),largest=files.reduce((a,b)=>a.bytes>b.bytes?a:b);
console.log(JSON.stringify({files:files.length,totalBytes:bytes,totalMiB:Number((bytes/1048576).toFixed(2)),largest:{path:largest.path,bytes:largest.bytes,MiB:Number((largest.bytes/1048576).toFixed(2))}},null,2));
if(!process.argv.includes('--check')){
 const destination=path.join(root,'.qa','portable-site-'+new Date().toISOString().replace(/[:.]/g,'-'));
 fs.mkdirSync(destination,{recursive:true});
 for(const file of files){const target=path.join(destination,file.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,file.path),target);}
 console.log('Portable site copied to '+destination);
 console.log('Not uploaded. CNAME, Git history, tools, QA profiles and private owner recovery files are excluded.');
}
