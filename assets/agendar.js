/* Wizard de Agendamento (multi-pet) — focado em UX e segurança */
(function(){
  "use strict";
  const root = document.getElementById('wizard'); if(!root) return;

  // CONFIG (EDIT ZONE)
  const WHATS = "5531982339672";
  const PRECOS = {
    base:{ banho:{P:45,M:60,G:80,GG:100}, banho_tosa:{P:90,M:110,G:130,GG:160} },
    extras:{ hidratacao:20, perfume:10, laco:5, ouvidos:10, dental:15, tosa_higienica:25 },
    descontos:{ multipet:0.05 } // 5% sobre soma dos bases (2+ pets)
  };

  // STATE
  let pets = []; // {id,nome,porte,servico,extras:Set}
  let autoId = 1;
  let dataHora = "";
  let nomeTutor = "";

  render();

  function render(){
    root.innerHTML = "";
    // Cabeçalho do wizard
    const head = el('div', {class:'wrow'}, [
      el('div', {style:'flex:1'}, [el('label',{},['Seu nome']), input(nomeTutor, v=>{nomeTutor=v;})]),
      el('div', {style:'flex:1'}, [el('label',{},['Data e horário desejados']), dateTime(dataHora, v=>{dataHora=v;})]),
    ]);

    const list = el('div',{}, pets.length? pets.map((p,i)=> petCard(p,i)) : [emptyState()]);

    const actions = el('div', {class:'wizard-actions'}, [
      btn('➕ Adicionar pet','btn', ()=> addPet()),
      btn('💬 Enviar no WhatsApp','btn btn-primary', enviarWhatsApp)
    ]);

    root.appendChild(head);
    root.appendChild(list);
    root.appendChild(actions);

    if(pets.length===0) addPet(); // garante 1
  }

  function emptyState(){
    const d = el('div',{class:'subcard'},[
      el('strong',{},['Comece adicionando seu primeiro pet']),
      el('p',{class:'small'},['Você poderá escolher serviço e extras por pet.'])
    ]);
    return d;
  }

  function petCard(pet, idx){
    const wrap = el('div',{class:'subcard'});
    const title = el('div',{class:'wrow'},[
      el('strong',{},[`Pet ${idx+1}`]),
      btn('Remover','btn btn-danger', ()=>{
        if(pets.length<=1){ alert('Mantenha ao menos 1 pet.'); return; }
        if(confirm('Remover este pet?')){ pets = pets.filter(x=>x.id!==pet.id); render(); }
      })
    ]);

    const row1 = el('div',{class:'wrow'},[
      labeled('Nome do pet', input(pet.nome, v=>{pet.nome=v;})),
      labeled('Porte', select(['P','M','G','GG'], pet.porte, v=>{pet.porte=v;})),
      labeled('Serviço', select([{v:'banho',t:'Banho'},{v:'banho_tosa',t:'Banho + Tosa'}], pet.servico, v=>{pet.servico=v;}))
    ]);

    const pills = [
      ['hidratacao','Hidratação'],['perfume','Perfume'],['laco','Laço'],
      ['ouvidos','Ouvidos'],['dental','Dental'],['tosa_higienica','Tosa hig.']
    ];
    const extras = el('div',{class:'wrow'},[
      el('label',{},['Extras (opcional)']),
      el('div',{class:'row'}, pills.map(([k,t])=>{
        const b = btn(t, 'btn', ()=>{
          if(pet.extras.has(k)){ pet.extras.delete(k); b.classList.remove('btn-primary'); }
          else { pet.extras.add(k); b.classList.add('btn-primary'); }
        });
        if(pet.extras.has(k)) b.classList.add('btn-primary');
        return b;
      }))
    ]);

    wrap.appendChild(title);
    wrap.appendChild(row1);
    wrap.appendChild(extras);
    return wrap;
  }

  function addPet(){
    pets.push({id:autoId++, nome:"", porte:"P", servico:"banho", extras:new Set()});
    render();
  }

  function enviarWhatsApp(){
    if(!nomeTutor.trim()){ alert('Informe seu nome.'); return; }
    if(pets.some(p=>!p.nome.trim())){ alert('Informe o nome de todos os pets.'); return; }
    const val = compute();
    const linhas = pets.map((p,i)=>{
      const e = Array.from(p.extras||[]);
      const extrasTotal = val.porPet[i].extrasDoPet;
      return `• Pet ${i+1}: ${p.nome} — ${p.servico==='banho'?'Banho':'Banho + Tosa'} — Porte: ${p.porte}${e.length?`\n  ↳ Extras: ${e.join(', ')} (R$ ${money(extrasTotal)})`:''}`;
    });
    const msg = `Olá! Sou ${nomeTutor} e gostaria de agendar:
${linhas.join('\n')}
${dataHora?`• Quando: ${fmtDataHora(dataHora)}\n`:''}
Estimativa total: R$ ${money(val.total)}${val.descMultipet>0?` (inclui desconto multi-pet de R$ ${money(val.descMultipet)})`:''}
Obrigado(a)!`;
    const url = `https://wa.me/${WHATS}?text=${encodeURIComponent(msg)}`;
    window.open(url,'_blank','noopener,noreferrer');
  }

  function compute(){
    let baseSum=0, extrasSum=0;
    const porPet = pets.map(p=>{
      const base = (PRECOS.base[p.servico]||{})[p.porte]||0;
      let extras=0; Array.from(p.extras||[]).forEach(k=> extras += (PRECOS.extras[k]||0));
      const hasVIP = ['hidratacao','perfume','laco'].every(k=> (p.extras||new Set()).has(k));
      const descVIP = hasVIP? extras*0.10 : 0;
      const extrasDoPet = extras - descVIP;
      baseSum += base; extrasSum += extrasDoPet;
      return {base, extrasDoPet};
    });
    let descMultipet=0;
    if(pets.length>=2) descMultipet = baseSum * (PRECOS.descontos.multipet||0);
    const total = Math.max(0, baseSum + extrasSum - descMultipet);
    return {porPet, baseSum, extrasSum, descMultipet, total};
  }

  // Helpers UI
  function el(tag, attrs={}, children=[]){
    const d = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=> d.setAttribute(k,v));
    (Array.isArray(children)?children:[children]).forEach(ch=>{
      if(ch==null) return;
      if(typeof ch==='string') d.appendChild(document.createTextNode(ch));
      else d.appendChild(ch);
    });
    return d;
  }
  function labeled(text, field){ const w=el('div',{},[]); const l=el('label',{},[text]); w.appendChild(l); w.appendChild(field); return w; }
  function input(val, oninput){ const i=el('input'); i.value=val||''; i.addEventListener('input',()=>oninput(i.value)); return i; }
  function dateTime(val, oninput){ const i=el('input'); i.type='datetime-local'; i.value=val||''; i.addEventListener('input',()=>oninput(i.value)); return i; }
  function select(options, val, onchange){
    const s=el('select');
    options.forEach(opt=>{
      const o=el('option'); if(typeof opt==='string'){ o.value=opt;o.textContent=opt; } else { o.value=opt.v; o.textContent=opt.t; }
      if(o.value===val) o.selected=true; s.appendChild(o);
    });
    s.addEventListener('change',()=>onchange(s.value));
    return s;
  }
  function btn(text, cls, onclick){ const b=el('button',{type:'button',class:cls},[text]); b.addEventListener('click',onclick); return b; }

  // Helpers utilitários
  function money(n){ return (Number(n)||0).toFixed(2).replace('.',','); }
  function fmtDataHora(v){
    if(!v) return '';
    try{ const dt=new Date(v), p=n=>String(n).padStart(2,'0'); return `${p(dt.getDate())}/${p(dt.getMonth()+1)}/${dt.getFullYear()} às ${p(dt.getHours())}:${p(dt.getMinutes())}`; }
    catch{ return v; }
  }
})();
    