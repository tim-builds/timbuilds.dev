import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function build() {
  const projects=JSON.parse(fs.readFileSync(path.join(root,'portfolio/projects.json'),'utf8'));
  const categories=[['All projects','folder'],['Apps','computer'],['Games','cards'],['Websites','globe'],['Tools','code'],['Experiments','music']];
  const filters=categories.map(([name,icon],i)=>`<button class="folder-button${i===0?' is-active':''}" data-category="${name}" aria-pressed="${i===0}"><svg aria-hidden="true"><use href="portfolio/icons.svg#${icon}"/></svg><span>${name}</span><span class="folder-count">${i===0?projects.length:projects.filter(p=>p.category===name).length}</span></button>`).join('\n');
  const cards=projects.map(p=>`<article class="project-card" data-id="${p.id}" data-category="${p.category}"><div class="card-preview"><img src="${escapeHTML(p.image||`portfolio/previews/${p.preview}.svg`)}" width="1200" height="700" alt="${escapeHTML(p.imageAlt||p.title)}" loading="lazy"><span class="preview-label">${escapeHTML(p.imageLabel||'Project illustration')}</span></div><div class="card-content"><div class="card-category">${escapeHTML(p.category)}<span class="file-extension">.project</span></div><h3><button data-project="${p.id}" aria-haspopup="dialog">${escapeHTML(p.title)}<span aria-hidden="true">↗</span></button></h3><p>${escapeHTML(p.summary)}</p><div class="card-footer"><span class="project-status${['Playable','Interactive demo','You are here'].includes(p.status)?' status-public':''}"><i aria-hidden="true"></i>${escapeHTML(p.status)}</span>${p.url?`<a href="${escapeHTML(p.url)}"${p.url.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${escapeHTML(p.cta)} <span aria-hidden="true">↗</span>${p.url.startsWith('https:')?'<span class="sr-only"> (opens in the desktop browser)</span>':''}</a>`:`<button data-project="${p.id}" aria-label="Details about ${escapeHTML(p.title)}">Details <span aria-hidden="true">↗</span></button>`}</div></div></article>`).join('\n');
  const data=JSON.stringify(projects).replace(/</g,'\\u003c');
  return fs.readFileSync(path.join(root,'portfolio/template.html'),'utf8').replace(/\r\n/g,'\n').replace('<!--FILTERS-->',filters+'<button class="folder-button locked-folder" data-action="locked" aria-pressed="false"><svg aria-hidden="true"><use href="portfolio/icons.svg#lock"/></svg><span>Locked</span><span class="folder-count" aria-hidden="true">▸</span></button>').replace('<!--PROJECT_CARDS-->',cards).replace('<!--PROJECT_DATA-->',data).replaceAll('{{COUNT}}',String(projects.length));
}
if (process.argv.includes('--check')) {
  if (build()!==fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n')) {console.error('index.html is stale. Run node tools/build-portfolio.mjs');process.exitCode=1;}
  else console.log('Generated portfolio is current.');
} else { fs.writeFileSync(path.join(root,'index.html'),build());console.log('Built index.html.'); }
