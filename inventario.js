// inventario.js – maneja inventario con ID, empresa y fecha completa

(function(){
  // IIFE para crear un ámbito privado y evitar contaminar el espacio global
  
  function getInventario(){ 
    // Función que obtiene el inventario del localStorage
    return JSON.parse(localStorage.getItem('inventario')) || []; 
    // Lee 'inventario' del localStorage, lo convierte de JSON a objeto
    // Si no existe (null), retorna un array vacío []
  }
  
  function setInventario(arr){ 
    // Función que guarda el inventario en localStorage
    localStorage.setItem('inventario', JSON.stringify(arr)); 
    // Convierte el array a formato JSON string y lo guarda
    
    window.dispatchEvent(new Event('inventarioActualizado')); 
    // Dispara un evento personalizado para notificar que el inventario cambió
    // Otras partes de la aplicación pueden escuchar este evento
  }
  
  function generarID(){
    // Función que genera un ID único y secuencial para nuevos productos
    
    const inv = getInventario();
    // Obtiene el inventario actual
    
    if(inv.length === 0) return 'PROD-001';
    // Si el inventario está vacío (primer producto), retorna 'PROD-001'
    
    const nums = inv.map(p => {
      // Recorre todos los productos para extraer sus números de ID
      
      const match = p.id.match(/PROD-(\d+)/);
      // Usa expresión regular para buscar el patrón 'PROD-' seguido de dígitos
      // \d+ busca uno o más dígitos
      // Los paréntesis () capturan el grupo de dígitos
      
      return match ? parseInt(match[1], 10) : 0;
      // Si encuentra el patrón:
      //   - match[1] contiene los dígitos capturados
      //   - parseInt convierte el string a número entero (base 10)
      // Si no encuentra el patrón, retorna 0
    });
    
    const maxNum = Math.max(...nums);
    // Encuentra el número más alto de todos los IDs
    // ...nums expande el array (spread operator)
    // Math.max encuentra el valor máximo
    
    return `PROD-${String(maxNum + 1).padStart(3, '0')}`;
    // Genera el nuevo ID:
    // - maxNum + 1: siguiente número en la secuencia
    // - String(): convierte el número a texto
    // - padStart(3, '0'): rellena con ceros a la izquierda hasta 3 dígitos
    //   Ejemplo: 5 → '005', 42 → '042', 123 → '123'
    // - Template literal `PROD-${...}` crea el ID completo
    // Resultado: 'PROD-002', 'PROD-003', etc.
  }

  function formatearFecha(fecha){
    // Función que formatea una fecha ISO a formato legible DD/MM/YYYY HH:MM:SS
    
    const d = new Date(fecha);
    // Crea objeto Date desde el string de fecha ISO
    
    const dia = String(d.getDate()).padStart(2, '0');
    // Obtiene el día del mes (1-31)
    // Convierte a string y rellena con 0 si es necesario (1 → '01')
    
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    // Obtiene el mes (0-11), por eso suma +1 para obtener (1-12)
    // Rellena con 0 si es necesario
    
    const año = d.getFullYear();
    // Obtiene el año completo (ej: 2024)
    
    const hora = String(d.getHours()).padStart(2, '0');
    // Obtiene las horas (0-23) y rellena con 0
    
    const min = String(d.getMinutes()).padStart(2, '0');
    // Obtiene los minutos (0-59) y rellena con 0
    
    const seg = String(d.getSeconds()).padStart(2, '0');
    // Obtiene los segundos (0-59) y rellena con 0
    
    return `${dia}/${mes}/${año} ${hora}:${min}:${seg}`;
    // Retorna fecha formateada: 25/12/2024 14:30:45
  }

  function escapeHtml(s){ 
    // Función de seguridad para prevenir ataques XSS
    // Escapa caracteres HTML especiales
    
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m])); 
    // Convierte a string (maneja null/undefined con s||'')
    // Busca caracteres especiales con expresión regular
    // Reemplaza cada uno con su entidad HTML segura
  }

  let inventarioActual = [];
  // Variable que almacena el inventario actual en memoria
  // Se usa para operaciones que no requieren leer localStorage constantemente

  function render(filtro = ''){
    // Función que renderiza (dibuja) la tabla de productos
    // Parámetro filtro: texto para filtrar productos (por defecto vacío)
    
    const tbody = document.getElementById('tablaInventario');
    // Obtiene el elemento tbody de la tabla
    
    if(!tbody) return;
    // Si no existe, sale de la función
    
    let inv = getInventario();
    // Obtiene el inventario desde localStorage
    
    inventarioActual = inv;
    // Guarda una copia en la variable de memoria
    
    if(filtro.trim()){
      // Si hay un filtro de búsqueda (no está vacío después de quitar espacios)
      
      const f = filtro.toLowerCase();
      // Convierte el filtro a minúsculas para búsqueda insensible a mayúsculas
      
      inv = inv.filter(p => 
        // Filtra el inventario, manteniendo solo productos que cumplan la condición
        
        p.id.toLowerCase().includes(f) ||
        // Busca si el ID contiene el texto del filtro (insensible a mayúsculas)
        
        p.nombre.toLowerCase().includes(f) ||
        // Busca si el nombre contiene el texto del filtro
        
        p.empresa.toLowerCase().includes(f)
        // Busca si la empresa contiene el texto del filtro
        // || es OR: cualquiera de las tres condiciones hace que se incluya el producto
      );
    }
    
    if(inv.length === 0){
      // Si no hay productos para mostrar (inventario vacío o filtro sin resultados)
      
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999">No se encontraron productos</td></tr>';
      // Muestra un mensaje centrado ocupando todas las columnas (colspan="6")
      return;
      // Sale de la función
    }
    
    tbody.innerHTML = inv.map(p=>{
      // Recorre cada producto y crea una fila HTML
      
      const stockCritico = p.cantidad < 30;
      // Determina si el stock es crítico (menor a 30 unidades)
      
      const claseAlerta = stockCritico ? ' class="stock-critico"' : '';
      // Si es crítico, agrega clase CSS para resaltar la fila
      // Operador ternario: condición ? valorSiTrue : valorSiFalse
      
      const alertaHTML = stockCritico ? ' <span class="alerta-stock">⚠️ Stock Crítico</span>' : '';
      // Si es crítico, agrega un span con mensaje de alerta
      
      return `<tr${claseAlerta}>
        <td><strong>${escapeHtml(p.id)}</strong></td>
        <!-- Celda con el ID del producto en negrita -->
        
        <td>${escapeHtml(p.nombre)}</td>
        <!-- Celda con el nombre del producto -->
        
        <td>${escapeHtml(p.empresa)}</td>
        <!-- Celda con la empresa proveedora -->
        
        <td><strong>${p.cantidad}</strong>${alertaHTML}</td>
        <!-- Celda con la cantidad y alerta si es crítica -->
        
        <td style="font-size:0.85rem">${formatearFecha(p.fechaRegistro)}</td>
        <!-- Celda con fecha formateada y tamaño de fuente más pequeño -->
        
        <td>
          <button onclick="window.editProducto('${escapeHtml(p.id)}')" class="btn-icon" title="Editar">✏️</button>
          <!-- Botón para editar, llama a función global con el ID del producto -->
          
          <button onclick="window.deleteProducto('${escapeHtml(p.id)}')" class="btn-icon" title="Eliminar">🗑️</button>
          <!-- Botón para eliminar, llama a función global con el ID del producto -->
        </td>
      </tr>`;
    }).join('');
    // join('') une todas las filas en un string HTML único
    // innerHTML reemplaza todo el contenido del tbody
  }

  window.addEventListener('DOMContentLoaded', ()=>{
    // Espera a que el DOM esté completamente cargado
    
    const btnAgregar = document.getElementById('btnAgregar');
    // Obtiene el botón "Agregar Producto"
    
    const inputBuscar = document.getElementById('buscarProducto');
    // Obtiene el campo de búsqueda
    
    // Buscador en tiempo real
    if(inputBuscar){
      // Si existe el campo de búsqueda
      
      inputBuscar.addEventListener('input', (e)=>{
        // Agrega listener para el evento 'input' (se dispara cada vez que cambia el texto)
        
        render(e.target.value);
        // Renderiza la tabla con el valor actual del input como filtro
        // e.target.value obtiene el texto escrito en el campo
      });
    }
    
    // Agregar producto
    if(btnAgregar) btnAgregar.addEventListener('click', ()=>{
      // Si existe el botón, agrega listener para clicks
      
      const nombre = document.getElementById('nombre').value.trim();
      // Obtiene el valor del campo nombre y quita espacios
      
      const empresa = document.getElementById('empresa').value.trim();
      // Obtiene el valor del campo empresa y quita espacios
      
      const cantidad = parseInt(document.getElementById('cantidad').value,10);
      // Obtiene el valor del campo cantidad y lo convierte a número entero
      
      if(!nombre){
        // Si el nombre está vacío
        alert('⚠️ El nombre del producto es obligatorio');
        // Muestra alerta
        return;
        // Sale de la función sin agregar el producto
      }
      
      if(!empresa){
        // Si la empresa está vacía
        alert('⚠️ La empresa proveedora es obligatoria');
        return;
      }
      
      if(!Number.isFinite(cantidad) || cantidad<=0){
        // Si la cantidad no es un número válido o es menor o igual a 0
        // Number.isFinite verifica que sea un número finito (no NaN, no Infinity)
        alert('⚠️ Ingresa una cantidad válida mayor a 0');
        return;
      }
      
      const inv = getInventario();
      // Obtiene el inventario actual
      
      const existe = inv.find(x=>x.nombre.toLowerCase() === nombre.toLowerCase());
      // Busca si ya existe un producto con ese nombre (ignorando mayúsculas)
      // find retorna el primer elemento que cumple la condición, o undefined si no encuentra
      
      if(existe){
        // Si el producto ya existe
        
        if(confirm(`El producto "${nombre}" ya existe. ¿Deseas aumentar su cantidad?`)){
          // Muestra diálogo de confirmación
          // confirm retorna true si el usuario acepta, false si cancela
          
          existe.cantidad += cantidad;
          // Suma la nueva cantidad a la cantidad existente
          // += es equivalente a: existe.cantidad = existe.cantidad + cantidad
          
          existe.fechaRegistro = new Date().toISOString();
          // Actualiza la fecha de registro a la fecha/hora actual
          // toISOString() convierte la fecha a formato ISO (ej: 2024-12-25T14:30:45.000Z)
          
          setInventario(inv);
          // Guarda el inventario actualizado
        }
      } else {
        // Si el producto NO existe (es nuevo)
        
        const nuevoProducto = {
          // Crea un objeto con los datos del nuevo producto
          id: generarID(),
          // Genera un ID único automáticamente
          nombre: nombre,
          // Nombre ingresado por el usuario
          empresa: empresa,
          // Empresa ingresada por el usuario
          cantidad: cantidad,
          // Cantidad ingresada por el usuario
          fechaRegistro: new Date().toISOString()
          // Fecha y hora actual en formato ISO
        };
        
        inv.push(nuevoProducto);
        // Agrega el nuevo producto al final del array de inventario
        
        setInventario(inv);
        // Guarda el inventario actualizado con el nuevo producto
      }
      
      document.getElementById('nombre').value='';
      // Limpia el campo nombre (lo deja vacío)
      
      document.getElementById('empresa').value='';
      // Limpia el campo empresa
      
      document.getElementById('cantidad').value='';
      // Limpia el campo cantidad
      
      if(inputBuscar) inputBuscar.value = '';
      // Si existe el campo de búsqueda, también lo limpia
      
      render();
      // Renderiza la tabla actualizada sin filtros
    });

    // Editar producto
    window.editProducto = function(id){
      // Define una función global para editar productos
      // Se llama desde los botones de editar en la tabla
      
      const inv = getInventario();
      // Obtiene el inventario actual
      
      const p = inv.find(x => x.id === id);
      // Busca el producto con el ID especificado
      
      if(!p) return;
      // Si no encuentra el producto, sale de la función
      
      const nuevoNombre = prompt('Nuevo nombre del producto:', p.nombre);
      // Muestra un diálogo para ingresar el nuevo nombre
      // prompt retorna el texto ingresado, o null si se cancela
      // El segundo parámetro (p.nombre) es el valor por defecto
      
      if(nuevoNombre === null) return;
      // Si el usuario canceló, sale de la función
      
      const nuevaEmpresa = prompt('Nueva empresa proveedora:', p.empresa);
      // Solicita la nueva empresa
      
      if(nuevaEmpresa === null) return;
      // Si se canceló, sale
      
      const nuevaCantidad = parseInt(prompt('Nueva cantidad:', p.cantidad),10);
      // Solicita la nueva cantidad y la convierte a número entero
      
      if(!Number.isFinite(nuevaCantidad) || nuevaCantidad < 0){
        // Valida que la cantidad sea un número válido y no negativo
        alert('⚠️ Cantidad inválida');
        return;
      }
      
      p.nombre = nuevoNombre.trim();
      // Actualiza el nombre del producto (quitando espacios)
      
      p.empresa = nuevaEmpresa.trim();
      // Actualiza la empresa
      
      p.cantidad = nuevaCantidad;
      // Actualiza la cantidad
      
      p.fechaRegistro = new Date().toISOString();
      // Actualiza la fecha de modificación
      
      setInventario(inv);
      // Guarda los cambios en localStorage
      
      if(inputBuscar) render(inputBuscar.value);
      // Si hay campo de búsqueda, renderiza con el filtro actual
      else render();
      // Si no, renderiza sin filtro
    };

    // Eliminar producto
    window.deleteProducto = function(id){
      // Define función global para eliminar productos
      
      const inv = getInventario();
      // Obtiene el inventario
      
      const p = inv.find(x => x.id === id);
      // Busca el producto a eliminar
      
      if(!p) return;
      // Si no existe, sale
      
      if(!confirm(`¿Estás seguro de eliminar "${p.nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
      // Muestra diálogo de confirmación
      // \n\n crea dos saltos de línea
      // Si el usuario cancela, sale de la función
      
      const nuevoInv = inv.filter(x => x.id !== id);
      // Crea un nuevo array sin el producto eliminado
      // filter mantiene todos los productos cuyo ID sea diferente al especificado
      // !== significa "no es igual a"
      
      setInventario(nuevoInv);
      // Guarda el inventario sin el producto eliminado
      
      if(inputBuscar) render(inputBuscar.value);
      // Renderiza con filtro actual si existe
      else render();
      // O renderiza sin filtro
    };

    render();
    // Renderiza la tabla inicial al cargar la página
  });
})();