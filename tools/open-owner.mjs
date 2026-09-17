/* Local-only browser enrollment. Never print, commit or share the capability URL. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
const ownerFile=process.env.TIMBUILDS_OWNER_FILE||path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'.local','share'),'timbuilds-owner','catalogue.json');
const owner=JSON.parse(fs.readFileSync(ownerFile,'utf8'));
if(!/^[A-Za-z0-9_-]{43}$/.test(owner.key))throw new Error('Owner file is invalid.');
const origin=process.argv.includes('--legacy')?'https://tim-builds.dev/':'https://timbuilds.dev/';
const chrome=process.env.PORTFOLIO_CHROME||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'/usr/bin/google-chrome');
if(!fs.existsSync(chrome))throw new Error('Set PORTFOLIO_CHROME to an installed Chrome executable.');
const child=spawn(chrome,['--new-window',origin+'#owner-key='+owner.key],{detached:true,stdio:'ignore'});
child.once('error',()=>{console.error('Chrome could not be opened. No capability was printed.');process.exitCode=1;});
child.unref();
console.log('Owner setup opened in Chrome. The website will validate and save its private key, then remove it from the address bar.');
