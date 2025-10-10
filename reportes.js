// reportes.js – exporta inventario a Excel (XLSX) con formato profesional
function exportarInventario() {
  const inv = JSON.parse(localStorage.getItem('inventario')) || [];

  if (!inv.length) {
    alert('No hay productos en el inventario para exportar.');
    return;
  }

  // Cargar SheetJS desde CDN si no está disponible
  if (typeof XLSX === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => exportarInventario();
    document.head.appendChild(script);
    return;
  }

  // Preparar datos para Excel
  const datosExcel = inv.map(p => {
    // Separar fecha y hora
    const fecha = formatearFechaExcel(p.fechaRegistro);
    const hora = formatearHoraExcel(p.fechaRegistro);
    
    // Determinar estado de stock
    let estadoStock = '';
    if (p.cantidad === 0) {
      estadoStock = 'SIN STOCK';
    } else if (p.cantidad < 30) {
      estadoStock = 'CRÍTICO';
    } else if (p.cantidad <= 50) {
      estadoStock = 'BAJO';
    } else if (p.cantidad <= 100) {
      estadoStock = 'MEDIO';
    } else {
      estadoStock = 'ALTO';
    }

    return {
      'Código ID': p.id || '',
      'Nombre del Producto': p.nombre || '',
      'Empresa Proveedora': p.empresa || 'N/A',
      'Cantidad en Stock': p.cantidad,
      'Estado de Stock': estadoStock,
      'Fecha de Registro': fecha,
      'Hora de Registro': hora
    };
  });

  // Calcular resumen
  const totalProductos = inv.length;
  const totalStock = inv.reduce((sum, p) => sum + p.cantidad, 0);
  const productosCriticos = inv.filter(p => p.cantidad < 30).length;
  const productosSinStock = inv.filter(p => p.cantidad === 0).length;
  const promedioStock = Math.round(totalStock / totalProductos);

  // Agregar filas de resumen
  datosExcel.push({});
  datosExcel.push({
    'Código ID': 'RESUMEN DEL INVENTARIO',
    'Nombre del Producto': '',
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  datosExcel.push({
    'Código ID': 'Total de Productos:',
    'Nombre del Producto': totalProductos,
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  datosExcel.push({
    'Código ID': 'Total de Unidades en Stock:',
    'Nombre del Producto': totalStock,
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  datosExcel.push({
    'Código ID': 'Promedio de Stock por Producto:',
    'Nombre del Producto': promedioStock,
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  datosExcel.push({
    'Código ID': 'Productos en Estado Crítico:',
    'Nombre del Producto': productosCriticos,
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });
  datosExcel.push({
    'Código ID': 'Productos sin Stock:',
    'Nombre del Producto': productosSinStock,
    'Empresa Proveedora': '',
    'Cantidad en Stock': '',
    'Estado de Stock': '',
    'Fecha de Registro': '',
    'Hora de Registro': ''
  });

  // Crear libro de Excel
  const ws = XLSX.utils.json_to_sheet(datosExcel);
  
  // Aplicar estilos y anchos de columna
  const colWidths = [
    { wch: 12 },  // Código ID
    { wch: 30 },  // Nombre del Producto
    { wch: 25 },  // Empresa Proveedora
    { wch: 18 },  // Cantidad en Stock
    { wch: 16 },  // Estado de Stock
    { wch: 15 },  // Fecha de Registro
    { wch: 15 }   // Hora de Registro
  ];
  ws['!cols'] = colWidths;

  // Crear el libro y agregar la hoja
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  // Nombre de archivo con fecha actual
  const fechaActual = new Date();
  const nombreArchivo = `Inventario_${fechaActual.getDate()}-${fechaActual.getMonth() + 1}-${fechaActual.getFullYear()}_${String(fechaActual.getHours()).padStart(2,'0')}-${String(fechaActual.getMinutes()).padStart(2,'0')}.xlsx`;
  
  // Descargar archivo
  XLSX.writeFile(wb, nombreArchivo);

  // Mostrar mensaje de éxito
  setTimeout(() => {
    alert(`✅ Reporte Excel exportado exitosamente!\n\n📁 Archivo: ${nombreArchivo}\n\n📊 Resumen:\n• Total de productos: ${totalProductos}\n• Total en stock: ${totalStock} unidades\n• Promedio por producto: ${promedioStock} unidades\n• Productos críticos: ${productosCriticos}\n• Sin stock: ${productosSinStock}`);
  }, 100);
}

function formatearFechaExcel(fecha){
  if(!fecha) return 'N/A';
  const d = new Date(fecha);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const año = d.getFullYear();
  return `${dia}/${mes}/${año}`;
}

function formatearHoraExcel(fecha){
  if(!fecha) return 'N/A';
  const d = new Date(fecha);
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const seg = String(d.getSeconds()).padStart(2, '0');
  return `${hora}:${min}:${seg}`;
}