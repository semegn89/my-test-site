/* ----------------------------------------------------
   main.js (точка входа)
   Здесь:
    1) Инициализация IndexedDB (при необходимости)
    2) Основные UI-события (логин/регистрация/гамбургер)
    3) Функции для перехода "Landing Page" ↔ "MainSite"
    4) Роутер loadSubPage(page), который вызывает
       импортированные из других файлов функции:
         - renderPaymentsPage (из payments.js)
         - renderDocumentsPage (из documents.js)
         - renderRatesPage (из rates.js)
         - renderTemplatesPage (из templates.js)
         - renderStatsPage (из stats.js)
         - renderAdminPanel (из adminPanel.js)
         - renderUserCabinet (из userCabinet.js)
----------------------------------------------------- */

import { renderPaymentsPage } from './payments.js';
import { renderDocumentsPage } from './documents.js';
import { renderRatesPage } from './rates.js';
import { renderTemplatesPage } from './templates.js';
import { renderStatsPage } from './stats.js';
import { renderAdminPanel } from './adminPanel.js';
import { renderUserCabinet } from './userCabinet.js';

// +++ import showToast, showPreview из utils.js +++
import { showToast, showPreview } from './utils.js';

export let db = null;

document.addEventListener('DOMContentLoaded', () => {
  initDB()
    .then(() => {
      console.log('IndexedDB готова!');
      mainInit();
    })
    .catch(err => {
      console.error('Ошибка IndexedDB:', err);
      showToast('Ошибка IndexedDB! Работаем урезанно...', 'error');
      mainInit();
    });
});


/* ----------------------------------------------------------------
   ИНИЦИАЛИЗАЦИЯ IndexedDB (опционально)
----------------------------------------------------------------*/
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AgentAppDB', 2);
    request.onupgradeneeded = function (event) {
      db = event.target.result;

      // Создаём stores, если не существуют
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('adminChats')) {
        db.createObjectStore('adminChats', { keyPath: 'chatId', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('companies')) {
        db.createObjectStore('companies', { keyPath: 'id' });
      }
    };

    request.onsuccess = function (e) {
      db = e.target.result;
      resolve(db);
    };
    request.onerror = function (e) {
      reject(e.target.error);
    };
  });
}

/* ----------------------------------------------------------------
   ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ (Landing / MainSite)
----------------------------------------------------------------*/
function mainInit() {
  // Тёмный режим
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }
  // Прячем кнопки входа/регистрации, если уже авторизован
  if (localStorage.getItem('isLoggedIn') === 'true') {
    const authButtons = document.getElementById('authButtons');
    if (authButtons) authButtons.style.display = 'none';
  }

  // Ставим слушатели
  initUIEvents();

  // Рендерим либо "MainSite", либо "LandingPage"
  if (localStorage.getItem('isLoggedIn') === 'true') {
    renderMainSite();
  } else {
    renderLandingPage();
  }
}

/* ----------------------------------------------------------------
   initUIEvents: обработка гамбургера, логина, регистрации ...
----------------------------------------------------------------*/
function initUIEvents() {
  const hamburgerBtn         = document.getElementById('hamburgerBtn');
  const mobileMenu           = document.getElementById('mobileMenu');
  const mobileRegisterBtn    = document.getElementById('mobileRegisterBtn');
  const mobileLoginBtn       = document.getElementById('mobileLoginBtn');
  const registerBtn          = document.getElementById('registerBtn');
  const openLoginBtn         = document.getElementById('openLoginBtn');
  const loginModal           = document.getElementById('loginModal');
  const closeLoginModal      = document.getElementById('closeLoginModal');
  const loginFormModal       = document.getElementById('loginFormModal');
  const registerModal        = document.getElementById('registerModal');
  const closeRegisterModal   = document.getElementById('closeRegisterModal');
  const registerForm         = document.getElementById('registerForm');
  const previewModal         = document.getElementById('previewModal');
  const closePreviewModal    = document.getElementById('closePreviewModal');
  const previewContent       = document.getElementById('previewContent');
  const chatHeader           = document.getElementById('chatHeader');
  const chatBody             = document.getElementById('chatBody');
  const chatMessages         = document.getElementById('chatMessages');
  const sendChatMessageBtn   = document.getElementById('sendChatMessage');
  const chatMessageInput     = document.getElementById('chatMessageInput');

  hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
  });
  mobileRegisterBtn.addEventListener('click', () => {
    showRegisterModal();
    mobileMenu.classList.remove('active');
  });
  mobileLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
    mobileMenu.classList.remove('active');
  });
  registerBtn.addEventListener('click', () => {
    showRegisterModal();
  });
  openLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });
  closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
  window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (e.target === previewModal) {
      previewModal.style.display = 'none';
      previewContent.innerHTML = '';
    }
    if (e.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });
  loginFormModal.addEventListener('submit', handleLoginForm);
  closeRegisterModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
  });
  registerForm.addEventListener('submit', handleRegisterForm);

  // Мини-чат (на Landing)
  chatHeader.addEventListener('click', () => {
    chatBody.style.display = (chatBody.style.display === 'none') ? 'flex' : 'none';
  });
  sendChatMessageBtn.addEventListener('click', sendChatMessage);
  chatMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });
}

/* ----------------------------------------------------------------
   Логика: showRegisterModal, handleLoginForm, handleRegisterForm
----------------------------------------------------------------*/
function showRegisterModal() {
  document.getElementById('registerModal').style.display = 'flex';
}
function handleLoginForm(e) {
  e.preventDefault();
  const login    = e.target.modalEmail.value.trim();
  const password = e.target.modalPassword.value.trim();

  // Админ
  if (login === '123' && password === '123456') {
    const adminUser = { email: 'admin', password: '123456', role: 'admin', feePercent: 0 };
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    document.getElementById('loginModal').style.display = 'none';
    showToast('Вход как Админ!', 'success');
    renderMainSite();
    return;
  }
  // Обычный пользователь
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === login && u.password === password);
  if (user) {
    user.role = 'user';
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    document.getElementById('loginModal').style.display = 'none';
    showToast('Добро пожаловать!', 'success');
    renderMainSite();
  } else {
    showToast('Неверный логин или пароль!', 'error');
  }
}
function handleRegisterForm(e) {
  e.preventDefault();
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const fd = new FormData(e.target);

  const newUser = {
    email: fd.get('rEmail').trim(),
    password: fd.get('rPassword').trim(),
    companyName: fd.get('companyName'),
    inn: fd.get('inn'),
    address: fd.get('address'),
    bankName: fd.get('bankName'),
    bik: fd.get('bik'),
    accountNumber: fd.get('accountNumber'),
    feePercent: 0,
    role: 'user',
    agreementNo: '',
    agreementDate: ''
  };
  if (users.some(u => u.email === newUser.email)) {
    showToast('Логин уже существует!', 'error');
    return;
  }
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  showToast('Регистрация успешна!', 'success');
  document.getElementById('registerModal').style.display = 'none';
  e.target.reset();
}

/* ----------------------------------------------------------------
   Мини-чат (на главной)
----------------------------------------------------------------*/
function sendChatMessage() {
  const chatMessageInput = document.getElementById('chatMessageInput');
  const chatMessages     = document.getElementById('chatMessages');
  const msg = chatMessageInput.value.trim();
  if (!msg) return;
  const div = document.createElement('div');
  div.style.marginBottom = '10px';
  div.innerHTML = `<strong>Вы:</strong> ${msg}`;
  chatMessages.appendChild(div);
  chatMessageInput.value = '';
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* ----------------------------------------------------------------
   Landing Page / Main Site
----------------------------------------------------------------*/
function renderLandingPage() {
  const topNav = document.getElementById('topNav');
  topNav.classList.remove('active');
  topNav.innerHTML = '';

  // Показать блоки Landing
  document.querySelector('.hero').style.display = 'flex';
  document.querySelector('.partners-ticker').style.display = 'block';
  document.querySelector('.features-section').style.display = 'block';
  document.querySelector('.reviews-section').style.display = 'block';
  document.querySelector('.faq-section').style.display = 'block';

  const mainLayout = document.querySelector('.main-layout');
  if (mainLayout) {
    mainLayout.style.display = 'none';
  }
}
function renderMainSite() {
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.partners-ticker').style.display = 'none';
  document.querySelector('.features-section').style.display = 'none';
  document.querySelector('.reviews-section').style.display = 'none';
  document.querySelector('.faq-section').style.display = 'none';

  let mainLayout = document.querySelector('.main-layout');
  if (!mainLayout) {
    mainLayout = document.createElement('div');
    mainLayout.classList.add('main-layout');

    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    let extraMenu = '';
    if (currentUser.role === 'admin') {
      extraMenu = `
        <div class="icon" data-page="adminPanel">
          <div class="icon-img">👑</div>
          <span>Админ-панель</span>
        </div>
      `;
    } else {
      extraMenu = `
        <div class="icon" data-page="userCabinet">
          <div class="icon-img">👤</div>
          <span>Личный кабинет</span>
        </div>
      `;
    }

    mainLayout.innerHTML = `
      <aside class="sidebar">
        <div class="icon" data-page="payments">
          <div class="icon-img">💳</div>
          <span>Платежи</span>
        </div>
        <div class="icon" data-page="stats">
          <div class="icon-img">📊</div>
          <span>Статистика</span>
        </div>
        <div class="icon" data-page="documents">
          <div class="icon-img">📁</div>
          <span>Документы</span>
        </div>
        <div class="icon" data-page="rates">
          <div class="icon-img">💱</div>
          <span>Курсы валют</span>
        </div>
        <div class="icon" data-page="templates">
          <div class="icon-img">📄</div>
          <span>Шаблоны</span>
        </div>
        ${extraMenu}
      </aside>
      <section class="details">
        <h2>Добро пожаловать!</h2>
        <p>Выберите раздел из меню слева.</p>
      </section>
    `;
    document.getElementById('content').appendChild(mainLayout);

    mainLayout.querySelectorAll('.sidebar .icon').forEach(icon => {
      icon.addEventListener('click', () => {
        const page = icon.getAttribute('data-page');
        loadSubPage(page);
      });
    });
  } else {
    mainLayout.style.display = 'flex';
  }

  const topNav = document.getElementById('topNav');
  topNav.classList.add('active');
  topNav.innerHTML = `
    <button id="toggleDarkMode" class="button">Тёмный режим</button>
    <button id="logoutBtn" class="button">Выйти</button>
  `;
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    showToast('Вы вышли из аккаунта.', 'info');
    renderLandingPage();
  });
  document.getElementById('toggleDarkMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  });

  // Скрываем блок authButtons
  const authButtons = document.getElementById('authButtons');
  if (authButtons) authButtons.style.display = 'none';
}

/* ----------------------------------------------------------------
   Роутер подстраниц, импортируем функции из других модулей
----------------------------------------------------------------*/
function loadSubPage(page) {
  const details = document.querySelector('.details');
  details.classList.add('fade-out');
  setTimeout(() => {
    switch (page) {
      case 'payments':       renderPaymentsPage();    break; 
      case 'stats':          renderStatsPage();       break;
      case 'documents':      renderDocumentsPage();   break;
      case 'rates':          renderRatesPage();       break;
      case 'templates':      renderTemplatesPage();   break;
      case 'adminPanel':     renderAdminPanel();      break;
      case 'userCabinet':    renderUserCabinet();     break;
      default:
        details.innerHTML = '<h1>Страница не найдена</h1>';
    }
    details.classList.remove('fade-out');
  }, 300);
}

/* ----------------------------------------------------------------
   Экспорт (если вам нужно где-то забирать mainInit, db и т.п.)
----------------------------------------------------------------*/
export {
  showToast,
  showPreview
  // db уже экспортирован вверху 
};