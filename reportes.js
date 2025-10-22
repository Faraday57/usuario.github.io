// reportes.js – exporta inventario a Excel (XLSX) con formato profesional

function exportarInventario() {
  // Función principal que exporta el inventario a un archivo Excel
  // Esta función es llamada desde el botón en reportes.html
  
  const inv = JSON.parse(localStorage.getItem('inventario')) || [];
  // Lee el inventario desde localStorage:
  // - localStorage.getItem('inventario'): obtiene el string JSON guardado
  // - JSON.parse(): convierte el string JSON a array de objetos JavaScript
  // - || []: si no existe inventario, retorna un array vacío

  if (!inv.length) {
    // Verifica si el array está vacío (no hay productos)
    // inv.length retorna 0 si está vacío, y 0 es falsy (se evalúa como false)
    // ! convierte false en true
    
    alert('No hay productos en el inventario para exportar.');
    // Muestra alerta al usuario indicando que no hay datos
    
    return;
    // Sale de la función sin exportar nada
  }

  // Cargar SheetJS desde CDN si no está disponible
  if (typeof XLSX === 'undefined') {
    // Verifica si la librería XLSX está cargada
    // typeof retorna 'undefined' si la variable no existe
    
    const script = document.createElement('script');
    // Crea un nuevo elemento <script> en memoria
    
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    // Establece la URL de donde cargar la librería SheetJS
    
    script.onload = () => exportarInventario();
    // Define función que se ejecuta cuando el script termine de cargar
    // Llama recursivamente a exportarInventario() para reintentar la exportación
    
    document.head.appendChild(script);
    // Agrega el elemento script al <head> del documento
    // Esto inicia la descarga y ejecución de la librería
    
    return;
    // Sale de la función, esperando que el script se cargue
  }

  // Preparar datos para Excel
  const datosExcel = inv.map(p => {
    // Recorre cada producto del inventario y lo transforma
    // map crea un nuevo array con los datos formateados para Excel
    
    // Separar fecha y hora
    const fecha = formatearFechaExcel(p.fechaRegistro);
    // Llama a función que formatea la fecha en formato DD/MM/YYYY
    
    const hora = formatearHoraExcel(p.fechaRegistro);
    // Llama a función que formatea la hora en formato HH:MM:SS
    
    // Determinar estado de stock
    let estadoStock = '';
    // Variable que almacenará el estado del stock como texto
    
    if (p.cantidad === 0) {
      // Si la cantidad es exactamente 0
      estadoStock = 'SIN STOCK';
    } else if (p.cantidad < 30) {
      // Si la cantidad es menor a 30
      estadoStock = 'CRÍTICO';
    } else if (p.cantidad <= 50) {
      // Si la cantidad es 50 o menos
      estadoStock = 'BAJO';
    } else if (p.cantidad <= 100) {
      // Si la cantidad es 100 o menos
      estadoStock = 'MEDIO';
    } else {
      // Si la cantidad es mayor a 100
      estadoStock = 'ALTO';
    }

    return {
      // Retorna un objeto con las propiedades que serán columnas en Excel
      // Las claves del objeto son los nombres de las columnas
      
      'Código ID': p.id || '',
      // Columna con el código ID del producto
      // || '' usa string vacío si p.id no existe
      
      'Nombre del Producto': p.nombre || '',
      // Columna con el nombre completo del producto
      
      'Empresa Proveedora': p.empresa || 'N/A',
      // Columna con la empresa proveedora
      // Si no existe, muestra 'N/A' (No Aplica)
      
      'Cantidad en Stock': p.cantidad,
      // Columna con la cantidad numérica
      
      'Estado de Stock': estadoStock,
      // Columna con el texto del estado calculado anteriormente
      
      'Fecha de Registro': fecha,
      // Columna con la fecha formateada
      
      'Hora de Registro': hora
      // Columna con la hora formateada
    };
  });

  // Calcular resumen
  const totalProductos = inv.length;
  // Cuenta el total de productos (número de elementos en el array)
  
  const totalStock = inv.reduce((sum, p) => sum + p.cantidad, 0);
  // Suma todas las cantidades de todos los productos:
  // - reduce: recorre el array acumulando un valor
  // - sum: acumulador que inicia en 0
  // - p: cada producto
  // - sum + p.cantidad: suma la cantidad actual al acumulador
  // - 0: valor inicial del acumulador
  
  const productosCriticos = inv.filter(p => p.cantidad < 30).length;
  // Cuenta productos con cantidad menor a 30:
  // - filter: crea array con productos que cumplen la condición
  // - .length: cuenta cuántos elementos tiene el array resultante
  
  const productosSinStock = inv.filter(p => p.cantidad === 0).length;
  // Cuenta productos con cantidad exactamente 0
  
  const promedioStock = Math.round(totalStock / totalProductos);
  // Calcula el promedio de stock por producto:
  // - totalStock / totalProductos: división para obtener promedio
  // - Math.round(): redondea al número entero más cercano
  //   Ej: 45.7 → 46, 45.3 → 45

  // Agregar filas de resumen
  datosExcel.push({});
  // Agrega una fila vacía al array datosExcel para separar visualmente
  // push() agrega el elemento al final del array
  // {} es un objeto vacío que crea una fila en blanco en Excel
  
  datosExcel.push({
    // Agrega una fila con el título del resumen
    'Código ID': 'RESUMEN DEL INVENTARIO',
    // Primera columna con el título en mayúsculas
    'Nombre del Producto': '',
    // Segunda columna vacía
    'Empresa Proveedora': '',
    // Tercera columna vacía
    'Cantidad en Stock': '',
    // Cuarta columna vacía
    'Estado de Stock': '',
    // Quinta columna vacía
    'Fecha de Registro': '',
    // Sexta columna vacía
    'Hora de Registro': ''
    // Séptima columna vacía
  });
  
  datosExcel.push({
    // Agrega fila con total de productos
    'Código ID': 'Total de Productos:',
    // Etiqueta descriptiva en la primera columna
    'Nombre del Producto': totalProductos,
    // Valor numérico calculado anteriormente
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
    // Resto de columnas vacías
  });
  
  datosExcel.push({
    // Agrega fila con total de unidades
    'Código ID': 'Total de Unidades en Stock:',
    'Nombre del Producto': totalStock,
    // Suma total de todas las cantidades
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  
  datosExcel.push({
    // Agrega fila con promedio
    'Código ID': 'Promedio de Stock por Producto:',
    'Nombre del Producto': promedioStock,
    // Promedio calculado y redondeado
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  
  datosExcel.push({
    // Agrega fila con productos críticos
    'Código ID': 'Productos en Estado Crítico:',
    'Nombre del Producto': productosCriticos,
    // Cantidad de productos con stock < 30
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  
  datosExcel.push({
    // Agrega fila con productos sin stock
    'Código ID': 'Productos sin Stock:',
    'Nombre del Producto': productosSinStock,
    // Cantidad de productos con stock = 0
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });

  // Crear libro de Excel
  const ws = XLSX.utils.json_to_sheet(datosExcel);
  // Convierte el array de objetos JavaScript a una hoja de cálculo Excel
  // XLSX.utils.json_to_sheet: función de la librería SheetJS
  // - Toma un array de objetos
  // - Las claves de los objetos se convierten en encabezados de columna
  // - Los valores se convierten en celdas
  // ws (worksheet) es el objeto que representa la hoja
  
  // Aplicar estilos y anchos de columna
  const colWidths = [
    // Array que define el ancho de cada columna
    { wch: 12 },  // Código ID: 12 caracteres de ancho
    { wch: 30 },  // Nombre del Producto: 30 caracteres
    { wch: 25 },  // Empresa Proveedora: 25 caracteres
    { wch: 18 },  // Cantidad en Stock: 18 caracteres
    { wch: 16 },  // Estado de Stock: 16 caracteres
    { wch: 15 },  // Fecha de Registro: 15 caracteres
    { wch: 15 }   // Hora de Registro: 15 caracteres
    // wch = width in characters (ancho en caracteres)
  ];
  
  ws['!cols'] = colWidths;
  // Asigna los anchos de columna a la hoja
  // !cols es una propiedad especial de SheetJS para configurar columnas

  // Crear el libro y agregar la hoja
  const wb = XLSX.utils.book_new();
  // Crea un nuevo libro de Excel (workbook) vacío
  // Un libro puede contener múltiples hojas
  
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
  // Agrega la hoja (ws) al libro (wb):
  // - wb: el libro de Excel
  // - ws: la hoja de cálculo creada anteriormente
  // - 'Inventario': nombre de la pestaña/hoja en Excel

  // Nombre de archivo con fecha actual
  const fechaActual = new Date();
  // Crea un objeto Date con la fecha y hora actual
  
  const nombreArchivo = `Inventario_${fechaActual.getDate()}-${fechaActual.getMonth() + 1}-${fechaActual.getFullYear()}_${String(fechaActual.getHours()).padStart(2,'0')}-${String(fechaActual.getMinutes()).padStart(2,'0')}.xlsx`;
  // Construye el nombre del archivo usando template literal:
  // - fechaActual.getDate(): día del mes (1-31)
  // - fechaActual.getMonth() + 1: mes (0-11, por eso +1 para obtener 1-12)
  // - fechaActual.getFullYear(): año completo (ej: 2024)
  // - fechaActual.getHours(): horas (0-23)
  // - String().padStart(2,'0'): convierte a string y rellena con 0 a la izquierda
  //   Ej: 9 → '09'
  // - fechaActual.getMinutes(): minutos (0-59)
  // Resultado ejemplo: Inventario_25-12-2024_14-30.xlsx
  
  // Descargar archivo
  XLSX.writeFile(wb, nombreArchivo);
  // Genera y descarga el archivo Excel:
  // - wb: el libro de Excel completo
  // - nombreArchivo: nombre con el que se guardará
  // Esta función dispara la descarga en el navegador

  // Mostrar mensaje de éxito
  setTimeout(() => {
    // setTimeout ejecuta una función después de un tiempo específico
    // Esto da tiempo para que se inicie la descarga antes de mostrar el mensaje
    
    alert(`✅ Reporte Excel exportado exitosamente!\n\n📁 Archivo: ${nombreArchivo}\n\n📊 Resumen:\n• Total de productos: ${totalProductos}\n• Total en stock: ${totalStock} unidades\n• Promedio por producto: ${promedioStock} unidades\n• Productos críticos: ${productosCriticos}\n• Sin stock: ${productosSinStock}`);
    // Muestra una alerta con:
    // - Mensaje de éxito con emoji ✅
    // - Nombre del archivo con emoji 📁
    // - Resumen de estadísticas con emojis
    // \n\n crea dos saltos de línea (línea en blanco)
    // \n• crea viñetas con puntos
    // ${...} inserta variables en el template literal
  }, 100);
  // 100 milisegundos = 0.1 segundos de espera
}

function formatearFechaExcel(fecha){
  // Función que formatea una fecha ISO al formato DD/MM/YYYY
  
  if(!fecha) return 'N/A';
  // Si no hay fecha (null, undefined, string vacío), retorna 'N/A'
  
  const d = new Date(fecha);
  // Crea un objeto Date desde el string de fecha ISO
  // Ej: '2024-12-25T14:30:45.000Z' → objeto Date
  
  const dia = String(d.getDate()).padStart(2, '0');
  // Obtiene el día del mes (1-31)
  // String(): convierte el número a texto
  // padStart(2, '0'): rellena con cero a la izquierda hasta 2 dígitos
  // Ej: 5 → '05', 25 → '25'
  
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  // Obtiene el mes (0-11)
  // +1: ajusta para obtener mes real (1-12)
  // padStart: rellena con cero
  // Ej: mes 0 (enero) → 1 → '01'
  
  const año = d.getFullYear();
  // Obtiene el año completo
  // Ej: 2024
  
  return `${dia}/${mes}/${año}`;
  // Retorna fecha formateada: 25/12/2024
  // Usa template literal para construir el string
}

function formatearHoraExcel(fecha){
  // Función que formatea la hora de una fecha ISO al formato HH:MM:SS
  
  if(!fecha) return 'N/A';
  // Si no hay fecha, retorna 'N/A'
  
  const d = new Date(fecha);
  // Convierte el string ISO a objeto Date
  
  const hora = String(d.getHours()).padStart(2, '0');
  // Obtiene las horas (0-23)
  // padStart rellena con cero: 9 → '09'
  
  const min = String(d.getMinutes()).padStart(2, '0');
  // Obtiene los minutos (0-59)
  // Rellena con cero: 5 → '05'
  
  const seg = String(d.getSeconds()).padStart(2, '0');
  // Obtiene los segundos (0-59)
  // Rellena con cero: 3 → '03'
  
  return `${hora}:${min}:${seg}`;
  // Retorna hora formateada: 14:30:45
  // Usa template literal con : como separador
}