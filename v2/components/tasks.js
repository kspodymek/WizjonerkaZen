export let stateRef, wiz;
export function init(state, W){
  stateRef = state; wiz = W;
  document.getElementById('addTask').addEventListener('click', openAddTaskModal);
  document.getElementById('filterTasks').addEventListener('change', renderAll);
  setupDragDrop();
  renderAll();
}

function openAddTaskModal(){
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Tytuł<br><input name="title" required></label><br>
    <label>Termin (YYYY-MM-DD)<br><input name="due" type="date"></label><br>
    <label>Kwadrant (1-4)<br><select name="q"><option>1</option><option>2</option><option>3</option><option selected>4</option></select></label><br>
    <label>Notatka<br><textarea name="note"></textarea></label><br>
    <div style="display:flex;gap:8px;margin-top:8px"><button type="submit" class="btn">Zapisz 💾</button><button type="button" id="cancel" class="btn">Anuluj</button></div>
  `;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const t = { id: Date.now().toString(), title: data.get('title'), due: data.get('due')||null, q: parseInt(data.get('q'),10), priority: parseInt(data.get('q'),10)===1?1:2, note: data.get('note')||'' };
    stateRef.tasks.push(t);
    wiz.registerChange();
    renderAll();
    document.getElementById('modal').classList.add('hidden');
  });
  form.querySelector('#cancel').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));
  const openModal = document.querySelector('body').__openModal || window.openModal;
  if (openModal) openModal('Dodaj zadanie', form);
}

export function renderAll(){
  for (let i=1;i<=4;i++) document.getElementById('q'+i).innerHTML = '';
  const filter = document.getElementById('filterTasks').value;
  stateRef.tasks.forEach(t=>{
    if (filter==='urgent' && t.q!==1) return;
    if (filter==='important' && !(t.q===1||t.q===2)) return;
    if (filter==='today' && (!t.due || new Date(t.due).toDateString() !== new Date().toDateString())) return;
    const el = document.getElementById('q'+(t.q||4));
    const node = createTaskNode(t);
    el.appendChild(node);
  });
}

function createTaskNode(t){
  const div = document.createElement('div'); div.className='task'; div.draggable=true; div.dataset.id=t.id;
  div.innerHTML = `<div><strong>${escapeHtml(t.title)}</strong>${t.due? ' • ' + new Date(t.due).toLocaleDateString():''}<div style="font-size:0.8rem;color:rgba(0,0,0,0.45)">${escapeHtml(t.note||'')}</div></div><div class="badge ${badgeClass(t.priority)}">${badgeLabel(t.priority)}</div>`;
  div.addEventListener('click', (e)=> { e.stopPropagation(); openEditTask(t); });
  div.addEventListener('dragstart', (ev)=> { ev.dataTransfer.setData('text/wiz-task', JSON.stringify(t)); div.classList.add('dragging'); });
  div.addEventListener('dragend', ()=> div.classList.remove('dragging'));
  return div;
}

function openEditTask(t){
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Tytuł<br><input name="title" required value="${escapeHtml(t.title)}"></label><br>
    <label>Termin (YYYY-MM-DD)<br><input name="due" type="date" value="${t.due||''}"></label><br>
    <label>Kwadrant (1-4)<br><select name="q"><option ${t.q===1?'selected':''}>1</option><option ${t.q===2?'selected':''}>2</option><option ${t.q===3?'selected':''}>3</option><option ${t.q===4?'selected':''}>4</option></select></label><br>
    <label>Notatka<br><textarea name="note">${escapeHtml(t.note||'')}</textarea></label><br>
    <label><input type="checkbox" name="done"> Oznacz jako zrobione</label><br>
    <div style="display:flex;gap:8px;margin-top:8px"><button type="submit" class="btn">Zapisz 💾</button><button type="button" id="del" class="btn">Usuń 🗑</button><button type="button" id="cancel" class="btn">Anuluj</button></div>
  `;
  form.addEventListener('submit',(e)=>{ e.preventDefault(); const data=new FormData(form); t.title=data.get('title'); t.due=data.get('due')||null; t.q=parseInt(data.get('q'),10); t.priority = t.q===1?1:t.q===2?2:3; t.note=data.get('note')||''; wiz.registerChange(); renderAll(); document.getElementById('modal').classList.add('hidden'); });
  form.querySelector('#del').addEventListener('click', ()=> { if(confirm('Usunąć zadanie?')){ stateRef.tasks = stateRef.tasks.filter(x=>x.id!==t.id); wiz.registerChange(); renderAll(); document.getElementById('modal').classList.add('hidden'); }});
  form.querySelector('#cancel').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));
  const openModal = document.querySelector('body').__openModal || window.openModal;
  if (openModal) openModal('Edytuj zadanie', form);
}

function setupDragDrop(){
  document.querySelectorAll('.quadrant').forEach(q=>{
    q.addEventListener('dragover', (e) => {
      e.preventDefault();
      q.classList.add('dragover');
    });
    
    q.addEventListener('dragleave', () => {
      q.classList.remove('dragover');
    });
    
    q.addEventListener('drop', (e) => {
      e.preventDefault();
      q.classList.remove('dragover');
      
      const raw = e.dataTransfer.getData('text/wiz-task') || 
                 e.dataTransfer.getData('text/wiz-idea') || 
                 e.dataTransfer.getData('text/wiz-payment');
                 
      if (!raw) return;
      
      try {
        const obj = JSON.parse(raw);
        if (obj && obj.id && obj.title) {
          const qnum = parseInt(q.dataset.q, 10) || 4;
          const task = stateRef.tasks.find(t => t.id === obj.id);
          
          if (task) {
            task.q = qnum;
            task.priority = qnum === 1 ? 1 : qnum === 2 ? 2 : 3;
          } else {
            const newTask = {
              id: Date.now().toString(),
              title: obj.title,
              due: obj.due || null,
              q: qnum,
              priority: qnum === 1 ? 1 : 2,
              note: obj.note || ''
            };
            stateRef.tasks.push(newTask);
            
            if (e.dataTransfer.getData('text/wiz-idea')) {
              stateRef.ideas = stateRef.ideas.filter(i => i.id !== obj.id);
            }
            if (e.dataTransfer.getData('text/wiz-payment')) {
              stateRef.payments = stateRef.payments.filter(p => p.id !== obj.id);
            }
          }
          
          wiz.registerChange();
          renderAll();
        }
      } catch (err) {
        console.warn('Błąd podczas przetwarzania przeciąganego elementu:', err);
      }
    });
  });
}
function badgeClass(p){ return p===1?'p-urgent':p===2?'p-important':p===3?'p-medium':'p-low'; }
function badgeLabel(p){ return p===1?'🔴':p===2?'🟠':p===3?'🟡':'⚪'; }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
