export let stateRef, wiz;
const dailyQuotes = [
  "Małe kroki prowadzą do wielkich zmian",
  "Koncentruj się na procesie, nie na wyniku",
  "Jeden mały postęp dziennie to 365 sukcesów rocznie",
  "Prostota jest kluczem do spokoju umysłu",
  "Zamiast perfekcji, wybierz postęp",
  "Każdy dzień to nowa szansa",
  "Twórz rutyny, nie wymówki",
  "Zaczynaj od najprostszej rzeczy",
  "Celebruj małe zwycięstwa",
  "Porządek w przestrzeni to porządek w głowie"
];

const defaultIdeas = {
  obiad: [
    "Zrób kolorowy buddha bowl z komosą ryżową",
    "Przygotuj zapiekaną lazanię warzywną",
    "Zrób szybkie curry z warzywami",
    "Upiecz rybę z warzywami w papilotach",
    "Przygotuj makaron z sosem pomidorowym",
    "Zrób sałatkę z grillowanym kurczakiem",
    "Upiecz warzywa na blasze",
    "Przygotuj zupę krem z dyni",
    "Zrób domowe burgery",
    "Przygotuj risotto z grzybami"
  ],
  sprzątanie: [
    "Posprzątaj jedną szufladę",
    "Zrób porządek w szafie z butami",
    "Wyczyść jeden regał w lodówce",
    "Uporządkuj dokumenty na biurku",
    "Umyj wszystkie lustra w domu",
    "Pościel łóżko i zmień pościel",
    "Odkurz pod meblami",
    "Zrób porządek w kosmetykach",
    "Wyczyść klawiaturę i ekrany",
    "Uporządkuj jedną półkę w szafie"
  ],
  rozwój: [
    "Przeczytaj jeden rozdział książki",
    "Zapisz się na kurs online",
    "Naucz się nowego słówka w obcym języku",
    "Poćwicz medytację przez 5 minut",
    "Napisz plan na następny miesiąc",
    "Obejrzyj wykład TED",
    "Przećwicz nową umiejętność",
    "Zrób research konkurencji",
    "Zaktualizuj swoje CV",
    "Naucz się nowego skrótu klawiszowego"
  ],
  inspiracje: [
    "Zrób mapę marzeń",
    "Zapisz 3 rzeczy, za które jesteś wdzięczny",
    "Narysuj coś prostego",
    "Zrób zdjęcie czegoś pięknego",
    "Posłuchaj nowego gatunku muzyki",
    "Zaplanuj weekend poza miastem",
    "Napisz list do przyszłego siebie",
    "Stwórz playlistę motywacyjną",
    "Znajdź inspirujący cytat na dziś",
    "Zrób moodboard do projektu"
  ],
  przerwy: [
    "Zrób 5-minutowy stretching",
    "Wyjdź na krótki spacer",
    "Wypij szklankę wody",
    "Zrób ćwiczenia oddechowe",
    "Posiedź w ciszy przez 2 minuty",
    "Zrób sobie herbatę",
    "Popatrz przez okno na zieleń",
    "Zrób krótką drzemkę",
    "Przewietrz pokój",
    "Zrób kilka prostych ćwiczeń"
  ]
};
export function init(state, W){ stateRef = state; wiz = W; document.getElementById('btnQuickIdea').addEventListener('click', quickIdea); document.getElementById('btnAddIdea').addEventListener('click', openAddIdeaModal); document.getElementById('btnManageIdeas').addEventListener('click', openManageIdeasModal); renderAll(); }
function quickIdea(){ 
  // Wybierz losową kategorię
  const categories = Object.keys(defaultIdeas);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // Wybierz losowy pomysł z kategorii
  const ideas = defaultIdeas[randomCategory];
  const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
  
  // Wybierz myśl dnia
  const quote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];
  
  // Utwórz nowy pomysł
  const item = { 
    id: Date.now().toString(), 
    title: randomIdea,
    category: randomCategory,
    note: `Myśl dnia: ${quote}`,
    date: new Date().toISOString()
  }; 
  
  stateRef.ideas.push(item); 
  wiz.registerChange(); 
  renderAll(); 
  
  // Pokaż powiadomienie
  const modal = document.querySelector('body').__openModal || window.openModal;
  if (modal) {
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h4 style="color: var(--accent6); margin-bottom: 16px;">✨ Myśl dnia</h4>
        <p style="font-size: 1.2em; margin-bottom: 24px;">${quote}</p>
        <h4 style="color: var(--accent4); margin-bottom: 16px;">🎯 Twój dzisiejszy pomysł</h4>
        <p style="font-size: 1.1em; margin-bottom: 8px;">${randomIdea}</p>
        <small style="color: var(--text-muted)">Kategoria: ${randomCategory}</small>
      </div>
    `;
    modal('Inspiracja na dziś', content);
  }
}
function openAddIdeaModal(){ const form = document.createElement('form'); form.innerHTML = `<label>Pomysł<br><input name="title" required></label><br><label>Notatka<br><input name="note"></label><br><div style="display:flex;gap:8px;margin-top:8px"><button class="btn" type="submit">Zapisz 💾</button><button type="button" id="cancel" class="btn">Anuluj</button></div>`; form.addEventListener('submit',(e)=>{ e.preventDefault(); const fd=new FormData(form); stateRef.ideas.push({ id: Date.now().toString(), title: fd.get('title'), note: fd.get('note') }); wiz.registerChange(); renderAll(); document.getElementById('modal').classList.add('hidden'); }); form.querySelector('#cancel').addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden')); const openModal = document.querySelector('body').__openModal || window.openModal; if (openModal) openModal('Dodaj pomysł', form); }
function openManageIdeasModal(){ 
  const div=document.createElement('div'); 
  const list=document.createElement('div'); 
  list.style.display='flex'; 
  list.style.flexDirection='column'; 
  list.style.gap='8px'; 
  
  // Zbierz wszystkie pomysły ze wszystkich kategorii
  const allIdeas = Object.values(defaultIdeas).flat();
  const combined = Array.from(new Set([...(stateRef.ideas||[]).map(i=>i.title), ...allIdeas])); combined.forEach((t,idx)=>{ const row=document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='center'; const input=document.createElement('input'); input.value=t; input.style.flex='1'; const del=document.createElement('button'); del.className='btn'; del.textContent='Usuń'; del.addEventListener('click', ()=> { if(confirm('Usuń ten pomysł?')){ row.remove(); } }); row.appendChild(input); row.appendChild(del); list.appendChild(row); }); const saveBtn=document.createElement('button'); saveBtn.className='btn'; saveBtn.textContent='Zapisz bazę'; saveBtn.addEventListener('click', ()=>{ const values = Array.from(list.querySelectorAll('input')).map(i=>i.value).filter(Boolean); stateRef.ideas = values.map(v=>({ id: Date.now().toString() + Math.random().toString(36).slice(2,6), title: v, note:'' })); wiz.registerChange(); document.getElementById('modal').classList.add('hidden'); }); div.appendChild(list); div.appendChild(saveBtn); const openModal = document.querySelector('body').__openModal || window.openModal; if (openModal) openModal('Edytuj bazę pomysłów', div); }
export function renderAll() {
  const container = document.getElementById('ideasList');
  container.innerHTML = '';
  
  // Grupuj pomysły po dacie
  const groupedIdeas = {};
  (stateRef.ideas || []).forEach(i => {
    const date = i.date ? new Date(i.date).toLocaleDateString() : 'Bez daty';
    if (!groupedIdeas[date]) {
      groupedIdeas[date] = [];
    }
    groupedIdeas[date].push(i);
  });

  // Renderuj pomysły pogrupowane po datach
  Object.entries(groupedIdeas).reverse().forEach(([date, ideas]) => {
    const dateHeader = document.createElement('div');
    dateHeader.className = 'date-header';
    dateHeader.innerHTML = `<h3>${date}</h3>`;
    container.appendChild(dateHeader);

    ideas.forEach(i => {
      const el = document.createElement('div');
      el.className = 'idea';
      el.draggable = true;
      el.dataset.id = i.id;
      
      const categoryIcon = {
        obiad: '🍽️',
        sprzątanie: '🧹',
        rozwój: '📚',
        inspiracje: '💫',
        przerwy: '⏰'
      }[i.category] || '💡';

      el.innerHTML = `
        <div>
          <div class="idea-title">
            <span class="category-icon">${categoryIcon}</span>
            ${escapeHtml(i.title)}
          </div>
          ${i.note ? `<div class="idea-note">${escapeHtml(i.note)}</div>` : ''}
        </div>
        <div>
          <button class="btn small">⋯</button>
        </div>
      `;

      // Event listeners
      el.querySelector('.btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering parent's click event
        const newT = prompt('Edytuj pomysł:', i.title);
        if (newT === null) return;
        i.title = newT;
        
        if (confirm('Usunąć pomysł?')) {
          stateRef.ideas = stateRef.ideas.filter(x => x.id !== i.id);
        }
        
        wiz.registerChange();
        renderAll();
      });

      el.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/wiz-idea', JSON.stringify(i));
        el.classList.add('dragging');
      });

      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
      });

      container.appendChild(el);
    });
  });
}
function escapeHtml(s) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };
  return String(s).replace(/[&<>"]/g, char => htmlEscapes[char]);
}
