// global.js – control sesión, logout, dark mode y prevención en login

(function(){
  // IIFE (Immediately Invoked Function Expression)
  // Crea un ámbito privado para evitar conflictos con otras variables globales
  
  document.addEventListener('DOMContentLoaded', ()=>{
    // Espera a que el DOM esté completamente cargado antes de ejecutar el código
    // Esto asegura que todos los elementos HTML existan
    
    // Login page should NOT redirect if we're on index.html
    // Comentario en inglés: La página de login NO debe redirigir si estamos en index.html
    
    const path = window.location.pathname.split('/').pop();
    // Obtiene la ruta actual de la página:
    // window.location.pathname: obtiene la ruta completa (ej: /carpeta/index.html)
    // split('/'): divide la ruta en partes usando '/' como separador
    // pop(): obtiene el último elemento del array (el nombre del archivo)
    // Resultado: 'index.html' o 'menu.html' etc.

    const onLogin = path === '' || path === 'index.html';
    // Variable booleana que es true si estamos en la página de login
    // path === '': cuando la URL es solo el dominio (ej: example.com/)
    // path === 'index.html': cuando estamos específicamente en index.html
    // || es el operador OR lógico

    const sesion = localStorage.getItem('sesionActiva') === 'true';
    // Lee el valor 'sesionActiva' del localStorage
    // localStorage.getItem retorna un string o null
    // === 'true': compara si el valor es exactamente el string 'true'
    // sesion será true si hay sesión activa, false en caso contrario
    
    if(!onLogin && !sesion){
      // Si NO estamos en la página de login (!onLogin)
      // Y NO hay sesión activa (!sesion)
      // && es el operador AND lógico (ambas condiciones deben ser true)
      
      window.location.replace('index.html');
      // Redirige al usuario a la página de login (index.html)
      // replace reemplaza la página actual en el historial (no se puede volver atrás)
      
      return;
      // Sale de la función para no ejecutar el resto del código
    }

    // Logout
    // Comentario que indica el inicio de la sección de cerrar sesión
    
    const btnLogout = document.getElementById('btnLogout');
    // Obtiene el botón de logout del DOM usando su ID
    
    if(btnLogout) btnLogout.addEventListener('click', (e)=>{ 
      // Si el botón existe, agrega un listener para el evento click
      // e es el objeto del evento
      
      e.preventDefault(); 
      // Previene el comportamiento por defecto del botón
      // Esto evita que el formulario se envíe o la página se recargue
      
      localStorage.removeItem('sesionActiva'); 
      // Elimina el item 'sesionActiva' del localStorage
      // Esto cierra la sesión del usuario
      
      window.location.replace('index.html'); 
      // Redirige al usuario a la página de login
      // replace evita que pueda volver con el botón atrás del navegador
    });

    // Dark mode
    // Comentario que indica el inicio de la sección de modo oscuro
    
    const btnDark = document.getElementById('btnDark');
    // Obtiene el botón de modo oscuro del DOM usando su ID
    
    if(btnDark){
      // Si el botón existe
      
      if(localStorage.getItem('dark')==='1') document.body.classList.add('dark');
      // Lee la preferencia del modo oscuro del localStorage
      // Si el valor es '1' (modo oscuro activado)
      // Agrega la clase 'dark' al elemento body
      // classList.add agrega una clase CSS sin eliminar las existentes
      
      btnDark.addEventListener('click', ()=>{
        // Agrega un listener al botón para detectar clicks
        
        document.body.classList.toggle('dark');
        // toggle alterna la clase 'dark' en el body:
        // - Si existe, la elimina
        // - Si no existe, la agrega
        // Esto cambia entre modo claro y oscuro
        
        localStorage.setItem('dark', document.body.classList.contains('dark') ? '1' : '0');
        // Guarda la preferencia en localStorage:
        // classList.contains('dark'): verifica si el body tiene la clase 'dark'
        // ? '1' : '0': operador ternario
        //   - Si contiene 'dark', guarda '1'
        //   - Si no contiene 'dark', guarda '0'
        // setItem guarda el valor en localStorage para recordar la preferencia
      });
    }
  });
})();