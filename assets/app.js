/* App base — utilidades seguras e handlers de páginas genéricas */
(function(){
  "use strict";
  const year = document.getElementById('ano'); if(year) year.textContent = new Date().getFullYear();

  // WhatsApp helper (sempre use encodeURIComponent)
  function wa(number, text){ return `https://wa.me/${number}?text=${encodeURIComponent(text||'')}`; }

  // DELIVERY
  const formDelivery = document.getElementById('formDelivery');
  if(formDelivery){
    formDelivery.addEventListener('submit', (e)=>{
      e.preventDefault();
      const produto = document.getElementById('produto').value.trim();
      const quantidade = parseInt(document.getElementById('quantidade').value||'1',10);
      const assinatura = document.getElementById('assinatura').value;
      if(!produto){ alert('Informe o produto.'); return; }
      const msg = `Olá! Quero fazer um pedido via Delivery:
• Produto: ${produto} x${quantidade} ${assinatura!=='nao'?`(Assinatura ${assinatura} dias)`:''}
Obrigado(a)!`;
      window.open(wa('5531982339672', msg),'_blank','noopener,noreferrer');
    });
  }

  // TÁXI
  const formTaxi = document.getElementById('formTaxi');
  const btnGPS = document.getElementById('btnGPS');
  const btnGPSStop = document.getElementById('btnGPSStop');
  const coordsEl = document.getElementById('coords');
  let watchId=null, best=null;

  if(btnGPS){
    btnGPS.addEventListener('click', ()=>{
      if(!('geolocation' in navigator)){ alert('GPS não suportado.'); return; }
      best=null;
      watchId = navigator.geolocation.watchPosition(
        pos=>{
          const {latitude:lat, longitude:lng, accuracy:acc} = pos.coords;
          if(!best || acc<best.acc){ best={lat:round(lat), lng:round(lng), acc}; if(coordsEl) coordsEl.value=`${best.lat}, ${best.lng} (±${Math.round(acc)}m)`; }
          if(acc<=20) stopGPS();
        },
        err=>{ alert('GPS: '+err.message); stopGPS(); },
        {enableHighAccuracy:true, maximumAge:0, timeout:60000}
      );
      setTimeout(stopGPS, 60000);
    });
  }
  if(btnGPSStop){ btnGPSStop.addEventListener('click', stopGPS); }

  if(formTaxi){
    formTaxi.addEventListener('submit', (e)=>{
      e.preventDefault();
      const km = parseFloat(document.getElementById('taxiKm').value)||0;
      if(km<=0){ alert('Informe a distância estimada.'); return; }
      const msg = `Olá! Gostaria de solicitar Táxi Dog:
• Distância estimada: ${km} km
• Coordenadas: ${(coordsEl&&coordsEl.value)||'—'}
Obrigado(a)!`;
      window.open(wa('5531982339672', msg),'_blank','noopener,noreferrer');
    });
  }

  function stopGPS(){ if(watchId!=null){ try{navigator.geolocation.clearWatch(watchId);}catch{} watchId=null; } }
  function round(n){ return Math.round(n*1e6)/1e6; }
})();
    