/* Wizard de agendamento (multi-pet) — minimal, seguro e extensível */
(function(){
  "use strict";
  const el = document.getElementById('wizard');
  if(!el){ return; }

  // State
  let pets=[]; // {id,nome,porte,servico,extras:Set}
  let autoId=1;

  // UI
  render();

  function render(){
    el.innerHTML = "";
    const card = document.createElement('div');
    card.className = "card";

    const list = document.createElement('div');
    pets.forEach((p,i)=> list.appendChild(petRow(p, i)));

    const actions = document.createElement('div'); actions.className="row";
    const addBtn = button("➕ Adicionar pet", "btn", ()=>{ addPet(); });
    const waBtn  = button("💬 Enviar no WhatsApp", "btn btn-primary", enviarWhatsApp);
    actions.appendChild(addBtn); actions.appendChild(waBtn);

    card.appendChild(list);
    card.appendChild(actions);
    el.appendChild(card);

    if(pets.length===0){ addPet(); }
  }
  function petRow(pet, idx){
    const wrap = document.createElement('div');
    wrap.className = "card"; // sub-card

    const title = document.createElement('div');
    title.style.display="flex"; title.style.justifyContent="space-between"; title.style.alignItems="center"; title.style.marginBottom=".5rem";
    const strong = document.createElement('strong'); strong.textContent = `Pet ${idx+1}`;
    const del = button("Remover", "btn btn-danger", ()=>{ if(confirm('Remover este pet?')){ pets = pets.filter(x=>x.id!==pet.id); render(); } });
    title.appendChild(strong); title.appendChild(del);

    const name = labeled("Nome do pet", input(pet.nome, v=>{pet.nome=v;}));
    const porte = labeled("Porte", select(["P","M","G","GG"], pet.porte, v=>{pet.porte=v;}));
    const serv  = labeled("Serviço", select([{v:"banho",t:"Banho"},{v:"banho_tosa",t:"Banho + Tosa"}], pet.servico, v=>{pet.servico=v;}));

    const row = document.createElement('div'); row.className="row";
    row.appendChild(name); row.appendChild(porte); row.appendChild(serv);

    wrap.appendChild(title);
    wrap.appendChild(row);
    return wrap;
  }
  function labeled(label, field){
    const d=document.createElement('div'); d.style.flex="1 1 240px";
    const l=document.createElement('label'); l.textContent=label; d.appendChild(l); d.appendChild(field); return d;
  }
  function input(val, oninput){
    const i=document.createElement('input'); i.value=val||''; i.addEventListener('input', ()=> oninput(i.value.trim())); return i;
  }
  function select(options, val, onchange){
    const s=document.createElement('select');
    (options||[]).forEach(opt=>{
      const o=document.createElement('option');
      if(typeof opt==='string'){ o.value=opt; o.textContent=opt; }
      else{ o.value=opt.v; o.textContent=opt.t; }
      if(o.value===val) o.selected=true;
      s.appendChild(o);
    });
    s.addEventListener('change', ()=> onchange(s.value));
    return s;
  }
  function button(text, cls, onclick){ const b=document.createElement('button'); b.type="button"; b.className=cls; b.textContent=text; b.addEventListener('click', onclick); return b; }
  function addPet(){ pets.push({id:autoId++, nome:"", porte:"P", servico:"banho"}); render(); }

  function enviarWhatsApp(){
    if(pets.some(p=>!p.nome)){ alert('Informe o nome de todos os pets.'); return; }
    const linhas = pets.map((p,i)=>`• Pet ${i+1}: ${p.nome} — ${p.servico==='banho'?'Banho':'Banho + Tosa'} — Porte: ${p.porte}`);
    const msg = `Olá! Quero agendar serviços para meus pets:\n${linhas.join('\n')}\nObrigado(a)!`;
    const url = `https://wa.me/5531982339672?text=${encodeURIComponent(msg)}`;
    window.open(url,'_blank','noopener,noreferrer');
  }
})();
    