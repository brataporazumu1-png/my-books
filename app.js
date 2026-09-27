const KEY="bookNotesPwaV1";
const $=id=>document.getElementById(id);
const state=(()=>{try{const x=JSON.parse(localStorage.getItem(KEY));return {items:Array.isArray(x?.items)?x.items:[]}}catch{return {items:[]}}})();
let tab="books", currentId=null, editingId=null;

function save(){localStorage.setItem(KEY,JSON.stringify(state));render();}
function id(){return crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random();}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function typeName(t){return t==="audio"?"Аудиокнига":"Книга";}
function render(){
 const items=state.items.filter(x=>x.type===tab).sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
 $("cards").innerHTML=items.map(x=>`<button class="card" data-id="${esc(x.id)}"><div class="eyebrow">${typeName(x.type)}</div><h2>${esc(x.title)}</h2><div class="author">${esc(x.author)}</div><p class="preview">${esc(x.notes)}</p></button>`).join("");
 $("empty").classList.toggle("hidden",items.length>0);
 $("emptyTitle").textContent=tab==="audio"?"Аудиокниг пока нет":"Книг пока нет";
}
function switchTab(t){tab=t;currentId=null;$("detailView").classList.add("hidden");$("listView").classList.remove("hidden");document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));render();}
function openDetail(i){const x=state.items.find(x=>x.id===i);if(!x)return;currentId=i;$("detailType").textContent=typeName(x.type);$("detailTitle").textContent=x.title;$("detailAuthor").textContent=x.author;$("detailNotes").textContent=x.notes;$("listView").classList.add("hidden");$("detailView").classList.remove("hidden");scrollTo(0,0);}
function openEditor(i=null){editingId=i;const x=i?state.items.find(x=>x.id===i):null;$("editorType").textContent=typeName(x?.type||tab);$("editorHeading").textContent=x?"Редактировать":"Добавить";$("titleInput").value=x?.title||"";$("authorInput").value=x?.author||"";$("notesInput").value=x?.notes||"";$("editor").classList.remove("hidden");}
function closeEditor(){$("editor").classList.add("hidden");editingId=null;}
function toast(t){$("toast").textContent=t;$("toast").classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.add("hidden"),1600);}
$("editorForm").addEventListener("submit",e=>{e.preventDefault();const title=$("titleInput").value.trim(),author=$("authorInput").value.trim(),notes=$("notesInput").value.trim();if(!title||!author||!notes)return;
 if(editingId){const x=state.items.find(x=>x.id===editingId);if(x){x.title=title;x.author=author;x.notes=notes;x.updatedAt=new Date().toISOString();}}
 else state.items.push({id:id(),type:tab,title,author,notes,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
 save();closeEditor();toast("Сохранено");if(currentId)openDetail(currentId);
});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
$("cards").addEventListener("click",e=>{const c=e.target.closest("[data-id]");if(c)openDetail(c.dataset.id);});
$("addBtn").addEventListener("click",()=>openEditor());
$("backBtn").addEventListener("click",()=>{$("detailView").classList.add("hidden");$("listView").classList.remove("hidden");currentId=null;});
$("editBtn").addEventListener("click",()=>currentId&&openEditor(currentId));
$("deleteBtn").addEventListener("click",()=>{const x=state.items.find(x=>x.id===currentId);if(!x||!confirm(`Удалить «${x.title}»?`))return;state.items=state.items.filter(x=>x.id!==currentId);currentId=null;save();$("detailView").classList.add("hidden");$("listView").classList.remove("hidden");toast("Удалено");});
$("closeEditor").addEventListener("click",closeEditor);
$("menuBtn").addEventListener("click",()=>$("backup").classList.remove("hidden"));
$("closeBackup").addEventListener("click",()=>$("backup").classList.add("hidden"));
$("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify({app:"Book Notes",version:1,exportedAt:new Date().toISOString(),items:state.items},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`book-notes-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);});
$("importInput").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;try{const p=JSON.parse(await f.text());const items=Array.isArray(p)?p:p.items;if(!Array.isArray(items))throw 0;state.items=items.filter(x=>x&&["books","audio"].includes(x.type)&&x.title&&x.author&&x.notes);save();toast("Импортировано");}catch{alert("Не удалось импортировать JSON.")}finally{e.target.value="";}});
[$("editor"),$("backup")].forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.add("hidden")}));
render();
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));