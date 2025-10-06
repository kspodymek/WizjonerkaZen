
import * as Tasks from './components/tasks.js';
import * as Payments from './components/payments.js';
import * as Health from './components/health.js';
import * as Ideas from './components/ideas.js';
import * as Growth from './components/growth.js';

const STORAGE_KEY = 'wizjonerka_v3';
const DEFAULT_STATE = { tasks:[], payments:[], health:[], ideas:[], growth:[], meta:{lastSaved:null, notifications:false, theme:'light'} };
let state = loadState();

window.Wiz = { state, save, exportJSON, importJSON, registerChange };

// theme
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
function applyTheme(t){ if(t==='dark'){ body.classList.add('dark'); themeToggle.textContent='☀️'; } else { body.classList.remove('dark'); themeToggle.textContent='🌙'; } }
applyTheme(state.meta.theme || 'light');
themeToggle.addEventListener('click', ()=>{ state.meta.theme = body.classList.contains('dark') ? 'light' : 'dark'; applyTheme(state.meta.theme); save(); });

// pages nav
const pages = document.querySelectorAll('.page');
document.querySelectorAll('.nav-btn').forEach(btn=> btn.addEventListener('click', ()=>{
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  pages.forEach(p=> p.id === btn.dataset.target ? p.classList.add('active') : p.classList.remove('active'));
}));

// modal helpers
const modal = document.getElementById('modal'), modalBody=document.getElementById('modalBody'), modalTitle=document.getElementById('modalTitle');
document.getElementById('closeModal').addEventListener('click', ()=> modal.classList.add('hidden'));
function openModal(title, el){ modalTitle.textContent = title; modalBody.innerHTML=''; if(typeof el==='string') modalBody.innerHTML = el; else modalBody.appendChild(el); modal.classList.remove('hidden'); }
document.querySelector('body').__openModal = openModal;

// load/save
function loadState(){ const raw = localStorage.getItem(STORAGE_KEY); if(raw) try{ return JSON.parse(raw);}catch(e){console.error(e);} return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
function save(){ state.meta.lastSaved = new Date().toISOString(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); if(window.BroadcastChannel){ try{ const bc=new BroadcastChannel('wizjonerka_sync'); bc.postMessage({type:'sync'}); bc.close(); }catch(e){} } }
function registerChange(){ save(); renderStart(); generateQR(); }
window.Wiz.registerChange = registerChange;

// export/import
function exportJSON(){ const data = JSON.stringify(state); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='wizjonerka_backup.json'; a.click(); URL.revokeObjectURL(url); }
function importJSON(text){ try{ const obj = JSON.parse(text); state = Object.assign({}, DEFAULT_STATE, obj); window.Wiz.state = state; save(); Tasks.renderAll(); Payments.renderAll(); Health.renderAll(); Ideas.renderAll(); Growth.renderAll(); renderStart(); alert('Import zakończony'); }catch(e){ alert('Błąd importu: '+e.message);} }

document.getElementById('btnExport').addEventListener('click', exportJSON);
document.getElementById('btnImport').addEventListener('click', ()=>{ const ta=document.createElement('textarea'); ta.style.width='100%'; ta.style.height='220px'; ta.placeholder='Wklej JSON'; const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Importuj'; btn.addEventListener('click', ()=>{ importJSON(ta.value); modal.classList.add('hidden'); }); const wrap=document.createElement('div'); wrap.appendChild(ta); wrap.appendChild(btn); openModal('Import danych', wrap); });

// QR
function generateQR(){ const wrap = document.getElementById('qrWrap'); wrap.innerHTML=''; try{ new QRCode(wrap, { text: JSON.stringify(state), width: 140, height:140 }); }catch(e){ wrap.textContent='QR unavailable'; } }
document.getElementById('btnSync').addEventListener('click', ()=>{ if(navigator.share){ try{ navigator.share({ title:'Wizjonerka backup', text: JSON.stringify(state) }); alert('Udostępniono'); }catch(e){} } else { generateQR(); alert('QR z danymi wygenerowany w stopce'); } });

// notifications
document.getElementById('btnNotifyToggle').addEventListener('click', ()=>{
  if(Notification && Notification.permission === 'granted'){ state.meta.notifications = false; save(); alert('Powiadomienia wyłączone'); }
  else Notification.requestPermission().then(p=>{ if(p==='granted'){ state.meta.notifications = true; save(); new Notification('Wizjonerka','Powiadomienia włączone'); } });
});

// render start
function renderStart(){ const startEl=document.getElementById('startList'); startEl.innerHTML=''; const list = [...state.tasks]; list.sort((a,b)=>{ if((a.priority||4)!=(b.priority||4)) return (a.priority||4)-(b.priority||4); const ta=a.due?new Date(a.due):new Date(8640000000000000); const tb=b.due?new Date(b.due):new Date(8640000000000000); return ta-tb; }); const pick = list.filter(t=>t.q===1).slice(0,3); if(pick.length===0) pick.push(...list.slice(0,3)); pick.forEach(t=>{ const li=document.createElement('li'); li.className='task'; li.innerHTML=`<div>${t.title||'(brak tytułu)'}</div><div class="badge ${badgeClass(t.priority)}">${badgeLabel(t.priority)}</div>`; startEl.appendChild(li); }); // payments
  const up=document.getElementById('upcomingPayments'); up.innerHTML=''; state.payments.sort((a,b)=> new Date(a.due||0)-new Date(b.due||0)).slice(0,5).forEach(p=>{ const li=document.createElement('li'); li.className='payment'; const days = daysUntil(p.due); const note = p.due ? (days>7 ? '🟢' : days>=1 ? '🟡' : '🔴') : ''; li.innerHTML=`<div>${p.name} • ${p.amount||''} zł</div><div>${p.due?new Date(p.due).toLocaleDateString():''} ${note}</div>`; up.appendChild(li); }); // today tasks
  const todayEl=document.getElementById('todayTasks'); todayEl.innerHTML=''; const today=new Date(); today.setHours(0,0,0,0); state.tasks.filter(t=>{ if(!t.due) return false; const d=new Date(t.due); d.setHours(0,0,0,0); return d.getTime()===today.getTime(); }).forEach(t=>{ const li=document.createElement('li'); li.className='task'; li.innerHTML=`<div>${t.title}</div><div class="badge ${badgeClass(t.priority)}">${badgeLabel(t.priority)}</div>`; todayEl.appendChild(li); });
}
function daysUntil(dateStr){ if(!dateStr) return Infinity; const d=new Date(dateStr); d.setHours(0,0,0,0); const now=new Date(); now.setHours(0,0,0,0); return Math.round((d-now)/(1000*60*60*24)); }
function badgeClass(p){ return p===1?'p-urgent':p===2?'p-important':p===3?'p-medium':'p-low'; }
function badgeLabel(p){ return p===1?'🔴':p===2?'🟠':p===3?'🟡':'⚪'; }

// init components
Tasks.init(state, window.Wiz);
Payments.init(state, window.Wiz);
Health.init(state, window.Wiz);
Ideas.init(state, window.Wiz);
Growth.init(state, window.Wiz);

renderStart();
generateQR();
