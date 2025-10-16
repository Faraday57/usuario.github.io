// stock.js – renderiza stock con buscador por código y alertas

(function(){
  // IIFE para crear un ámbito privado y proteger las variables
  
  function escapeHtml(s){ 
    // Función de seguridad que escapa caracteres HTML especiales
    // Previene ataques XSS (Cross-Site Scripting)
    
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); 
    // Convierte el parámetro a string (s||'' maneja valores null/undefined)
    // Busca caracteres especiales: & < > " '
    // Reemplaza cada uno con su entidad HTML segura:
    // & → &amp;  < → &lt;  > → &gt;  " → &quot;  ' → &#39;
  }

  function getEstadoStock(cantidad){
    // Función que determina y retorna el estado del stock según la cantidad
    // Retorna un elemento HTML con badge (etiqueta) de color según el nivel
    
    if(cantidad === 0) return '<span class="badge badge-sin">Sin Stock</span>';
    // Si la cantidad es exactamente 0, retorna badge gris indicando "Sin Stock"
    
    if(cantidad <= 5) return '<span class="badge badge-bajo">Stock Bajo</span>';
    // Si la cantidad es 5 o menos, retorna badge rojo indicando "Stock Bajo"
    
    if(cantidad <= 20) return '<span class="badge badge-medio">Stock Medio</span>';
    // Si la cantidad es 20 o menos, retorna badge amarillo indicando "Stock Medio"
    
    return '<span class="badge badge-alto">Stock Alto</span>';
    // Si la cantidad es mayor a 20, retorna badge verde indicando "Stock Alto"
  }

  function renderStock(filtro = ''){
    // Función que renderiza (dibuja) la tabla de stock
    // Parámetro filtro: texto para filtrar productos por código (por defecto vacío)
    
    const tbody = document.getElementById('tablaStock');
    // Obtiene el elemento tbody de la tabla del DOM
    
    if(!tbody) return;
    // Si no existe el elemento, sale de la función (protección contra errores)
    
    let inv = JSON.parse(localStorage.getItem('inventario')) || [];
    // Lee el inventario desde localStorage:
    // - localStorage.getItem('inventario'): obtiene el string JSON
    // - JSON.parse(): convierte el string JSON a objeto JavaScript
    // - || []: si no existe, retorna un array vacío
    
    if(filtro.trim()){
      // Si hay un filtro de búsqueda (no está vacío después de quitar espacios)
      // trim() elimina espacios al inicio y final
      
      const f = filtro.toLowerCase();
      // Convierte el filtro a minúsculas para búsqueda insensible a mayúsculas/minúsculas
      
      inv = inv.filter(p => p.id.toLowerCase().includes(f));
      // Filtra el inventario:
      // - filter crea un nuevo array con los elementos que cumplen la condición
      // - p.id.toLowerCase(): convierte el ID a minúsculas
      // - includes(f): verifica si el ID contiene el texto del filtro
      // Solo mantiene productos cuyo ID contenga el texto buscado
    }
    
    if(inv.length === 0){
      // Si no hay productos para mostrar (inventario vacío o sin resultados del filtro)
      
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999">No se encontraron productos</td></tr>';
      // Muestra mensaje centrado:
      // - colspan="5": hace que la celda ocupe las 5 columnas de la tabla
      // - text-align:center: centra el texto
      // - color:#999: color gris para el mensaje
      return;
      // Sale de la función
    }
    
    tbody.innerHTML = inv.map(p=>{
      // Recorre cada producto del inventario y crea una fila HTML
      // map transforma cada producto en un string HTML
      
      const stockCritico = p.cantidad < 30;
      // Determina si el stock es crítico (menor a 30 unidades)
      // Retorna true o false
      
      const claseAlerta = stockCritico ? ' class="stock-critico"' : '';
      // Si el stock es crítico, agrega clase CSS para resaltar la fila en rojo
      // Operador ternario: condición ? valorSiTrue : valorSiFalse
      // Si no es crítico, retorna string vacío (sin clase adicional)
      
      const alertaHTML = stockCritico ? ' <span class="alerta-stock">⚠️ Stock Crítico</span>' : '';
      // Si es crítico, agrega un span con emoji de advertencia y mensaje
      // Si no es crítico, retorna string vacío
      
      return `<tr${claseAlerta}>
        <!-- Abre la fila, agregando la clase de alerta si corresponde -->
        
        <td><strong>${escapeHtml(p.id)}</strong></td>
        <!-- Celda con el código ID en negrita, escapando caracteres especiales -->
        
        <td>${escapeHtml(p.nombre)}</td>
        <!-- Celda con el nombre del producto escapado -->
        
        <td>${escapeHtml(p.empresa || 'N/A')}</td>
        <!-- Celda con la empresa escapada
             p.empresa || 'N/A': si empresa no existe o está vacía, muestra 'N/A' -->
        
        <td><strong>${p.cantidad}</strong>${alertaHTML}</td>
        <!-- Celda con la cantidad en negrita y el mensaje de alerta si corresponde -->
        
        <td>${getEstadoStock(p.cantidad)}</td>
        <!-- Celda con el badge de estado según la cantidad -->
      </tr>`;
    }).join('');
    // join('') une todas las filas generadas en un solo string HTML
    // innerHTML reemplaza todo el contenido del tbody con las nuevas filas
  }

  window.addEventListener('DOMContentLoaded', ()=>{ 
    // Espera a que el DOM esté completamente cargado
    // DOMContentLoaded se dispara cuando todo el HTML está parseado
    
    const inputBuscar = document.getElementById('buscarStock');
    // Obtiene el campo de búsqueda del DOM
    
    if(inputBuscar){
      // Si el campo de búsqueda existe
      
      inputBuscar.addEventListener('input', (e)=>{
        // Agrega listener para el evento 'input'
        // 'input' se dispara cada vez que cambia el contenido del campo
        // e es el objeto del evento
        
        renderStock(e.target.value);
        // Renderiza la tabla con el valor actual del input como filtro
        // e.target es el elemento input
        // e.target.value es el texto escrito en el campo
      });
    }
    
    renderStock(); 
    // Renderiza la tabla inicialmente sin filtros al cargar la página
  });
  
  window.addEventListener('inventarioActualizado', ()=>{ 
    // Escucha el evento personalizado 'inventarioActualizado'
    // Este evento se dispara desde otros scripts cuando cambia el inventario
    
    const inputBuscar = document.getElementById('buscarStock');
    // Obtiene el campo de búsqueda
    
    if(inputBuscar){
      // Si existe el campo de búsqueda
      
      renderStock(inputBuscar.value);
      // Renderiza la tabla manteniendo el filtro actual
    } else {
      // Si no existe el campo de búsqueda
      
      renderStock();
      // Renderiza sin filtro
    }
  });
})();