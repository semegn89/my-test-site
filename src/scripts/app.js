document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------------
     ГЛОБАЛЬНЫЕ ЭЛЕМЕНТЫ / ПЕРЕМЕННЫЕ
  ----------------------------------------------------------------*/
  const content = document.getElementById('content');
  const topNav = document.getElementById('topNav');
  const toastContainer = document.getElementById('toastContainer');

  // Мобильное меню
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileRegisterBtn = document.getElementById('mobileRegisterBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');

  // Кнопки “Регистрация / Войти”
  const registerBtn = document.getElementById('registerBtn');
  const openLoginBtn = document.getElementById('openLoginBtn');

  // Модалки логина/регистрации
  const loginModal = document.getElementById('loginModal');
  const closeLoginModal = document.getElementById('closeLoginModal');
  const loginFormModal = document.getElementById('loginFormModal');

  const registerModal = document.getElementById('registerModal');
  const closeRegisterModal = document.getElementById('closeRegisterModal');
  const registerForm = document.getElementById('registerForm');

  // Модалка предпросмотра
  const previewModal = document.getElementById('previewModal');
  const closePreviewModal = document.getElementById('closePreviewModal');
  const previewContent = document.getElementById('previewContent');

  // Мини-чат (правый нижний угол)
  const chatHeader = document.getElementById('chatHeader');
  const chatBody = document.getElementById('chatBody');
  const chatMessages = document.getElementById('chatMessages');
  const sendChatMessageBtn = document.getElementById('sendChatMessage');
  const chatMessageInput = document.getElementById('chatMessageInput');

  // Hero-кнопки
  const heroBtn = document.getElementById('heroBtn');
  const startNowBtn = document.getElementById('startNowBtn');

  /* ----------------------------------------------------------------
     ТЁМНЫЙ РЕЖИМ
  ----------------------------------------------------------------*/
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  /* Если уже залогинен => скрываем кнопки входа/регистрации */
  if (localStorage.getItem('isLoggedIn') === 'true') {
    const authButtons = document.getElementById('authButtons');
    if (authButtons) authButtons.style.display = 'none';
  }

  /* ----------------------------------------------------------------
     Мобильное меню
  ----------------------------------------------------------------*/
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

  /* ----------------------------------------------------------------
     Кнопки “Регистрация / Войти” (десктоп)
  ----------------------------------------------------------------*/
  registerBtn.addEventListener('click', () => {
    showRegisterModal();
  });
  openLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });

  /* ----------------------------------------------------------------
     Модалка ЛОГИН
  ----------------------------------------------------------------*/
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

  loginFormModal.addEventListener('submit', (e) => {
    e.preventDefault();
    const login = e.target.modalEmail.value.trim();
    const password = e.target.modalPassword.value.trim();

    // Если логин=123, пароль=123456 => админ
    if (login === '123' && password === '123456') {
      const adminUser = {
        email: 'admin',
        password: '123456',
        role: 'admin',
        feePercent: 0
      };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      loginModal.style.display = 'none';
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
      loginModal.style.display = 'none';
      showToast('Добро пожаловать!', 'success');
      renderMainSite();
    } else {
      showToast('Неверный логин или пароль!', 'error');
    }
  });

  /* ----------------------------------------------------------------
     Модалка РЕГИСТРАЦИИ
  ----------------------------------------------------------------*/
  function showRegisterModal() {
    registerModal.style.display = 'flex';
  }
  closeRegisterModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
  });
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    let users = JSON.parse(localStorage.getItem('users')) || [];

    const newUser = {
      email: formData.get('rEmail').trim(),
      password: formData.get('rPassword').trim(),
      companyName: formData.get('companyName'),
      inn: formData.get('inn'),
      address: formData.get('address'),
      bankName: formData.get('bankName'),
      bik: formData.get('bik'),
      accountNumber: formData.get('accountNumber'),
      feePercent: 0,
      role: 'user',
      // поля договора
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
    registerModal.style.display = 'none';
    registerForm.reset();
  });

  /* ----------------------------------------------------------------
     Мини-ЧАТ (правый нижний угол)
  ----------------------------------------------------------------*/
  chatHeader.addEventListener('click', () => {
    chatBody.style.display = (chatBody.style.display === 'none') ? 'flex' : 'none';
  });
  sendChatMessageBtn.addEventListener('click', sendChatMessage);
  chatMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });

  function sendChatMessage() {
    const msg = chatMessageInput.value.trim();
    if (!msg) return;
    const msgElem = document.createElement('div');
    msgElem.style.marginBottom = '10px';
    msgElem.innerHTML = `<strong>Вы:</strong> ${msg}`;
    chatMessages.appendChild(msgElem);
    chatMessageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /* ----------------------------------------------------------------
     Hero-кнопки
  ----------------------------------------------------------------*/
  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      const featuresSection = document.querySelector('.features-section');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  if (startNowBtn) {
    startNowBtn.addEventListener('click', () => {
      showRegisterModal();
    });
  }

  /* ----------------------------------------------------------------
     FAQ (аккордеон)
  ----------------------------------------------------------------*/
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      content.style.display = (content.style.display === 'block') ? 'none' : 'block';
    });
  });

  /* ----------------------------------------------------------------
     Проверка авторизации
  ----------------------------------------------------------------*/
  if (localStorage.getItem('isLoggedIn') === 'true') {
    renderMainSite();
  } else {
    renderLandingPage();
  }

  function renderLandingPage() {
    topNav.classList.remove('active');
    topNav.innerHTML = '';
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

  /* ----------------------------------------------------------------
     ОСНОВНАЯ ЧАСТЬ (ЛК / АДМИН)
  ----------------------------------------------------------------*/
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

      // Убрали "Обратная связь"
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
      content.appendChild(mainLayout);

      mainLayout.querySelectorAll('.sidebar .icon').forEach(icon => {
        icon.addEventListener('click', () => {
          const page = icon.getAttribute('data-page');
          loadSubPage(page);
        });
      });
    } else {
      mainLayout.style.display = 'flex';
    }

    topNav.classList.add('active');
    const authButtons = document.getElementById('authButtons');
    if (authButtons) authButtons.style.display = 'none';

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
  }

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
          details.innerHTML = `<h1>Страница не найдена</h1>`;
      }
      details.classList.remove('fade-out');
    }, 300);
  }

  /* ----------------------------------------------------------------
     TOAST
  ----------------------------------------------------------------*/
  function showToast(msg, type='info') {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    if (type === 'success') toast.style.background = '#2ecc71';
    if (type === 'error')   toast.style.background = '#e74c3c';
    if (type === 'info')    toast.style.background = '#3498db';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 4500);
  }

  /* ----------------------------------------------------------------
     Предпросмотр (модалка)
  ----------------------------------------------------------------*/
  function showPreview(html) {
    previewContent.innerHTML = html;
    previewModal.style.display = 'flex';
  }
  closePreviewModal.addEventListener('click', () => {
    previewModal.style.display = 'none';
    previewContent.innerHTML = '';
  });

  /* ----------------------------------------------------------------
     Генерация УНП
  ----------------------------------------------------------------*/
  function generatePaymentId() {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `УНП-${rand}`;
  }

  /* ----------------------------------------------------------------
     Личный кабинет (пользователь)
     => agreementNo, agreementDate, чат со скрепочкой
  ----------------------------------------------------------------*/
  function renderUserCabinet() {
    const details = document.querySelector('.details');
    let curUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    if (!curUser || curUser.role !== 'user') {
      details.innerHTML = '<h1>Доступно только для пользователей.</h1>';
      return;
    }

    details.innerHTML = `
      <h1>Личный кабинет</h1>
      <p><strong>Email:</strong> ${curUser.email}</p>
      <p><strong>Компания:</strong> ${curUser.companyName||''}</p>
      <p><strong>ИНН:</strong> ${curUser.inn||''}</p>
      <p><strong>Адрес:</strong> ${curUser.address||''}</p>
      <p><strong>Банк:</strong> ${curUser.bankName||''}</p>
      <p><strong>БИК:</strong> ${curUser.bik||''}</p>
      <p><strong>Счёт:</strong> ${curUser.accountNumber||''}</p>
      <p><strong>feePercent:</strong> ${curUser.feePercent||0}%</p>
      <p><strong>Договор №:</strong> ${curUser.agreementNo||''}</p>
      <p><strong>Дата договора:</strong> ${curUser.agreementDate||''}</p>

      <button id="editProfileBtn" class="button">Редактировать</button>
      <div id="editProfileArea" style="display:none; margin-top:20px;">
        <form id="profileForm">
          <!-- При необходимости разрешить редактировать только часть полей (agreementNo/date можно disabled) -->
          <div class="form-row">
            <label>Компания:</label>
            <input type="text" name="companyName" value="${curUser.companyName||''}">
          </div>
          <div class="form-row">
            <label>ИНН:</label>
            <input type="text" name="inn" value="${curUser.inn||''}">
          </div>
          <div class="form-row">
            <label>Адрес:</label>
            <input type="text" name="address" value="${curUser.address||''}">
          </div>
          <div class="form-row">
            <label>Банк:</label>
            <input type="text" name="bankName" value="${curUser.bankName||''}">
          </div>
          <div class="form-row">
            <label>БИК:</label>
            <input type="text" name="bik" value="${curUser.bik||''}">
          </div>
          <div class="form-row">
            <label>Счёт:</label>
            <input type="text" name="accountNumber" value="${curUser.accountNumber||''}">
          </div>
          <!-- Считаем, что эти поля редактирует только админ, поэтому disabled -->
          <div class="form-row">
            <label>Договор №:</label>
            <input type="text" name="agreementNo" value="${curUser.agreementNo||''}" disabled>
          </div>
          <div class="form-row">
            <label>Дата договора:</label>
            <input type="text" name="agreementDate" value="${curUser.agreementDate||''}" disabled>
          </div>

          <button type="submit" class="button">Сохранить</button>
          <button type="button" id="cancelProfileEdit" class="button button-outline" style="margin-left:10px;">Отмена</button>
        </form>
      </div>

      <hr>
      <h3>Чат с админом</h3>
      <div id="userChatBox" style="border:1px solid #ccc; border-radius:6px; padding:10px; max-height:300px; overflow-y:auto;"></div>
      <div style="display:flex; gap:5px; margin-top:10px;">
        <label for="userChatFile" class="button button-sm button-outline" style="width:auto;">📎</label>
        <input type="file" id="userChatFile" style="display:none;">
        <input type="text" id="userChatInput" placeholder="Написать администратору..." style="flex:1;">
        <button id="userChatSendBtn" class="button button-sm">Отправить</button>
      </div>
    `;

    // Редактирование профиля
    const editProfileBtn = details.querySelector('#editProfileBtn');
    const editProfileArea = details.querySelector('#editProfileArea');
    const profileForm = details.querySelector('#profileForm');
    const cancelProfileEdit = details.querySelector('#cancelProfileEdit');

    editProfileBtn.addEventListener('click', () => {
      editProfileArea.style.display = 'block';
    });
    cancelProfileEdit.addEventListener('click', () => {
      editProfileArea.style.display = 'none';
      profileForm.reset();
    });
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let users = JSON.parse(localStorage.getItem('users')) || [];
      let obj = JSON.parse(localStorage.getItem('currentUser')) || {};
      const fd = new FormData(profileForm);

      obj.companyName = fd.get('companyName')||'';
      obj.inn = fd.get('inn')||'';
      obj.address = fd.get('address')||'';
      obj.bankName = fd.get('bankName')||'';
      obj.bik = fd.get('bik')||'';
      obj.accountNumber = fd.get('accountNumber')||'';
      // agreementNo/date – не меняем, т.к. disabled

      const idx = users.findIndex(u => u.email === obj.email);
      if (idx !== -1) {
        users[idx] = obj;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(obj));
        showToast('Данные обновлены!', 'success');
        renderUserCabinet();
      }
    });

    // Чат user->admin
    initUserAdminChat();

    function initUserAdminChat() {
      const chatBox = details.querySelector('#userChatBox');
      const chatFile = details.querySelector('#userChatFile');
      const chatInput = details.querySelector('#userChatInput');
      const chatSendBtn = details.querySelector('#userChatSendBtn');

      let allChats = JSON.parse(localStorage.getItem('adminChats')) || {};
      let userEmail = curUser.email;
      if (!allChats[userEmail]) {
        allChats[userEmail] = [];
      }
      let chatArr = allChats[userEmail];

      function renderChat() {
        chatBox.innerHTML = '';
        chatArr.forEach(msg => {
          let div = document.createElement('div');
          div.style.marginBottom = '8px';

          if (msg.from === 'user') {
            // справа
            div.style.textAlign = 'right';
            if (msg.fileName) {
              // файл
              div.innerHTML = `<div style="display:inline-block;background:#007aff;color:#fff;padding:6px 10px;border-radius:16px;">
                <strong>Вы (файл):</strong> 
                <a href="${msg.fileData}" download="${msg.fileName}" style="color:#fff;">${msg.fileName}</a>
              </div>`;
            } else {
              // текст
              div.innerHTML = `<div style="display:inline-block;background:#007aff;color:#fff;padding:6px 10px;border-radius:16px;">
                ${msg.text}
              </div>`;
            }
          } else {
            // admin
            div.style.textAlign = 'left';
            if (msg.fileName) {
              div.innerHTML = `<div style="display:inline-block;background:#eee;color:#333;padding:6px 10px;border-radius:16px;">
                <strong>Админ (файл):</strong> 
                <a href="${msg.fileData}" download="${msg.fileName}">${msg.fileName}</a>
              </div>`;
            } else {
              div.innerHTML = `<div style="display:inline-block;background:#eee;color:#333;padding:6px 10px;border-radius:16px;">
                Админ: ${msg.text}
              </div>`;
            }
          }
          chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
      }
      renderChat();

      chatSendBtn.addEventListener('click', () => {
        const file = chatFile.files[0];
        const txt = chatInput.value.trim();
        if (!file && !txt) {
          showToast('Введите текст или выберите файл', 'error');
          return;
        }
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            let dataURL = e.target.result;
            let msgObj = {
              from: 'user',
              text: '',
              fileName: file.name,
              fileData: dataURL,
              date: new Date().toLocaleString()
            };
            chatArr.push(msgObj);
            allChats[userEmail] = chatArr;
            localStorage.setItem('adminChats', JSON.stringify(allChats));
            chatFile.value = '';
            chatInput.value = '';
            renderChat();
          };
          reader.readAsDataURL(file);
        } else {
          let msgObj = {
            from: 'user',
            text: txt,
            fileName: '',
            fileData: '',
            date: new Date().toLocaleString()
          };
          chatArr.push(msgObj);
          allChats[userEmail] = chatArr;
          localStorage.setItem('adminChats', JSON.stringify(allChats));
          chatInput.value = '';
          renderChat();
        }
      });
    }
  }

  /* ----------------------------------------------------------------
     АДМИН-ПАНЕЛЬ
  ----------------------------------------------------------------*/
  function renderAdminPanel() {
    const details = document.querySelector('.details');
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    if (!currentUser || currentUser.role !== 'admin') {
      details.innerHTML = `<h1>Доступ запрещён. Вы не админ.</h1>`;
      return;
    }

    details.innerHTML = `
      <h1>Админ-панель</h1>
      <p>Управляйте пользователями, платежами, документами, шаблонами, а также просматривайте чаты.</p>
      <div style="margin-top:20px;" id="adminActions"></div>
    `;
    const adminActions = details.querySelector('#adminActions');
    adminActions.innerHTML = `
      <button id="manageChatsBtn" class="button">Чаты</button>
      <button id="manageUsersBtn" class="button" style="margin-left:10px;">Пользователи</button>
      <button id="manageRatesBtn" class="button" style="margin-left:10px;">Редактировать курсы</button>
      <div id="adminContent" style="margin-top:30px;"></div>
    `;

    const manageChatsBtn = adminActions.querySelector('#manageChatsBtn');
    const manageUsersBtn = adminActions.querySelector('#manageUsersBtn');
    const manageRatesBtn = adminActions.querySelector('#manageRatesBtn');
    const adminContent = adminActions.querySelector('#adminContent');

    manageChatsBtn.addEventListener('click', () => {
      renderAdminChats();
    });
    manageUsersBtn.addEventListener('click', () => {
      renderAdminUsers();
    });
    manageRatesBtn.addEventListener('click', () => {
      renderAdminRates();
    });

    // 1) Чаты
    function renderAdminChats() {
      let allChats = JSON.parse(localStorage.getItem('adminChats')) || {};
      let userEmails = Object.keys(allChats);
      if (userEmails.length === 0) {
        adminContent.innerHTML = '<p>Нет чатов с пользователями.</p>';
        return;
      }
      let html = '<h3>Чаты с пользователями:</h3><ul>';
      userEmails.forEach(email => {
        html += `
          <li style="margin-bottom:10px;">
            ${email}
            <button class="openChatBtn button button-sm" data-email="${email}" style="margin-left:10px;">Открыть чат</button>
          </li>
        `;
      });
      html += '</ul>';
      html += `<div id="chatDetail" style="margin-top:20px; border:1px solid #ddd; padding:10px; border-radius:6px; display:none;"></div>`;
      adminContent.innerHTML = html;

      adminContent.querySelectorAll('.openChatBtn').forEach(btn => {
        btn.addEventListener('click', function() {
          const email = this.getAttribute('data-email');
          showAdminChatDetail(email);
        });
      });
    }
    function showAdminChatDetail(userEmail) {
      const chatDetail = adminContent.querySelector('#chatDetail');
      chatDetail.style.display = 'block';
      chatDetail.innerHTML = `
        <h4>Чат с ${userEmail}</h4>
        <div id="adminChatHistory" style="border:1px solid #ccc; height:200px; overflow-y:auto; margin-bottom:10px; padding:10px;"></div>
        <div style="display:flex; gap:5px;">
          <input type="file" id="adminChatFile" style="width:160px;" />
          <input type="text" id="adminMsgInput" placeholder="Ответ пользователю..." style="flex:1;">
          <button id="adminSendBtn" class="button button-sm">Отправить</button>
        </div>
      `;

      let allChats = JSON.parse(localStorage.getItem('adminChats')) || {};
      let userChat = allChats[userEmail] || [];
      const adminChatHistory = chatDetail.querySelector('#adminChatHistory');
      const adminMsgInput = chatDetail.querySelector('#adminMsgInput');
      const adminChatFile = chatDetail.querySelector('#adminChatFile');
      const adminSendBtn = chatDetail.querySelector('#adminSendBtn');

      function renderAdminMessages() {
        let html = '';
        userChat.forEach(msg => {
          if (msg.from === 'user') {
            if (msg.fileName) {
              // user + file
              html += `<div style="text-align:left; margin-bottom:6px;">
                <span style="display:inline-block;background:#007aff;color:#fff;padding:8px 12px;border-radius:16px;">
                  User(файл): <a href="${msg.fileData}" style="color:#fff;" download="${msg.fileName}">${msg.fileName}</a>
                </span>
              </div>`;
            } else {
              // user + text
              html += `<div style="text-align:left; margin-bottom:6px;">
                <span style="display:inline-block;background:#007aff;color:#fff;padding:8px 12px;border-radius:16px;">
                  User: ${msg.text}
                </span>
              </div>`;
            }
          } else {
            // admin
            if (msg.fileName) {
              // admin + file
              html += `<div style="text-align:right; margin-bottom:6px;">
                <span style="display:inline-block;background:#eee;color:#333;padding:8px 12px;border-radius:16px;">
                  Админ(файл): <a href="${msg.fileData}" download="${msg.fileName}">${msg.fileName}</a>
                </span>
              </div>`;
            } else {
              // admin + text
              html += `<div style="text-align:right; margin-bottom:6px;">
                <span style="display:inline-block;background:#eee;color:#333;padding:8px 12px;border-radius:16px;">
                  ${msg.text}
                </span>
              </div>`;
            }
          }
        });
        adminChatHistory.innerHTML = html;
        adminChatHistory.scrollTop = adminChatHistory.scrollHeight;
      }
      renderAdminMessages();

      adminSendBtn.addEventListener('click', () => {
        const txt = adminMsgInput.value.trim();
        const file = adminChatFile.files[0];
        if (!file && !txt) {
          showToast('Введите текст или выберите файл', 'error');
          return;
        }
        if (file) {
          let reader = new FileReader();
          reader.onload = function(e) {
            let dataURL = e.target.result;
            let msgObj = {
              from: 'admin',
              text: '',
              fileName: file.name,
              fileData: dataURL,
              date: new Date().toLocaleString()
            };
            userChat.push(msgObj);
            allChats[userEmail] = userChat;
            localStorage.setItem('adminChats', JSON.stringify(allChats));
            adminChatFile.value = '';
            adminMsgInput.value = '';
            renderAdminMessages();
          };
          reader.readAsDataURL(file);
        } else {
          let msgObj = {
            from: 'admin',
            text: txt,
            fileName: '',
            fileData: '',
            date: new Date().toLocaleString()
          };
          userChat.push(msgObj);
          allChats[userEmail] = userChat;
          localStorage.setItem('adminChats', JSON.stringify(allChats));
          adminMsgInput.value = '';
          renderAdminMessages();
        }
      });
    }

    // 2) Управление пользователями (редактирование feePercent, agreementNo, agreementDate)
    function renderAdminUsers() {
      let users = JSON.parse(localStorage.getItem('users')) || [];
      let normalUsers = users.filter(u => u.role !== 'admin');
      if (!normalUsers.length) {
        adminContent.innerHTML = '<p>Нет зарегистрированных пользователей (кроме админа).</p>';
        return;
      }
      let html = '<h3>Список пользователей</h3><ul>';
      normalUsers.forEach((u, i) => {
        html += `
          <li style="margin-bottom:8px;">
            <strong>${u.email}</strong> (fee:${u.feePercent}%), договор: №${u.agreementNo||'—'} от ${u.agreementDate||'—'}
            <button class="editUserBtn button button-sm" data-email="${u.email}" style="margin-left:10px;">Ред.</button>
          </li>
        `;
      });
      html += '</ul><div id="editUserArea"></div>';
      adminContent.innerHTML = html;

      adminContent.querySelectorAll('.editUserBtn').forEach(btn => {
        btn.addEventListener('click', function() {
          const email = this.getAttribute('data-email');
          showEditUserForm(email);
        });
      });
    }

    function showEditUserForm(userEmail) {
      let users = JSON.parse(localStorage.getItem('users')) || [];
      let userObj = users.find(u => u.email === userEmail);
      if (!userObj) {
        showToast('Пользователь не найден', 'error');
        return;
      }
      const editUserArea = document.getElementById('editUserArea');
      editUserArea.innerHTML = `
        <h4>Редактировать ${userObj.email}</h4>
        <form id="adminEditUserForm">
          <div class="form-row">
            <label>feePercent:</label>
            <input type="number" step="0.01" name="feePercent" value="${userObj.feePercent||0}">
          </div>
          <div class="form-row">
            <label>Договор №:</label>
            <input type="text" name="agreementNo" value="${userObj.agreementNo||''}">
          </div>
          <div class="form-row">
            <label>Дата договора:</label>
            <input type="text" name="agreementDate" value="${userObj.agreementDate||''}">
          </div>
          <button type="submit" class="button">Сохранить</button>
        </form>
      `;
      const adminEditUserForm = editUserArea.querySelector('#adminEditUserForm');
      adminEditUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(adminEditUserForm);
        let newFee = parseFloat(fd.get('feePercent'))||0;
        let newAgrNo = fd.get('agreementNo')||'';
        let newAgrDate = fd.get('agreementDate')||'';

        let idx = users.findIndex(u => u.email === userEmail);
        if (idx !== -1) {
          users[idx].feePercent = newFee;
          users[idx].agreementNo = newAgrNo;
          users[idx].agreementDate = newAgrDate;
          localStorage.setItem('users', JSON.stringify(users));
          showToast('Пользователь обновлён!', 'success');
        }
      });
    }

    // 3) Редактирование курсов
    function renderAdminRates() {
      let defaultRates = { RUB:1, AED:22, USD:88, EUR:94, CNY:14, GBP:122 };
      let rates = JSON.parse(localStorage.getItem('adminRates')) || defaultRates;
      adminContent.innerHTML = `
        <h3>Редактировать курсы (1 Валюта = X RUB)</h3>
        <form id="editRatesForm">
          <div class="form-row">
            <label>AED:</label>
            <input type="number" step="0.01" name="AED" value="${rates.AED}">
          </div>
          <div class="form-row">
            <label>USD:</label>
            <input type="number" step="0.01" name="USD" value="${rates.USD}">
          </div>
          <div class="form-row">
            <label>EUR:</label>
            <input type="number" step="0.01" name="EUR" value="${rates.EUR}">
          </div>
          <div class="form-row">
            <label>CNY:</label>
            <input type="number" step="0.01" name="CNY" value="${rates.CNY}">
          </div>
          <div class="form-row">
            <label>GBP:</label>
            <input type="number" step="0.01" name="GBP" value="${rates.GBP}">
          </div>
          <button type="submit" class="button">Сохранить</button>
        </form>
      `;
      const editRatesForm = document.getElementById('editRatesForm');
      editRatesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(editRatesForm);
        let newRates = {
          RUB:1,
          AED:parseFloat(fd.get('AED'))||22,
          USD:parseFloat(fd.get('USD'))||88,
          EUR:parseFloat(fd.get('EUR'))||94,
          CNY:parseFloat(fd.get('CNY'))||14,
          GBP:parseFloat(fd.get('GBP'))||122
        };
        localStorage.setItem('adminRates', JSON.stringify(newRates));
        showToast('Курсы валют обновлены!', 'success');
      });
    }
  }

  /* ----------------------------------------------------------------
     ПЛАТЕЖИ
     - Цвет для каждого статуса
     - Поручение/Отчёт: учитываем user.agreementNo/agreementDate
  ----------------------------------------------------------------*/
  function renderPaymentsPage() {
    const details = document.querySelector('.details');
    const curUser = JSON.parse(localStorage.getItem('currentUser'))||{};
    const isAdmin = (curUser.role==='admin');

    details.innerHTML = `
      <h1>Платежи</h1>
      <div style="display:flex; gap:10px;">
        <button id="createPayBtn" class="button">Создать платеж</button>
        <button id="exportCsvBtn" class="button">Экспорт CSV</button>
        <select id="statusFilter" class="button">
          <option value="">Все статусы</option>
          <option value="Создан">Создан</option>
          <option value="Принят">Принят</option>
          <option value="В обработке">В обработке</option>
          <option value="Запрос документов">Запрос документов</option>
          <option value="Исполнен">Исполнен</option>
          <option value="Возвращен отправителю">Возвращен отправителю</option>
        </select>
      </div>
      <div id="payFormDiv" style="display:none; margin-top:20px;">
        <h3 id="payFormTitle">Новый платеж</h3>
        <form id="payForm">
          <div class="form-row">
            <label>Назначение:</label>
            <input type="text" name="purpose" required>
          </div>
          <div class="form-row">
            <label>Контр/инвойс:</label>
            <input type="text" name="contractInvoice">
          </div>
          <div class="form-row">
            <label>SWIFT:</label>
            <input type="text" name="swift" required>
          </div>
          <div class="form-row">
            <label>Счёт получателя:</label>
            <input type="text" name="account" required>
          </div>
          <div class="form-row">
            <label>Получатель:</label>
            <input type="text" name="receiverName" required>
          </div>
          <div class="form-row">
            <label>Адрес получателя:</label>
            <input type="text" name="receiverAddress" required>
          </div>
          <div class="form-row">
            <label>Страна получателя:</label>
            <input type="text" name="receiverCountry" required>
          </div>
          <div class="form-row">
            <label>Сумма:</label>
            <input type="number" step="0.01" name="amount" required>
          </div>
          <div class="form-row">
            <label>Валюта:</label>
            <select name="currency">
              <option value="RUB">RUB</option>
              <option value="AED">AED</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CNY">CNY</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div class="form-row">
            <label>Документы:</label>
            <input type="file" name="paymentDocs" multiple>
          </div>
          ${
            isAdmin ? `
            <div class="form-row">
              <label>Статус:</label>
              <select name="status">
                <option value="Создан">Создан</option>
                <option value="Принят">Принят</option>
                <option value="В обработке">В обработке</option>
                <option value="Запрос документов">Запрос документов</option>
                <option value="Исполнен">Исполнен</option>
                <option value="Возвращен отправителю">Возвращен отправителю</option>
              </select>
            </div>
            ` : ``
          }
          <button type="submit" class="button">Сохранить</button>
          <button type="button" id="cancelEditBtn" class="button button-outline" style="margin-left:10px; display:none;">Отмена</button>
        </form>
      </div>
      <div id="paysList" style="margin-top:20px;"></div>
    `;

    const createPayBtn = details.querySelector('#createPayBtn');
    const exportCsvBtn = details.querySelector('#exportCsvBtn');
    const statusFilter = details.querySelector('#statusFilter');
    const payFormDiv = details.querySelector('#payFormDiv');
    const payFormTitle = details.querySelector('#payFormTitle');
    const payForm = details.querySelector('#payForm');
    const cancelEditBtn = details.querySelector('#cancelEditBtn');
    const paysList = details.querySelector('#paysList');

    let editingIndex = null;

    createPayBtn.addEventListener('click', () => {
      editingIndex = null;
      payForm.reset();
      payFormTitle.textContent = 'Новый платеж';
      cancelEditBtn.style.display = 'none';
      payFormDiv.style.display = 'block';
    });
    cancelEditBtn.addEventListener('click', () => {
      payForm.reset();
      payFormDiv.style.display = 'none';
      editingIndex = null;
    });
    statusFilter.addEventListener('change', () => {
      renderPaymentsList();
    });

    payForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let payments = JSON.parse(localStorage.getItem('payments')) || [];
      let docs = JSON.parse(localStorage.getItem('documents')) || [];
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const curUser = JSON.parse(localStorage.getItem('currentUser')) || {};

      const fd = new FormData(payForm);
      let feePercent = 0;
      if (isAdmin) {
        feePercent = 0; // или как нужно
      } else {
        // Поиск у текущего
        const found = users.find(u => u.email === curUser.email);
        feePercent = found ? found.feePercent||0 : 0;
      }

      let payStatus = 'Создан';
      if (isAdmin) {
        payStatus = fd.get('status') || 'Создан';
      }

      const payObj = {
        id: editingIndex===null ? generatePaymentId() : '',
        purpose: fd.get('purpose'),
        contractInvoice: fd.get('contractInvoice') || '',
        swift: fd.get('swift'),
        account: fd.get('account'),
        receiverName: fd.get('receiverName'),
        receiverAddress: fd.get('receiverAddress'),
        receiverCountry: fd.get('receiverCountry'),
        amount: parseFloat(fd.get('amount')),
        currency: fd.get('currency'),
        date: new Date().toLocaleString(),
        status: payStatus,
        docs: [],
        feePercent: feePercent,
        ownerEmail: curUser.email
      };

      const fileList = fd.getAll('paymentDocs');

      function handleFile(i){
        if(i>=fileList.length){
          finalize();
          return;
        }
        let file = fileList[i];
        if(!(file instanceof File)){
          handleFile(i+1);
          return;
        }
        let reader=new FileReader();
        reader.onload=function(ev){
          let dataURL=ev.target.result;
          let docId=Date.now()+'-'+i;
          let docName=`${payObj.id} от ${payObj.date} — ${file.name}`;
          docs.push({
            id: docId,
            name: docName,
            data: dataURL,
            linkedPaymentId: (editingIndex===null) ? payObj.id : ''
          });
          payObj.docs.push(docId);
          localStorage.setItem('documents', JSON.stringify(docs));
          handleFile(i+1);
        };
        reader.readAsDataURL(file);
      }
      handleFile(0);

      function finalize(){
        let pays=JSON.parse(localStorage.getItem('payments'))||[];
        if(editingIndex===null){
          // новый
          pays.push(payObj);
          showToast(`Платёж ${payObj.id} создан!`,'success');
        } else {
          // редактируем
          pays.sort((a,b)=> new Date(b.date)- new Date(a.date));
          let oldId=pays[editingIndex].id;
          payObj.id=oldId;
          // объединим docs
          payObj.docs=[...pays[editingIndex].docs, ...payObj.docs];
          payObj.ownerEmail=pays[editingIndex].ownerEmail;
          pays[editingIndex]=payObj;
          showToast(`Платёж ${oldId} обновлён!`,'success');

          // Теперь подправим linkedPaymentId для новых
          let allDocs=JSON.parse(localStorage.getItem('documents'))||[];
          for(let d of allDocs){
            if(d.linkedPaymentId==='' && d.name.includes(payObj.date)){
              d.linkedPaymentId=oldId;
            }
          }
          localStorage.setItem('documents',JSON.stringify(allDocs));
        }
        localStorage.setItem('payments', JSON.stringify(pays));
        payForm.reset();
        payFormDiv.style.display='none';
        editingIndex=null;
        renderPaymentsList();
      }
    });

    exportCsvBtn.addEventListener('click', ()=>{
      let pays=JSON.parse(localStorage.getItem('payments'))||[];
      if(!pays.length){
        showToast('Нет данных для экспорта!','info');
        return;
      }
      let csv="data:text/csv;charset=utf-8,ID,Purpose,Contract,SWIFT,Account,Receiver,Amount,Currency,Status,feePercent,Date\n";
      pays.forEach(p=>{
        csv+=`${p.id},${p.purpose},${p.contractInvoice},${p.swift},${p.account},${p.receiverName},${p.amount},${p.currency},${p.status},${p.feePercent},${p.date}\n`;
      });
      let uri=encodeURI(csv);
      let link=document.createElement('a');
      link.setAttribute('href', uri);
      link.setAttribute('download','payments.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    function getStatusColor(st){
      switch(st){
        case 'Создан': return 'rgba(255,228,196,0.5)';
        case 'Принят': return 'rgba(144,238,144,0.5)';
        case 'В обработке': return 'rgba(173,216,230,0.5)';
        case 'Запрос документов': return 'rgba(255,182,193,0.5)';
        case 'Исполнен': return 'rgba(240,230,140,0.5)';
        case 'Возвращен отправителю': return 'rgba(221,160,221,0.5)';
        default: return 'rgba(255,255,255,0.5)';
      }
    }

    function renderPaymentsList(){
      let pays=JSON.parse(localStorage.getItem('payments'))||[];
      const user=JSON.parse(localStorage.getItem('currentUser'))||{};
      if(user.role!=='admin'){
        pays=pays.filter(x=> x.ownerEmail===user.email);
      }
      pays.sort((a,b)=> new Date(b.date)- new Date(a.date));
      const filterVal=statusFilter.value;
      if(filterVal){
        pays=pays.filter(x=> x.status===filterVal);
      }
      if(!pays.length){
        paysList.innerHTML='<p>Нет платежей.</p>';
        return;
      }
      let html='';
      pays.forEach((p, index)=>{
        html+=`
          <div class="payment-bubble" style="background-color:${getStatusColor(p.status)};">
            <strong>${p.id}</strong> | <em>${p.date}</em><br>
            Назначение: ${p.purpose} (${p.amount} ${p.currency})<br>
            Контракт/инвойс: ${p.contractInvoice}<br>
            Получатель: ${p.receiverName}, ${p.receiverAddress}, ${p.receiverCountry}<br>
            SWIFT: ${p.swift}, Счёт: ${p.account}<br>
            feePercent: ${p.feePercent}%<br>
            Статус: ${p.status}
            <div style="margin-top:5px;">
              <button class="payEditBtn button button-sm" data-idx="${index}">Редактировать</button>
              <button class="payDelBtn button button-sm button-outline" data-idx="${index}">Удалить</button>
              <button class="payDocBtn button button-sm button-outline" data-idx="${index}">Поручение/Отчёт</button>
            </div>
          </div>
        `;
      });
      paysList.innerHTML=html;

      paysList.querySelectorAll('.payDelBtn').forEach(btn=>{
        btn.addEventListener('click',function(){
          let arr=JSON.parse(localStorage.getItem('payments'))||[];
          arr.sort((a,b)=> new Date(b.date)- new Date(a.date));
          const i=+this.getAttribute('data-idx');
          arr.splice(i,1);
          localStorage.setItem('payments', JSON.stringify(arr));
          showToast('Платёж удалён!', 'info');
          renderPaymentsList();
        });
      });
      paysList.querySelectorAll('.payEditBtn').forEach(btn=>{
        btn.addEventListener('click', function(){
          let arr=JSON.parse(localStorage.getItem('payments'))||[];
          arr.sort((a,b)=> new Date(b.date)- new Date(a.date));
          editingIndex=+this.getAttribute('data-idx');
          const payObj=arr[editingIndex];
          payForm.reset();
          payFormTitle.textContent=`Редактировать ${payObj.id}`;
          cancelEditBtn.style.display='inline-block';
          payFormDiv.style.display='block';

          payForm.elements['purpose'].value=payObj.purpose;
          payForm.elements['contractInvoice'].value=payObj.contractInvoice;
          payForm.elements['swift'].value=payObj.swift;
          payForm.elements['account'].value=payObj.account;
          payForm.elements['receiverName'].value=payObj.receiverName;
          payForm.elements['receiverAddress'].value=payObj.receiverAddress;
          payForm.elements['receiverCountry'].value=payObj.receiverCountry;
          payForm.elements['amount'].value=payObj.amount;
          payForm.elements['currency'].value=payObj.currency;
          if(isAdmin){
            let sel=payForm.querySelector('select[name="status"]');
            if(sel) sel.value=payObj.status;
          }
        });
      });
      paysList.querySelectorAll('.payDocBtn').forEach(btn=>{
        btn.addEventListener('click', function(){
          let arr=JSON.parse(localStorage.getItem('payments'))||[];
          arr.sort((a,b)=> new Date(b.date)- new Date(a.date));
          const i=+this.getAttribute('data-idx');
          const payObj=arr[i];
          if(payObj.status==='Исполнен'){
            showPdfAgentReport(payObj);
          } else if(payObj.status==='Возвращен отправителю'){
            showPdfReturnRequest(payObj);
          } else {
            showPdfOrder(payObj);
          }
        });
      });
    }
    renderPaymentsList();

    // PDF генерация (jsPDF + autoTable)
    async function showPdfAgentReport(payObj){
      const { jsPDF }=window.jspdf;
      const doc=new jsPDF();
      const totalFee=(payObj.amount*(payObj.feePercent/100)).toFixed(2);

      // Ищем юзера, чтобы взять agreementNo / agreementDate
      let users=JSON.parse(localStorage.getItem('users'))||[];
      let user=users.find(u=>u.email===payObj.ownerEmail);
      let agrNo=user? user.agreementNo:'';
      let agrDate=user? user.agreementDate:'';

      doc.setFontSize(12);
      doc.text(`ОТЧЁТ АГЕНТА об исполнении поручения ${payObj.id}`,10,20);
      if(agrNo||agrDate){
        doc.text(`По договору № ${agrNo} от ${agrDate}`,10,30);
      }
      doc.text(`Дата платежа: ${payObj.date}`,10,40);

      let head=[['№','Сумма','Валюта','fee%','Итого']];
      let body=[[
        '1',
        payObj.amount,
        payObj.currency,
        `${payObj.feePercent}% => ${totalFee}`,
        `${(payObj.amount + +totalFee)} ${payObj.currency}`
      ]];

      doc.autoTable({
        head,
        body,
        startY:50
      });
      doc.text('Статус: Исполнен',10, doc.autoTable.previous.finalY+10);
      doc.text('Подпись агента: __________',10, doc.autoTable.previous.finalY+20);

      doc.save(`Отчет_${payObj.id}.pdf`);
    }
    async function showPdfReturnRequest(payObj){
      const { jsPDF }=window.jspdf;
      const doc=new jsPDF();
      doc.setFontSize(12);
      doc.text(`Заявление на возврат платежа ${payObj.id}`,10,20);
      doc.text(`Сумма: ${payObj.amount} ${payObj.currency}`,10,30);
      doc.text(`Причина: ...`,10,40);
      doc.text(`Дата,Подпись`,10,60);
      doc.save(`Возврат_${payObj.id}.pdf`);
    }
    async function showPdfOrder(payObj){
      const { jsPDF }=window.jspdf;
      const doc=new jsPDF();
      doc.setFontSize(12);

      // Находим user
      let users=JSON.parse(localStorage.getItem('users'))||[];
      let user=users.find(u=>u.email===payObj.ownerEmail);
      let agrNo=user? user.agreementNo:'';
      let agrDate=user? user.agreementDate:'';

      const totalFee=(payObj.amount*(payObj.feePercent/100)).toFixed(2);

      doc.text(`Поручение № ${payObj.id} от ${payObj.date}`,10,20);
      if(agrNo||agrDate){
        doc.text(`По договору № ${agrNo} от ${agrDate}`,10,30);
      }

      // Пример таблички
      let head=[['№','Назначение','Сумма','Валюта','fee%','Итого']];
      let body=[[
        '1',
        payObj.purpose,
        payObj.amount,
        payObj.currency,
        `${payObj.feePercent}% => ${totalFee}`,
        `${(payObj.amount + +totalFee)} ${payObj.currency}`
      ]];

      doc.autoTable({
        head,
        body,
        startY:40
      });
      doc.text(`Получатель: ${payObj.receiverName}, ${payObj.receiverAddress}, ${payObj.receiverCountry}`,10, doc.autoTable.previous.finalY+10);
      doc.text(`SWIFT: ${payObj.swift}, Счёт: ${payObj.account}`,10, doc.autoTable.previous.finalY+20);
      doc.text(`Подпись агента: __________`,10, doc.autoTable.previous.finalY+40);

      doc.save(`Поручение_${payObj.id}.pdf`);
    }
  }

  /* ----------------------------------------------------------------
     Статистика (Chart.js)
  ----------------------------------------------------------------*/
  function renderStatsPage() {
    const details = document.querySelector('.details');
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))||{};
    // Если не админ => только свои
    if(currentUser.role!=='admin'){
      payments=payments.filter(p=>p.ownerEmail===currentUser.email);
    }

    const totalCount = payments.length;
    let totalAmount = 0;
    const currencyStats = {};
    payments.forEach(p => {
      totalAmount += p.amount;
      currencyStats[p.currency] = (currencyStats[p.currency]||0)+1;
    });
    const average = totalCount>0?(totalAmount/totalCount).toFixed(2):0;
    const labels = Object.keys(currencyStats);
    const dataValues = Object.values(currencyStats);

    details.innerHTML=`
      <h1>Статистика платежей</h1>
      <div class="stats-container">
        <div class="stats-item"><strong>Всего платежей:</strong> ${totalCount}</div>
        <div class="stats-item"><strong>Сумма всех платежей:</strong> ${totalAmount.toFixed(2)}</div>
        <div class="stats-item"><strong>Средняя сумма платежа:</strong> ${average}</div>
        <div class="stats-item"><strong>Распределение по валютам:</strong></div>
        <div class="chart-container" style="width:300px;height:300px;margin:20px 0;">
          <canvas id="currencyChart"></canvas>
        </div>
      </div>
    `;
    if(labels.length>0){
      const ctx=document.getElementById('currencyChart').getContext('2d');
      new Chart(ctx,{
        type:'pie',
        data:{
          labels,
          datasets:[{
            data:dataValues,
            backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'],
            borderWidth:1
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false
        }
      });
    }
  }

  /* ----------------------------------------------------------------
     Документы (пользователь видит только свои, админ — все + поиск)
  ----------------------------------------------------------------*/
  function renderDocumentsPage() {
    const details = document.querySelector('.details');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))||{};
    const isAdmin = (currentUser.role==='admin');

    let html = `<h1>Документы</h1>`;
    if(isAdmin){
      html += `
        <div style="display:flex; gap:5px; margin-bottom:15px;">
          <input type="text" id="docSearchInput" placeholder="Искать по УНП...">
          <button id="docSearchBtn" class="button button-sm">Поиск</button>
        </div>
      `;
    }
    html += `
      <button id="uploadDocBtn" class="button">Загрузить документ</button>
      <input type="file" id="docFileInput" style="display:none;">
      <div id="docsList" style="margin-top:20px;"></div>
    `;
    details.innerHTML=html;

    const uploadDocBtn=details.querySelector('#uploadDocBtn');
    const docFileInput=details.querySelector('#docFileInput');
    const docsList=details.querySelector('#docsList');
    const docSearchInput=details.querySelector('#docSearchInput');
    const docSearchBtn=details.querySelector('#docSearchBtn');

    uploadDocBtn.addEventListener('click', ()=>{
      docFileInput.click();
    });
    docFileInput.addEventListener('change', ()=>{
      const file=docFileInput.files[0];
      if(!file) return;
      let docs=JSON.parse(localStorage.getItem('documents'))||[];
      let docId=Date.now();
      const reader=new FileReader();
      reader.onload=function(e){
        docs.push({
          id:docId,
          name:file.name,
          data:e.target.result,
          linkedPaymentId:''
        });
        localStorage.setItem('documents',JSON.stringify(docs));
        showToast('Документ загружен!','success');
        renderDocsList('');
      };
      reader.readAsDataURL(file);
    });
    if(docSearchBtn){
      docSearchBtn.addEventListener('click',()=>{
        let val=docSearchInput.value.trim();
        renderDocsList(val);
      });
    }

    function renderDocsList(searchTerm=''){
      let docs=JSON.parse(localStorage.getItem('documents'))||[];
      let pays=JSON.parse(localStorage.getItem('payments'))||[];
      const user=JSON.parse(localStorage.getItem('currentUser'))||{};
      const isAdmin=(user.role==='admin');

      if(!isAdmin){
        // Только свои
        let userPays=pays.filter(p=>p.ownerEmail===user.email).map(p=>p.id);
        docs=docs.filter(d=> d.linkedPaymentId==='' || userPays.includes(d.linkedPaymentId));
      } else {
        // admin + поиск
        if(searchTerm){
          docs=docs.filter(d=>d.linkedPaymentId.includes(searchTerm));
        }
      }
      if(!docs.length){
        docsList.innerHTML='<p>Нет документов.</p>';
        return;
      }
      let html='';
      docs.forEach(doc=>{
        let linkedInfo='';
        if(doc.linkedPaymentId){
          const p=pays.find(x=>x.id===doc.linkedPaymentId);
          if(p){
            linkedInfo=`<br><em>[Привязано к ${p.id}, ${p.date}]</em>`;
          }
        }
        html+=`
          <div class="payment-bubble" style="max-width:100%;">
            <strong>${doc.name}</strong> ${linkedInfo}
            <div style="margin-top:5px;">
              <button class="previewDocBtn button button-sm" data-id="${doc.id}">Просмотр</button>
              <a href="${doc.data}" download="${doc.name}" class="button button-sm">Скачать</a>
              <button class="delDocBtn button button-sm button-outline" data-id="${doc.id}">Удалить</button>
            </div>
          </div>
        `;
      });
      docsList.innerHTML=html;

      docsList.querySelectorAll('.previewDocBtn').forEach(btn=>{
        btn.addEventListener('click', function(){
          const docId=this.getAttribute('data-id');
          let arr=JSON.parse(localStorage.getItem('documents'))||[];
          let d=arr.find(x=>x.id==docId);
          if(!d)return;
          if(d.name.endsWith('.pdf')){
            showPreview(`<iframe src="${d.data}" width="100%" height="600px"></iframe>`);
          } else if(/\.(png|jpe?g|jpg)$/i.test(d.name)){
            showPreview(`<img src="${d.data}" style="max-width:100%;height:auto;" />`);
          } else {
            showPreview(`<p>Невозможно отобразить ${d.name}. Попробуйте скачать.</p>`);
          }
        });
      });
      docsList.querySelectorAll('.delDocBtn').forEach(btn=>{
        btn.addEventListener('click', function(){
          const docId=this.getAttribute('data-id');
          let arr=JSON.parse(localStorage.getItem('documents'))||[];
          const idx=arr.findIndex(x=>x.id==docId);
          if(idx!==-1){
            arr.splice(idx,1);
            localStorage.setItem('documents',JSON.stringify(arr));
            showToast('Документ удалён!','info');
            renderDocsList(searchTerm);
          }
        });
      });
    }
    renderDocsList('');
  }

  /* ----------------------------------------------------------------
     КУРСЫ ВАЛЮТ
  ----------------------------------------------------------------*/
  function renderRatesPage() {
    const details=document.querySelector('.details');
    let defaultRates={RUB:1, AED:22, USD:88, EUR:94, CNY:14, GBP:122};
    let rates=JSON.parse(localStorage.getItem('adminRates'))||defaultRates;

    details.innerHTML=`
      <h1>Курсы валют</h1>
      <p style="color:#333;">Текущие (1 Валюта = X RUB):</p>
      <ul style="color:#333;">
        <li>1 AED = ${rates.AED} RUB</li>
        <li>1 USD = ${rates.USD} RUB</li>
        <li>1 EUR = ${rates.EUR} RUB</li>
        <li>1 CNY = ${rates.CNY} RUB</li>
        <li>1 GBP = ${rates.GBP} RUB</li>
      </ul>
    `;
  }

  /* ----------------------------------------------------------------
     ШАБЛОНЫ (компании: Ромашка, Василёк)
  ----------------------------------------------------------------*/
  function renderTemplatesPage() {
    const details = document.querySelector('.details');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))||{};
    const isAdmin = (currentUser.role==='admin');

    details.innerHTML=`
      <h1>Шаблоны документов</h1>
      <p>Ниже — “карточки” (компании). Нажмите, чтобы просмотреть/скачать шаблоны.</p>
      <div class="features-slider" id="templatesSlider" style="margin-top:30px;"></div>
      <div id="templateDetails" style="display:none; margin-top:30px;"></div>
    `;

    const slider=details.querySelector('#templatesSlider');
    const templateDetails=details.querySelector('#templateDetails');
    const companies=[
      {id:'romashka', name:'ООО Ромашка'},
      {id:'vasilek', name:'ООО Василёк'}
    ];
    companies.forEach(comp=>{
      let card=document.createElement('div');
      card.classList.add('feature-card');
      card.style.flex='0 0 300px';
      card.innerHTML=`
        <h3>${comp.name}</h3>
        <p>Нажмите, чтобы управлять шаблонами</p>
      `;
      card.addEventListener('click',()=>{
        showCompanyTemplates(comp.id, comp.name);
      });
      slider.appendChild(card);
    });

    function showCompanyTemplates(companyId, companyName){
      templateDetails.style.display='block';
      templateDetails.innerHTML=`
        <h2>Шаблоны для ${companyName}</h2>
        ${isAdmin? `<button id="addTmplBtn" class="button">Добавить шаблон</button>` : ``}
        <div id="newTmplForm" style="display:none; margin-top:20px;">
          <form id="newTemplateForm">
            <div class="form-row">
              <label>Название шаблона:</label>
              <input type="text" name="name" required>
            </div>
            <div class="form-row">
              <label>Файл шаблона:</label>
              <input type="file" name="file" required>
            </div>
            <button type="submit" class="button">Сохранить</button>
            <button type="button" id="cancelTmpl" class="button button-outline" style="margin-left:10px;">Отмена</button>
          </form>
        </div>
        <div id="tmplList" style="margin-top:30px;"></div>
      `;

      const addTmplBtn=templateDetails.querySelector('#addTmplBtn');
      const newTmplForm=templateDetails.querySelector('#newTmplForm');
      const newTemplateForm=templateDetails.querySelector('#newTemplateForm');
      const cancelTmpl=templateDetails.querySelector('#cancelTmpl');
      const tmplList=templateDetails.querySelector('#tmplList');

      if(addTmplBtn){
        addTmplBtn.addEventListener('click',()=>{
          newTmplForm.style.display='block';
        });
      }
      if(cancelTmpl){
        cancelTmpl.addEventListener('click',()=>{
          newTmplForm.style.display='none';
          newTemplateForm.reset();
        });
      }
      if(!isAdmin){
        if(newTmplForm) newTmplForm.style.display='none';
      }

      newTemplateForm?.addEventListener('submit',(e)=>{
        e.preventDefault();
        if(!isAdmin){
          showToast('Только админ может добавлять','error');
          return;
        }
        let allTemplates=JSON.parse(localStorage.getItem('templates'))||{};
        if(!allTemplates[companyId]) allTemplates[companyId]=[];

        const fd=new FormData(newTemplateForm);
        let name=fd.get('name');
        let file=fd.get('file');
        if(!file){
          showToast('Нет файла','error');
          return;
        }
        let reader=new FileReader();
        reader.onload=function(ev){
          let dataURL=ev.target.result;
          let tmplObj={
            id:Date.now(),
            name:name,
            fileName:file.name,
            data:dataURL
          };
          allTemplates[companyId].push(tmplObj);
          localStorage.setItem('templates', JSON.stringify(allTemplates));
          showToast('Шаблон добавлен!','success');
          newTmplForm.style.display='none';
          newTemplateForm.reset();
          renderCompanyTemplates(companyId, allTemplates[companyId]);
        };
        reader.readAsDataURL(file);
      });

      let allTemplates=JSON.parse(localStorage.getItem('templates'))||{};
      if(!allTemplates[companyId]) allTemplates[companyId]=[];
      renderCompanyTemplates(companyId, allTemplates[companyId]);

      function renderCompanyTemplates(compId, arr){
        if(!arr.length){
          tmplList.innerHTML='<p>Нет шаблонов.</p>';
          return;
        }
        let html='<ul>';
        arr.forEach(t=>{
          html+=`
            <li style="margin-bottom:10px;">
              <strong>${t.name}</strong> (${t.fileName})
              <div style="margin-top:5px;">
                <button class="tmplPreviewBtn button button-sm" data-id="${t.id}">Просмотр</button>
                <a href="${t.data}" download="${t.fileName}" class="button button-sm">Скачать</a>
                ${isAdmin? `<button class="tmplDelBtn button button-sm button-outline" data-id="${t.id}">Удалить</button>`:''}
              </div>
            </li>
          `;
        });
        html+='</ul>';
        tmplList.innerHTML=html;

        tmplList.querySelectorAll('.tmplPreviewBtn').forEach(btn=>{
          btn.addEventListener('click',function(){
            let tid=+this.getAttribute('data-id');
            let allT=JSON.parse(localStorage.getItem('templates'))||{};
            let compArr=allT[compId]||[];
            let found=compArr.find(x=>x.id===tid);
            if(!found)return;
            if(found.fileName.endsWith('.pdf')){
              showPreview(`<iframe src="${found.data}" width="100%" height="600px"></iframe>`);
            } else if(/\.(png|jpe?g)$/i.test(found.fileName)){
              showPreview(`<img src="${found.data}" style="max-width:100%;height:auto;">`);
            } else {
              showPreview(`<p>${found.name}<br>Неизвестный формат. Попробуйте скачать.</p>`);
            }
          });
        });
        tmplList.querySelectorAll('.tmplDelBtn').forEach(btn=>{
          btn.addEventListener('click',function(){
            let tid=+this.getAttribute('data-id');
            let allT=JSON.parse(localStorage.getItem('templates'))||{};
            let compArr=allT[compId]||[];
            let idx=compArr.findIndex(x=>x.id===tid);
            if(idx!==-1){
              compArr.splice(idx,1);
              allT[compId]=compArr;
              localStorage.setItem('templates', JSON.stringify(allT));
              showToast('Шаблон удалён!','info');
              renderCompanyTemplates(compId, compArr);
            }
          });
        });
      }
    }
  }

  /* ----------------------------------------------------------------
     СТАТИСТИКА (Chart.js)
  ----------------------------------------------------------------*/
  function renderStatsPage() {
    const details = document.querySelector('.details');
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))||{};
    if(currentUser.role!=='admin'){
      payments=payments.filter(x=>x.ownerEmail===currentUser.email);
    }

    const totalCount=payments.length;
    let totalAmount=0;
    const currencyStats={};
    payments.forEach(p=>{
      totalAmount+=p.amount;
      currencyStats[p.currency]=(currencyStats[p.currency]||0)+1;
    });
    const average=(totalCount>0)?(totalAmount/totalCount).toFixed(2):0;
    const labels=Object.keys(currencyStats);
    const dataValues=Object.values(currencyStats);

    details.innerHTML=`
      <h1>Статистика платежей</h1>
      <div class="stats-container">
        <div class="stats-item"><strong>Всего платежей:</strong> ${totalCount}</div>
        <div class="stats-item"><strong>Сумма всех платежей:</strong> ${totalAmount.toFixed(2)}</div>
        <div class="stats-item"><strong>Средняя сумма платежа:</strong> ${average}</div>
        <div class="stats-item"><strong>Распределение по валютам:</strong></div>
        <div class="chart-container" style="width:300px;height:300px;margin:20px 0;">
          <canvas id="currencyChart"></canvas>
        </div>
      </div>
    `;
    if(labels.length>0){
      const ctx=document.getElementById('currencyChart').getContext('2d');
      new Chart(ctx,{
        type:'pie',
        data:{
          labels,
          datasets:[{
            data:dataValues,
            backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'],
            borderWidth:1
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false
        }
      });
    }
  }
});