// global.js — control sesión, logout, dark mode y prevención en login
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    // Login page should NOT redirect if we're on index.html
    const path = window.location.pathname.split('/').pop();
    const onLogin = path === '' || path === 'index.html';

    const sesion = localStorage.getItem('sesionActiva') === 'true';
    if(!onLogin && !sesion){
      window.location.replace('index.html');
      return;
    }

    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) btnLogout.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('sesionActiva'); window.location.replace('index.html'); });

    // Dark mode
    const btnDark = document.getElementById('btnDark');
    if(btnDark){
      if(localStorage.getItem('dark')==='1') document.body.classList.add('dark');
      btnDark.addEventListener('click', ()=>{
        document.body.classList.toggle('dark');
        localStorage.setItem('dark', document.body.classList.contains('dark') ? '1' : '0');
      });
    }
  });
})();