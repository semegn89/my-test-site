// userCabinet.js

import { showToast } from './utils.js';

/**
 * Отображает ЛК пользователя.
 */
export function renderUserCabinet() {
  const details = document.querySelector('.details');
  const curUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  if (!curUser || curUser.role !== 'user') {
    details.innerHTML = '<h1>Доступно только для пользователей.</h1>';
    return;
  }

  // Стили для фона
  details.style.background = 'rgba(255,255,255,1)';

  details.innerHTML = `
    <h1>Личный кабинет</h1>
    <p><strong>Email:</strong> ${curUser.email}</p>
    <p><strong>Компания:</strong> ${curUser.companyName || ''}</p>
    <p><strong>ИНН:</strong> ${curUser.inn || ''}</p>
    <p><strong>Адрес:</strong> ${curUser.address || ''}</p>
    <p><strong>Банк:</strong> ${curUser.bankName || ''}</p>
    <p><strong>БИК:</strong> ${curUser.bik || ''}</p>
    <p><strong>Счёт:</strong> ${curUser.accountNumber || ''}</p>
    <p><strong>feePercent:</strong> ${curUser.feePercent || 0}%</p>
    <p><strong>Договор №:</strong> ${curUser.agreementNo || ''}</p>
    <p><strong>Дата договора:</strong> ${curUser.agreementDate || ''}</p>

    <button id="editProfileBtn" class="button">Редактировать</button>
    <div id="editProfileArea" style="display:none; margin-top:20px;">
      <form id="profileForm">
        <div class="form-row">
          <label>Компания:</label>
          <input type="text" name="companyName" value="${curUser.companyName || ''}">
        </div>
        <div class="form-row">
          <label>ИНН:</label>
          <input type="text" name="inn" value="${curUser.inn || ''}">
        </div>
        <div class="form-row">
          <label>Адрес:</label>
          <input type="text" name="address" value="${curUser.address || ''}">
        </div>
        <div class="form-row">
          <label>Банк:</label>
          <input type="text" name="bankName" value="${curUser.bankName || ''}">
        </div>
        <div class="form-row">
          <label>БИК:</label>
          <input type="text" name="bik" value="${curUser.bik || ''}">
        </div>
        <div class="form-row">
          <label>Счёт:</label>
          <input type="text" name="accountNumber" value="${curUser.accountNumber || ''}">
        </div>
        <!-- agreementNo/date – не меняем, disabled -->
        <div class="form-row">
          <label>Договор №:</label>
          <input type="text" name="agreementNo" value="${curUser.agreementNo || ''}" disabled>
        </div>
        <div class="form-row">
          <label>Дата договора:</label>
          <input type="text" name="agreementDate" value="${curUser.agreementDate || ''}" disabled>
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

  // Кнопка "Редактировать" профиль
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
    let obj   = JSON.parse(localStorage.getItem('currentUser')) || {};
    const fd  = new FormData(profileForm);

    obj.companyName   = fd.get('companyName')   || '';
    obj.inn           = fd.get('inn')           || '';
    obj.address       = fd.get('address')       || '';
    obj.bankName      = fd.get('bankName')      || '';
    obj.bik           = fd.get('bik')           || '';
    obj.accountNumber = fd.get('accountNumber') || '';
    // agreementNo/date – не меняем, disabled

    const idx = users.findIndex(u => u.email === obj.email);
    if (idx !== -1) {
      users[idx] = obj;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(obj));
      showToast('Данные обновлены!', 'success');
      renderUserCabinet(); // перерисовать
    }
  });

  // Инициализация чата user->admin
  initUserAdminChat(curUser);
}


/**
 * Простая функция для чата user->admin
 */
function initUserAdminChat(curUser){
  const chatBox  = document.getElementById('userChatBox');
  const chatFile = document.getElementById('userChatFile');
  const chatInput= document.getElementById('userChatInput');
  const chatSendBtn = document.getElementById('userChatSendBtn');

  if(!chatBox || !chatSendBtn) return;

  let allChats  = JSON.parse(localStorage.getItem('adminChats')) || {};
  let userEmail = curUser.email;
  if(!allChats[userEmail]) allChats[userEmail] = [];
  let chatArr = allChats[userEmail];

  function renderChat(){
    chatBox.innerHTML = '';
    chatArr.forEach(msg => {
      const div = document.createElement('div');
      div.style.marginBottom = '8px';

      if (msg.from === 'user') {
        div.style.textAlign = 'right';
        if (msg.fileName) {
          div.innerHTML = `<div style="display:inline-block;background:#007aff;color:#fff;padding:6px 10px;border-radius:16px;">
            <strong>Вы (файл):</strong>
            <a href="${msg.fileData}" download="${msg.fileName}" style="color:#fff;">${msg.fileName}</a>
          </div>`;
        } else {
          div.innerHTML = `<div style="display:inline-block;background:#007aff;color:#fff;padding:6px 10px;border-radius:16px;">
            ${msg.text}
          </div>`;
        }
      }
      else {
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

  chatSendBtn.addEventListener('click', sendUserChatMsg);
  chatInput.addEventListener('keypress',(ev)=>{
    if(ev.key==='Enter'){
      sendUserChatMsg();
    }
  });

  function sendUserChatMsg(){
    const file = chatFile.files[0];
    const txt  = chatInput.value.trim();
    if(!file && !txt){
      showToast('Введите текст или выберите файл','error');
      return;
    }

    // Формируем сообщение
    let msgObj = {
      userEmail,
      from: 'user',
      text: '',
      fileName: '',
      fileData: '',
      date: new Date().toLocaleString()
    };

    if(file){
      const reader = new FileReader();
      reader.onload = function(e){
        let dataURL = e.target.result;
        msgObj.fileName = file.name;
        msgObj.fileData = dataURL;
        msgObj.text     = ''; // в случае файла
        chatArr.push(msgObj);
        allChats[userEmail] = chatArr;
        localStorage.setItem('adminChats', JSON.stringify(allChats));
        chatFile.value='';
        chatInput.value='';
        renderChat();
      };
      reader.readAsDataURL(file);
    } else {
      // только текст
      msgObj.text = txt;
      chatArr.push(msgObj);
      allChats[userEmail] = chatArr;
      localStorage.setItem('adminChats', JSON.stringify(allChats));
      chatInput.value='';
      renderChat();
    }
  }
}