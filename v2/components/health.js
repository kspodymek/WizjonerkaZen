export let stateRef, wiz;
export function init(state, W){ stateRef = state; wiz = W; document.getElementById('addHealth').addEventListener('click', openAddHealthModal); renderAll(); }

function openAddHealthModal(){
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Typ (waga, ciśnienie, nastrój, sen)<br><input name="type" required></label><br>
    <label>Wartość<br><input name="value' required></label><br>
    <label>Notatka<br><input name="note"></label><br>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn" type="submit">Zapisz 💾</button><button type="button" id="cancel" class="btn">Anuluj</button></div>
  `;
  form.addEventListener('submit',(e)=>{ e.preventDefault(); const fd=new FormData(form); const entry = { id: Date.now().toString(), type: fd.get('type'), value: fd.get('value'), note: fd.get('note'), date: new Date().toISOString() }; stateRef.health.push(entry); wiz.registerChange(); renderAll(); document.getElementById('modal').classList.add('hidden'); });
  form.querySelector('#cancel').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));
  const openModal = document.querySelector('body').__openModal || window.openModal; if (openModal) openModal('Dodaj wpis zdrowotny', form);
}

export function renderAll(){ const container = document.getElementById('healthList'); container.innerHTML=''; stateRef.health.slice().reverse().forEach(h=>{ const el=document.createElement('div'); el.className='health-item'; el.innerHTML = `<div><strong>${escapeHtml(h.type)}</strong> • ${escapeHtml(h.value)}<div style="font-size:0.8rem;color:rgba(0,0,0,0.45)">${escapeHtml(h.note||'')}</div></div><div>${new Date(h.date).toLocaleString()}</div>`; el.addEventListener('click', ()=>{ if(confirm('Usunąć wpis?')){ stateRef.health = stateRef.health.filter(x=>x.id!==h.id); wiz.registerChange(); renderAll(); }}); container.appendChild(el); }); }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
