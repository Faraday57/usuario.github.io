// stock.js – renderiza stock con buscador por código y alertas
(function(){
  function escapeHtml(s){ 
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); 
  }

  function getEstadoStock(cantidad){
    if(cantidad === 0) return '<span class="badge badge-sin">Sin Stock</span>';
    if(cantidad <= 5) return '<span class="badge badge-bajo">Stock Bajo</span>';
    if(cantidad <= 20) return '<span class="badge badge-medio">Stock Medio</span>';
    return '<span class="badge badge-alto">Stock Alto</span>';
  }

  function renderStock(filtro = ''){
    const tbody = document.getElementById('tablaStock');
    if(!tbody) return;
    
    let inv = JSON.parse(localStorage.getItem('inventario')) || [];
    
    if(filtro.trim()){
      const f = filtro.toLowerCase();
      inv = inv.filter(p => p.id.toLowerCase().includes(f));
    }
    
    if(inv.length === 0){
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999">No se encontraron productos</td></tr>';
      return;
    }
    
    tbody.innerHTML = inv.map(p=>{
      const stockCritico = p.cantidad < 30;
      const claseAlerta = stockCritico ? ' class="stock-critico"' : '';
      const alertaHTML = stockCritico ? ' <span class="alerta-stock">⚠️ Stock Crítico</span>' : '';
      
      return `<tr${claseAlerta}>
        <td><strong>${escapeHtml(p.id)}</strong></td>
        <td>${escapeHtml(p.nombre)}</td>
        <td>${escapeHtml(p.empresa || 'N/A')}</td>
        <td><strong>${p.cantidad}</strong>${alertaHTML}</td>
        <td>${getEstadoStock(p.cantidad)}</td>
      </tr>`;
    }).join('');
  }

  window.addEventListener('DOMContentLoaded', ()=>{ 
    const inputBuscar = document.getElementById('buscarStock');
    
    if(inputBuscar){
      inputBuscar.addEventListener('input', (e)=>{
        renderStock(e.target.value);
      });
    }
    
    renderStock(); 
  });
  
  window.addEventListener('inventarioActualizado', ()=>{ 
    const inputBuscar = document.getElementById('buscarStock');
    if(inputBuscar){
      renderStock(inputBuscar.value);
    } else {
      renderStock();
    }
  });
})();