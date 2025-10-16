// facturacion.js – maneja carrito, actualiza inventario, genera PDF e imprime

(function(){
  let carrito = [];
  let numeroFactura = 1; // Contador de facturas
  
  function getInventario(){ 
    return JSON.parse(localStorage.getItem('inventario')) || []; 
  }
  
  function setInventario(arr){ 
    localStorage.setItem('inventario', JSON.stringify(arr)); 
    window.dispatchEvent(new Event('inventarioActualizado')); 
  }
  
  function getNumeroFactura() {
    const num = parseInt(localStorage.getItem('numeroFactura') || '1', 10);
    return num;
  }
  
  function incrementarNumeroFactura() {
    const num = getNumeroFactura() + 1;
    localStorage.setItem('numeroFactura', num.toString());
    return num;
  }

  function renderCarrito(){ 
    const tbody = document.getElementById('tablaFactura'); 
    if(!tbody) return; 
    tbody.innerHTML = carrito.map(c=>`<tr><td>${escapeHtml(c.producto)}</td><td>${c.cantidad}</td></tr>`).join(''); 
  }
  
  function escapeHtml(s){ 
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); 
  }
  
  function prepararFacturaParaImpresion() {
    if(carrito.length === 0) {
      alert('⚠️ El carrito está vacío');
      return false;
    }
    
    // Obtener elementos
    const facturaFecha = document.getElementById('facturaFecha');
    const facturaNumero = document.getElementById('facturaNumero');
    const facturaTabla = document.getElementById('facturaTablaImpresion');
    const facturaTotalItems = document.getElementById('facturaTotalItems');
    
    if(!facturaFecha || !facturaNumero || !facturaTabla || !facturaTotalItems) {
      console.error('No se encontraron los elementos de la factura');
      return false;
    }
    
    // Establecer fecha actual
    facturaFecha.textContent = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Establecer número de factura
    numeroFactura = getNumeroFactura();
    facturaNumero.textContent = `${String(numeroFactura).padStart(6, '0')}`;
    
    // Llenar tabla de productos
    let total = 0;
    facturaTabla.innerHTML = carrito.map(c => {
      total += c.cantidad;
      return `<tr>
        <td>${escapeHtml(c.producto)}</td>
        <td>${c.cantidad}</td>
      </tr>`;
    }).join('');
    
    // Establecer total
    facturaTotalItems.textContent = total;
    
    return true;
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

    // Agregar al carrito
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

    // Generar PDF
    document.getElementById('btnGenerar')?.addEventListener('click', async ()=>{
      if(carrito.length===0) return alert('Carrito vacío');
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      doc.setFontSize(16); 
      doc.text('Factura de Venta',14,20);
      
      doc.setFontSize(10); 
      doc.text('Fecha: '+new Date().toLocaleString(),14,28);
      doc.text('N° Factura: '+String(getNumeroFactura()).padStart(6,'0'),14,34);
      
      let y=45; 
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
      
      doc.save('factura_'+String(numeroFactura).padStart(6,'0')+'.pdf');
      
      // Incrementar número de factura después de generar PDF
      incrementarNumeroFactura();
      
      // Limpiar carrito
      carrito=[]; 
      renderCarrito(); 
      window.dispatchEvent(new Event('inventarioActualizado'));
      
      document.getElementById('mensaje') && (document.getElementById('mensaje').textContent='Factura PDF generada ✅');
      
      setTimeout(() => {
        document.getElementById('mensaje') && (document.getElementById('mensaje').textContent='');
      }, 3000);
    });

    // Vista previa de impresión
    document.getElementById('btnVistaPrevia')?.addEventListener('click', ()=>{
      if(prepararFacturaParaImpresion()) {
        document.getElementById('facturaImpresion').classList.add('visible');
        // Scroll hacia la vista previa
        document.getElementById('facturaImpresion').scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Imprimir directamente
    document.getElementById('btnImprimir')?.addEventListener('click', ()=>{
      if(carrito.length === 0) {
        return alert('⚠️ El carrito está vacío');
      }
      
      if(prepararFacturaParaImpresion()) {
        // Mostrar vista previa brevemente
        document.getElementById('facturaImpresion').classList.add('visible');
        
        // Preguntar si desea continuar con la impresión
        if(confirm('¿Desea imprimir la factura?\n\nAsegúrese de que su impresora esté conectada y lista.')) {
          // Pequeño delay para que se vea la vista previa
          setTimeout(() => {
            window.print();
            
            // Después de imprimir, limpiar carrito y cerrar vista previa
            setTimeout(() => {
              // Incrementar número de factura
              incrementarNumeroFactura();
              
              // Limpiar carrito
              carrito = [];
              renderCarrito();
              window.dispatchEvent(new Event('inventarioActualizado'));
              
              // Cerrar vista previa
              document.getElementById('facturaImpresion').classList.remove('visible');
              
              // Mostrar mensaje
              const mensaje = document.getElementById('mensaje');
              if(mensaje) {
                mensaje.textContent = 'Factura impresa ✅';
                setTimeout(() => {
                  mensaje.textContent = '';
                }, 3000);
              }
            }, 1000);
          }, 500);
        } else {
          // Si cancela, cerrar vista previa
          document.getElementById('facturaImpresion').classList.remove('visible');
        }
      }
    });
    
    // Detectar después de que se cierre el diálogo de impresión
    window.addEventListener('afterprint', () => {
      console.log('Impresión completada o cancelada');
    });
    
    window.addEventListener('beforeprint', () => {
      console.log('Iniciando impresión...');
    });
  });
})();