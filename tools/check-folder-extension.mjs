import assert from 'node:assert/strict';
export async function checkFolderExtension({evaluate,click,navigate,origin,pass}){
 await navigate(origin);await evaluate('window.TimApps.open("games");true');
 assert.deepEqual(await evaluate('[...document.querySelectorAll("#window-games [data-entry]")].map(b=>b.dataset.entry)'),['pinball','solitaire','minesweeper','reversi','minigolf'],'public Games retains only public games');
 const add=options=>evaluate('window.TimExplorer.registerFolder('+JSON.stringify(options)+')');
 const folder={id:'qa-extra-games',label:'Extra games',parent:'games',entries:['notepad','calculator']};
 for(const bad of [{...folder,id:'games'},{...folder,parent:'missing'},{...folder,label:'../invalid'},{...folder,entries:['missing-app']}])assert.equal(await add(bad),false);
 assert.equal(await add(folder),true);assert.equal(await add(folder),false,'duplicate registration rejected');
 assert.equal(await evaluate('document.querySelectorAll("#window-games [data-entry=qa-extra-games]").length'),1,'already open Games refreshes');
 await click('#window-games [data-entry=qa-extra-games]');
 const address=()=>evaluate('document.querySelector("#window-games .explorer-path").value');
 assert.equal(await address(),'C:\\Games\\Extra games');assert.equal(await evaluate('window.TimExplorer.resolve("C:\\\\Games\\\\Extra games")'),'qa-extra-games');
 assert.deepEqual(await evaluate('[...document.querySelectorAll("#window-games [data-entry]")].map(b=>b.dataset.entry)'),['notepad','calculator']);
 await click('#window-games [data-nav=up]');assert.equal(await address(),'C:\\Games');
 await click('#window-games [data-nav=back]');assert.equal(await address(),'C:\\Games\\Extra games');
 await click('#window-games [data-nav=forward]');assert.equal(await address(),'C:\\Games');
 await click('#window-games [data-entry=qa-extra-games]');await click('#window-games [data-entry=notepad]');assert.equal(await evaluate('window.TimWindows.active()'),'notepad');assert.equal(await address(),'C:\\Games\\Extra games','launch preserves folder address');
 await navigate(origin);await evaluate('window.TimApps.open("games");true');assert.equal(await evaluate('document.querySelectorAll("#window-games [data-entry]").length'),5,'runtime-only folders are not persisted or published');
 await evaluate('window.TimWindows.close("games");true');
 pass('Validated runtime-only nested folders, live refresh, paths, Up/Back/Forward, app launch and no persistent changes to public Games');
}
