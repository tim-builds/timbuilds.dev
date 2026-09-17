/* Run locally only. The owner file MUST live outside every published checkout. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {randomBytes,createCipheriv} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ownerFile=path.resolve(process.env.TIMBUILDS_OWNER_FILE||path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'.local','share'),'timbuilds-owner','catalogue.json'));
assert.ok(!ownerFile.startsWith(root+path.sep),'Never keep the owner key in the repository.');
const owner=JSON.parse(fs.readFileSync(ownerFile,'utf8'));
const key=Buffer.from(owner.key,'base64url');assert.equal(key.length,32);assert.ok(Array.isArray(owner.projects)&&owner.projects.length>0);
const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from('timbuilds.locked.v1'));
const ciphertext=Buffer.concat([cipher.update(JSON.stringify(owner.projects),'utf8'),cipher.final(),cipher.getAuthTag()]);key.fill(0);
fs.writeFileSync(path.join(root,'portfolio','locked.json'),JSON.stringify({v:1,iv:iv.toString('base64'),ciphertext:ciphertext.toString('base64')})+'\n');
console.log(`Sealed ${owner.projects.length} catalogue entries. No key or plaintext was written into the repository.`);
