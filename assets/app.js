/* Utilidades básicas, seguras e reutilizáveis (sem dependências externas) */
(function(){
  "use strict";
  const yearEl = document.getElementById('ano'); if(yearEl) yearEl.textContent = new Date().getFullYear();

  // WhatsApp helper seguro
  function waLink(number, text){
    return `https://wa.me/${number}?text=${encodeURIComponent(text||'')}`;
  }
  // GPS leve (para pages/taxi.html)
  let watchId=null, best=null;
  const btnGPS = document.getElementById('btnGPS');
  const btnGPSStop = document.getElementById('btnGPSStop');
  const coordsEl = document.getElementById('coords');
  if(btnGPS){
    btnGPS.addEventListener('click', ()=>{
      if(!('geolocation' in navigator)) return alert('GPS não suportado.');
      best=null;
      watchId = navigator.geolocation.watchPosition(
        pos=>{
          const {latitude:lat, longitude:lng, accuracy:acc} = pos.coords;
          if(!best || acc<best.acc){ best = {lat:round(lat), lng:round(lng), acc}; if(coordsEl) coordsEl.value = `${best.lat}, ${best.lng} (±${Math.round(acc)}m)`; }
          if(acc<=20) stopGPS();
        },
        err=>{ alert('GPS: '+err.message); stopGPS(); },
        {enableHighAccuracy:true, maximumAge:0, timeout:60000}
      );
      setTimeout(stopGPS, 60000);
    });
  }
  if(btnGPSStop){ btnGPSStop.addEventListener('click', stopGPS); }
  function stopGPS(){ if(watchId!=null){ try{navigator.geolocation.clearWatch(watchId);}catch{} watchId=null; } }
  function round(n){ return Math.round(n*1e6)/1e6; }

  // Delivery → gera WhatsApp
  const formDelivery = document.getElementById('formDelivery');
  if(formDelivery){
    formDelivery.addEventListener('submit', (e)=>{
      e.preventDefault();
      const produto = document.getElementById('produto').value.trim();
      const qtd = parseInt(document.getElementById('quantidade').value||'1',10);
      const ass = document.getElementById('assinatura').value;
      if(!produto) return alert('Informe o produto.');
      const msg = `Olá! Quero fazer um pedido via Delivery:\n• Produto: ${produto} x${qtd} ${ass!=='nao'?`(Assinatura ${ass} dias)`:''}\nObrigado(a)!`;
      window.open(waLink('5531982339672', msg),'_blank','noopener,noreferrer');
    });
  }

  // Táxi → gera WhatsApp
  const formTaxi = document.getElementById('formTaxi');
  if(formTaxi){
    formTaxi.addEventListener('submit', (e)=>{
      e.preventDefault();
      const km = parseFloat(document.getElementById('taxiKm').value)||0;
      if(km<=0) return alert('Informe a distância estimada.');
      const msg = `Olá! Gostaria de solicitar Táxi Dog:\n• Distância estimada: ${km} km\n• Coord.: ${(coordsEl&&coordsEl.value)||'—'}\nObrigado(a)!`;
      window.open(waLink('5531982339672', msg),'_blank','noopener,noreferrer');
    });
  }
})();
    