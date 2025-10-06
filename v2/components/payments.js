export let stateRef, wiz;
export function init(state, W){ stateRef = state; wiz = W; document.getElementById('addPayment').addEventListener('click', openAddPaymentModal); renderAll(); }

function openAddPaymentModal(){
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Nazwa / Dostawca<br><input name="name" required></label><br>
    <label>Kwota (PLN)<br><input name="amount" type="number" step="0.01"></label><br>
    <label>Termin<br><input name="due" type="date"></label><br>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn" type="submit">Zapisz 💾</button><button type="button" id="cancel" class="btn">Anuluj</button></div>
  `;
  form.addEventListener('submit',(e)=>{ e.preventDefault(); const fd=new FormData(form); const p={ id: Date.now().toString(), name: fd.get('name'), amount: fd.get('amount'), due: fd.get('due')||null, paid:false }; stateRef.payments.push(p); wiz.registerChange(); renderAll(); document.getElementById('modal').classList.add('hidden'); });
  form.querySelector('#cancel').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));
  const openModal = document.querySelector('body').__openModal || window.openModal; if (openModal) openModal('Dodaj płatność', form);
}

export function renderAll(){ const container = document.getElementById('paymentsList'); container.innerHTML=''; stateRef.payments.sort((a,b)=> new Date(a.due||0)-new Date(b.due||0)).forEach(p=>{ const el=document.createElement('div'); el.className='payment'; el.draggable=true; el.dataset.id=p.id; const days=daysUntil(p.due); const note=p.due ? (days>7?'🟢':days>=1?'🟡':'🔴') : ''; el.innerHTML=`<div><strong>${escapeHtml(p.name)}</strong>${p.amount? ' • ' + p.amount + ' zł':''}<div style="font-size:0.8rem;color:rgba(0,0,0,0.45)">${p.paid?'Zapłacono':''}</div></div><div>${p.due?new Date(p.due).toLocaleDateString():''} ${note}</div>`; el.addEventListener('click', ()=> editPayment(p)); el.addEventListener('dragstart',(ev)=>{ ev.dataTransfer.setData('text/wiz-payment', JSON.stringify(p)); el.classList.add('dragging'); }); el.addEventListener('dragend', ()=> el.classList.remove('dragging')); container.appendChild(el); }); }

function editPayment(p){
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Nazwa<br><input name="name" required value="${escapeHtml(p.name)}"></label><br>
    <label>Kwota<br><input name="amount" type="number" step="0.01" value="${p.amount||''}"></label><br>
    <label>Termin<br><input name="due" type="date" value="${p.due||''}"></label><br>
    <label><input type="checkbox" name="paid" ${p.paid?'checked':''}> Zapłacono</label><br>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn" type="submit">Zapisz 💾</button><button type="button" id="del" class="btn">Usuń 🗑</button><button type="button" id="cancel" class="btn">Anuluj</button></div>
  `;
  form.addEventListener('submit',(e)=>{ e.preventDefault(); const fd=new FormData(form); p.name=fd.get('name'); p.amount=fd.get('amount'); p.due=fd.get('due')||null; p.paid = !!fd.get('paid'); wiz.registerChange(); renderAll(); document.getElementById('modal').classList.add('hidden'); });
  form.querySelector('#del').addEventListener('click', ()=> { if(confirm('Usunąć płatność?')){ stateRef.payments = stateRef.payments.filter(x=>x.id!==p.id); wiz.registerChange(); renderAll(); document.getElementById('modal').classList.add('hidden'); }});
  form.querySelector('#cancel').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));
  const openModal = document.querySelector('body').__openModal || window.openModal; if (openModal) openModal('Edytuj płatność', form);
}

function daysUntil(dateStr){ if(!dateStr) return Infinity; const d=new Date(dateStr); d.setHours(0,0,0,0); const now=new Date(); now.setHours(0,0,0,0); return Math.round((d-now)/(1000*60*60*24)); }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
