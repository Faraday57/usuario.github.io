// inventario.js – maneja inventario con ID, empresa y fecha completa
(function(){
  function getInventario(){ return JSON.parse(localStorage.getItem('inventario')) || []; }
  function setInventario(arr){ localStorage.setItem('inventario', JSON.stringify(arr)); window.dispatchEvent(new Event('inventarioActualizado')); }
  
  function generarID(){
    const inv = getInventario();
    if(inv.length === 0) return 'PROD-001';
    const nums = inv.map(p => {
      const match = p.id.match(/PROD-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = Math.max(...nums);
    return `PROD-${String(maxNum + 1).padStart(3, '0')}`;
  }

  function formatearFecha(fecha){
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const año = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const seg = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${año} ${hora}:${min}:${seg}`;
  }

  function escapeHtml(s){ 
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); 
  }

  let inventarioActual = [];

  function render(filtro = ''){
    const tbody = document.getElementById('tablaInventario');
    if(!tbody) return;
    
    let inv = getInventario();
    inventarioActual = inv;
    
    if(filtro.trim()){
      const f = filtro.toLowerCase();
      inv = inv.filter(p => 
        p.id.toLowerCase().includes(f) ||
        p.nombre.toLowerCase().includes(f) ||
        p.empresa.toLowerCase().includes(f)
      );
    }
    
    if(inv.length === 0){
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999">No se encontraron productos</td></tr>';
      return;
    }
    
    tbody.innerHTML = inv.map(p=>{
      const stockCritico = p.cantidad < 30;
      const claseAlerta = stockCritico ? ' class="stock-critico"' : '';
      const alertaHTML = stockCritico ? ' <span class="alerta-stock">⚠️ Stock Crítico</span>' : '';
      
      return `<tr${claseAlerta}>
        <td><strong>${escapeHtml(p.id)}</strong></td>
        <td>${escapeHtml(p.nombre)}</td>
        <td>${escapeHtml(p.empresa)}</td>
        <td><strong>${p.cantidad}</strong>${alertaHTML}</td>
        <td style="font-size:0.85rem">${formatearFecha(p.fechaRegistro)}</td>
        <td>
          <button onclick="window.editProducto('${escapeHtml(p.id)}')" class="btn-icon" title="Editar">✏️</button>
          <button onclick="window.deleteProducto('${escapeHtml(p.id)}')" class="btn-icon" title="Eliminar">🗑️</button>
        </td>
      </tr>`;
    }).join('');
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    const btnAgregar = document.getElementById('btnAgregar');
    const inputBuscar = document.getElementById('buscarProducto');
    
    // Buscador en tiempo real
    if(inputBuscar){
      inputBuscar.addEventListener('input', (e)=>{
        render(e.target.value);
      });
    }
    
    // Agregar producto
    if(btnAgregar) btnAgregar.addEventListener('click', ()=>{
      const nombre = document.getElementById('nombre').value.trim();
      const empresa = document.getElementById('empresa').value.trim();
      const cantidad = parseInt(document.getElementById('cantidad').value,10);
      
      if(!nombre){
        alert('⚠️ El nombre del producto es obligatorio');
        return;
      }
      if(!empresa){
        alert('⚠️ La empresa proveedora es obligatoria');
        return;
      }
      if(!Number.isFinite(cantidad) || cantidad<=0){
        alert('⚠️ Ingresa una cantidad válida mayor a 0');
        return;
      }
      
      const inv = getInventario();
      const existe = inv.find(x=>x.nombre.toLowerCase() === nombre.toLowerCase());
      
      if(existe){
        if(confirm(`El producto "${nombre}" ya existe. ¿Deseas aumentar su cantidad?`)){
          existe.cantidad += cantidad;
          existe.fechaRegistro = new Date().toISOString();
          setInventario(inv);
        }
      } else {
        const nuevoProducto = {
          id: generarID(),
          nombre: nombre,
          empresa: empresa,
          cantidad: cantidad,
          fechaRegistro: new Date().toISOString()
        };
        inv.push(nuevoProducto);
        setInventario(inv);
      }
      
      document.getElementById('nombre').value='';
      document.getElementById('empresa').value='';
      document.getElementById('cantidad').value='';
      
      if(inputBuscar) inputBuscar.value = '';
      render();
    });

    // Editar producto
    window.editProducto = function(id){
      const inv = getInventario();
      const p = inv.find(x => x.id === id);
      if(!p) return;
      
      const nuevoNombre = prompt('Nuevo nombre del producto:', p.nombre);
      if(nuevoNombre === null) return;
      
      const nuevaEmpresa = prompt('Nueva empresa proveedora:', p.empresa);
      if(nuevaEmpresa === null) return;
      
      const nuevaCantidad = parseInt(prompt('Nueva cantidad:', p.cantidad),10);
      if(!Number.isFinite(nuevaCantidad) || nuevaCantidad < 0){
        alert('⚠️ Cantidad inválida');
        return;
      }
      
      p.nombre = nuevoNombre.trim();
      p.empresa = nuevaEmpresa.trim();
      p.cantidad = nuevaCantidad;
      p.fechaRegistro = new Date().toISOString();
      
      setInventario(inv);
      if(inputBuscar) render(inputBuscar.value);
      else render();
    };

    // Eliminar producto
    window.deleteProducto = function(id){
      const inv = getInventario();
      const p = inv.find(x => x.id === id);
      if(!p) return;
      
      if(!confirm(`¿Estás seguro de eliminar "${p.nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
      
      const nuevoInv = inv.filter(x => x.id !== id);
      setInventario(nuevoInv);
      
      if(inputBuscar) render(inputBuscar.value);
      else render();
    };

    render();
  });
})();