// adminPanel.js
import { showToast } from './utils.js';

export function renderAdminPanel(){
    const details=document.querySelector('.details');
    const currentUser=JSON.parse(localStorage.getItem('currentUser'))||{};
    if(!currentUser || currentUser.role!=='admin'){
      details.innerHTML='<h1>Доступ запрещён. Вы не админ.</h1>';
      return;
    }

    details.innerHTML=`
      <h1>Админ-панель</h1>
      <p>Управляйте пользователями, платежами, документами, шаблонами, а также просматривайте чаты.</p>
      <div style="margin-top:20px;" id="adminActions"></div>
    `;
    const adminActions=details.querySelector('#adminActions');
    adminActions.innerHTML=`
      <button id="manageChatsBtn" class="button">Чаты</button>
      <button id="manageUsersBtn" class="button" style="margin-left:10px;">Пользователи</button>
      <button id="manageRatesBtn" class="button" style="margin-left:10px;">Редактировать курсы</button>
      <div id="adminContent" style="margin-top:30px;"></div>
    `;
    const manageChatsBtn=adminActions.querySelector('#manageChatsBtn');
    const manageUsersBtn=adminActions.querySelector('#manageUsersBtn');
    const manageRatesBtn=adminActions.querySelector('#manageRatesBtn');
    const adminContent=adminActions.querySelector('#adminContent');

    manageChatsBtn.addEventListener('click', renderAdminChats);
    manageUsersBtn.addEventListener('click', renderAdminUsers);
    manageRatesBtn.addEventListener('click', renderAdminRates);

    /* ---------- Чаты (квадратики + поиск) ---------- */
    function renderAdminChats(){
      let allChats=JSON.parse(localStorage.getItem('adminChats'))||{};
      let userEmails=Object.keys(allChats);

      adminContent.innerHTML=`
        <h3>Чаты с пользователями</h3>
        <div style="margin-bottom:10px;">
          <input type="text" id="chatSearchInput" placeholder="Поиск по email..." style="padding:5px;">
          <button id="chatSearchBtn" class="button button-sm" style="margin-left:5px;">Поиск</button>
        </div>
        <div id="chatCardsContainer" style="display:flex; flex-wrap:wrap; gap:20px;"></div>
      `;
      const chatSearchInput=adminContent.querySelector('#chatSearchInput');
      const chatSearchBtn=adminContent.querySelector('#chatSearchBtn');
      const chatCardsContainer=adminContent.querySelector('#chatCardsContainer');

      chatSearchBtn.addEventListener('click',()=>{
        const term=chatSearchInput.value.trim().toLowerCase();
        renderChatCards(term);
      });

      function renderChatCards(searchTerm=''){
        chatCardsContainer.innerHTML='';
        let filteredEmails=userEmails;
        if(searchTerm){
          filteredEmails=userEmails.filter(em=>em.toLowerCase().includes(searchTerm));
        }
        if(!filteredEmails.length){
          chatCardsContainer.innerHTML='<p>Нет чатов с таким запросом.</p>';
          return;
        }
        filteredEmails.forEach(email=>{
          const chatArr=allChats[email]||[];
          // check if unread
          let hasUnread = chatArr.some(m=>m.from==='user' && !m.readByAdmin);

          const card=document.createElement('div');
          card.style.width='7cm';
          card.style.height='7cm';
          card.style.border='1px solid #ccc';
          card.style.borderRadius='8px';
          card.style.padding='10px';
          card.style.display='flex';
          card.style.flexDirection='column';
          card.style.justifyContent='space-between';

          card.innerHTML=`
            <div>
              <h4 style="margin-bottom:5px;">${email}</h4>
              ${
                hasUnread
                  ? `<p style="color:red;">Непрочитанные!</p>`
                  : `<p style="color:green;">Все прочитано</p>`
              }
            </div>
            <button class="openChatBtn button button-sm">Открыть чат</button>
          `;
          card.querySelector('.openChatBtn').addEventListener('click',()=>{
            showAdminChatDetail(email);
          });
          chatCardsContainer.appendChild(card);
        });
      }

      renderChatCards();
    }

    function showAdminChatDetail(userEmail){
      adminContent.innerHTML=`
        <h4>Чат с ${userEmail}</h4>
        <div id="adminChatHistory" style="border:1px solid #ccc; height:300px; overflow-y:auto; margin-bottom:10px; padding:10px;"></div>
        <div style="display:flex; gap:5px;">
          <input type="file" id="adminChatFile" style="width:160px;" />
          <input type="text" id="adminMsgInput" placeholder="Ответ пользователю..." style="flex:1;">
          <button id="adminSendBtn" class="button button-sm">Отправить</button>
        </div>
      `;

      let allChats=JSON.parse(localStorage.getItem('adminChats'))||{};
      let userChat=allChats[userEmail]||[];
      const adminChatHistory=document.getElementById('adminChatHistory');
      const adminMsgInput=document.getElementById('adminMsgInput');
      const adminChatFile=document.getElementById('adminChatFile');
      const adminSendBtn=document.getElementById('adminSendBtn');

      function renderAdminMessages(){
        let h='';
        userChat.forEach(msg=>{
          if(msg.from==='user'){
            // помечаем прочитанным
            msg.readByAdmin=true;
          }
          if(msg.from==='user'){
            if(msg.fileName){
              h+=`<div style="text-align:left; margin-bottom:6px;">
                <span style="display:inline-block;background:#007aff;color:#fff;padding:8px 12px;border-radius:16px;">
                  User(файл): <a href="${msg.fileData}" style="color:#fff;" download="${msg.fileName}">${msg.fileName}</a>
                </span>
              </div>`;
            } else {
              h+=`<div style="text-align:left; margin-bottom:6px;">
                <span style="display:inline-block;background:#007aff;color:#fff;padding:8px 12px;border-radius:16px;">
                  User: ${msg.text}
                </span>
              </div>`;
            }
          } else {
            // admin
            if(msg.fileName){
              h+=`<div style="text-align:right; margin-bottom:6px;">
                <span style="display:inline-block;background:#eee;color:#333;padding:8px 12px;border-radius:16px;">
                  Админ(файл): <a href="${msg.fileData}" download="${msg.fileName}">${msg.fileName}</a>
                </span>
              </div>`;
            } else {
              h+=`<div style="text-align:right; margin-bottom:6px;">
                <span style="display:inline-block;background:#eee;color:#333;padding:8px 12px;border-radius:16px;">
                  ${msg.text}
                </span>
              </div>`;
            }
          }
        });
        adminChatHistory.innerHTML=h;
        adminChatHistory.scrollTop=adminChatHistory.scrollHeight;
        // сохраняем обратно
        allChats[userEmail]=userChat;
        localStorage.setItem('adminChats', JSON.stringify(allChats));
      }
      renderAdminMessages();

      adminSendBtn.addEventListener('click',sendAdminMsg);
      adminMsgInput.addEventListener('keypress',(ev)=>{
        if(ev.key==='Enter'){
          sendAdminMsg();
        }
      });
      function sendAdminMsg(){
        const txt=adminMsgInput.value.trim();
        const file=adminChatFile.files[0];
        if(!file && !txt){
          showToast('Введите текст или выберите файл','error');
          return;
        }
        if(file){
          let reader=new FileReader();
          reader.onload=function(e){
            let dataURL=e.target.result;
            let msgObj={
              userEmail,
              from:'admin',
              text:'',
              fileName:file.name,
              fileData:dataURL,
              date:new Date().toLocaleString()
            };
            userChat.push(msgObj);
            allChats[userEmail]=userChat;
            localStorage.setItem('adminChats', JSON.stringify(allChats));
            adminChatFile.value='';
            adminMsgInput.value='';
            renderAdminMessages();
          };
          reader.readAsDataURL(file);
        } else {
          let msgObj={
            userEmail,
            from:'admin',
            text:txt,
            fileName:'',
            fileData:'',
            date:new Date().toLocaleString()
          };
          userChat.push(msgObj);
          allChats[userEmail]=userChat;
          localStorage.setItem('adminChats', JSON.stringify(allChats));
          adminMsgInput.value='';
          renderAdminMessages();
        }
      }
    }

    /* ---------- Пользователи (карточками) + поиск ---------- */
    function renderAdminUsers(){
      let users=JSON.parse(localStorage.getItem('users'))||[];
      let filtered=users.filter(u=>u.role!=='admin');
      const adminContent=document.getElementById('adminContent');
      adminContent.innerHTML=`
        <h3>Список пользователей</h3>
        <div style="margin-bottom:10px;">
          <input type="text" id="userSearchInput" placeholder="Поиск по email или ИНН..." style="padding:5px;">
          <button id="userSearchBtn" class="button button-sm" style="margin-left:5px;">Искать</button>
        </div>
        <div id="usersCardsContainer" style="display:flex; flex-wrap:wrap; gap:20px;"></div>
      `;
      const userSearchInput=adminContent.querySelector('#userSearchInput');
      const userSearchBtn=adminContent.querySelector('#userSearchBtn');
      const usersCardsContainer=adminContent.querySelector('#usersCardsContainer');

      userSearchBtn.addEventListener('click',()=>{
        const val=userSearchInput.value.trim().toLowerCase();
        renderUsersCards(val);
      });
      function renderUsersCards(searchTerm=''){
        usersCardsContainer.innerHTML='';
        let data=filtered;
        if(searchTerm){
          data=data.filter(u=>
            u.email.toLowerCase().includes(searchTerm) ||
            (u.inn||'').toLowerCase().includes(searchTerm)
          );
        }
        if(!data.length){
          usersCardsContainer.innerHTML='<p>Нет пользователей с таким запросом.</p>';
          return;
        }
        data.forEach(u=>{
          const card=document.createElement('div');
          card.style.width='7cm';
          card.style.height='7cm';
          card.style.border='1px solid #ccc';
          card.style.borderRadius='8px';
          card.style.padding='10px';
          card.style.display='flex';
          card.style.flexDirection='column';
          card.style.justifyContent='space-between';

          card.innerHTML=`
            <div style="margin-bottom:5px;">
              <h4 style="margin:0;">${u.email}</h4>
              <p style="font-size:14px;">ИНН: ${u.inn||'—'}</p>
              <p style="font-size:14px;">fee: ${u.feePercent}%</p>
            </div>
            <button class="editUserBtn button button-sm">Редактировать</button>
          `;
          card.querySelector('.editUserBtn').addEventListener('click',()=>{
            showEditUserForm(u.email);
          });
          usersCardsContainer.appendChild(card);
        });
      }
      renderUsersCards();
    }
    function showEditUserForm(userEmail){
      let users=JSON.parse(localStorage.getItem('users'))||[];
      let userObj=users.find(u=>u.email===userEmail);
      if(!userObj){
        showToast('Пользователь не найден','error');
        return;
      }
      const adminContent=document.getElementById('adminContent');
      adminContent.innerHTML=`
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
      const adminEditUserForm=document.getElementById('adminEditUserForm');
      adminEditUserForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        const fd=new FormData(adminEditUserForm);
        let newFee=parseFloat(fd.get('feePercent'))||0;
        let newAgrNo=fd.get('agreementNo')||'';
        let newAgrDate=fd.get('agreementDate')||'';

        let idx=users.findIndex(x=>x.email===userEmail);
        if(idx!==-1){
          users[idx].feePercent=newFee;
          users[idx].agreementNo=newAgrNo;
          users[idx].agreementDate=newAgrDate;
          localStorage.setItem('users', JSON.stringify(users));
          showToast('Пользователь обновлён!','success');
        }
      });
    }

    /* ---------- Редактирование курсов (с архивом) ---------- */
    function renderAdminRates(){
      let defRates={RUB:1,AED:22,USD:88,EUR:94,CNY:14,GBP:122};
      let rates=JSON.parse(localStorage.getItem('adminRates'))||defRates;
      let ratesHistory=JSON.parse(localStorage.getItem('adminRatesHistory'))||[];

      const adminContent=document.getElementById('adminContent');
      adminContent.innerHTML=`
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
        <hr>
        <h4>Архив курсов:</h4>
        <div id="ratesHistoryList"></div>
      `;

      const editRatesForm=document.getElementById('editRatesForm');
      const ratesHistoryList=document.getElementById('ratesHistoryList');

      editRatesForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        const fd=new FormData(editRatesForm);
        let newRates={
          RUB:1,
          AED:parseFloat(fd.get('AED'))||22,
          USD:parseFloat(fd.get('USD'))||88,
          EUR:parseFloat(fd.get('EUR'))||94,
          CNY:parseFloat(fd.get('CNY'))||14,
          GBP:parseFloat(fd.get('GBP'))||122
        };
        // Архивируем предыдущие
        ratesHistory.push({
          date:new Date().toLocaleString(),
          rates: rates
        });
        localStorage.setItem('adminRatesHistory', JSON.stringify(ratesHistory));

        // Сохраняем новые
        localStorage.setItem('adminRates', JSON.stringify(newRates));
        showToast('Курсы валют обновлены!', 'success');
        renderAdminRates();
      });

      if(!ratesHistory.length){
        ratesHistoryList.innerHTML='<p>Архив пуст.</p>';
      } else {
        let html='<ul>';
        ratesHistory.forEach(item=>{
          const r=item.rates;
          html += `
            <li style="margin-bottom:5px;">
              <strong>${item.date}</strong><br>
              AED=${r.AED}, USD=${r.USD}, EUR=${r.EUR}, CNY=${r.CNY}, GBP=${r.GBP}
            </li>
          `;
        });
        html+='</ul>';
        ratesHistoryList.innerHTML=html;
      }
    }
  }