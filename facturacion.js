// facturacion.js – maneja carrito, actualiza inventario y genera PDF
(function(){
  let carrito = [];
  function getInventario(){ return JSON.parse(localStorage.getItem('inventario')) || []; }
  function setInventario(arr){ localStorage.setItem('inventario', JSON.stringify(arr)); window.dispatchEvent(new Event('inventarioActualizado')); }

  function renderCarrito(){ 
    const tbody = document.getElementById('tablaFactura'); 
    if(!tbody) return; 
    tbody.innerHTML = carrito.map(c=>`<tr><td>${escapeHtml(c.producto)}</td><td>${c.cantidad}</td></tr>`).join(''); 
  }
  
  function escapeHtml(s){ 
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); 
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    const sel = document.getElementById('selProducto');
    
    function fillSelect(){ 
      const inv = getInventario(); 
      if(!sel) return; 
      sel.innerHTML = inv.map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.nombre)} (${escapeHtml(p.id)}) - Stock: ${p.cantidad}</option>`).join(''); 
    }
    
    fillSelect();
    window.addEventListener('inventarioActualizado', fillSelect);

    document.getElementById('btnAddCarrito')?.addEventListener('click', ()=>{
      const id = document.getElementById('selProducto')?.value; 
      const cantidad = parseInt(document.getElementById('cantVenta')?.value,10);
      
      if(!id || !Number.isFinite(cantidad) || cantidad<=0) return alert('Selecciona producto y cantidad válidos');
      
      const inv = getInventario(); 
      const item = inv.find(p=>p.id===id);
      
      if(!item || item.cantidad < cantidad) return alert('Stock insuficiente');
      
      item.cantidad -= cantidad;
      setInventario(inv);
      carrito.push({producto:`${item.nombre} (${item.id})`,cantidad}); 
      renderCarrito();
      document.getElementById('cantVenta').value='';
    });

    document.getElementById('btnGenerar')?.addEventListener('click', async ()=>{
      if(carrito.length===0) return alert('Carrito vacío');
      
      // generar PDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFontSize(16); 
      doc.text('Factura de Venta',14,20);
      doc.setFontSize(10); 
      doc.text('Fecha: '+new Date().toLocaleString(),14,28);
      
      let y=40; 
      doc.text('Producto',14,y); 
      doc.text('Cantidad',110,y); 
      y+=6; 
      doc.line(14,y,196,y); 
      y+=6;
      
      let total=0; 
      carrito.forEach(c=>{ 
        doc.text(c.producto,14,y); 
        doc.text(String(c.cantidad),110,y); 
        y+=8; 
        total+=c.cantidad; 
      });
      
      y+=8; 
      doc.text('Total items: '+total,14,y);
      doc.save('factura.pdf');
      
      // limpiar carrito y actualizar select
      carrito=[]; 
      renderCarrito(); 
      window.dispatchEvent(new Event('inventarioActualizado'));
      document.getElementById('mensaje') && (document.getElementById('mensaje').textContent='Factura generada ✅');
    });
  });
})();