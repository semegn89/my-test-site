// payments.js
import { showToast, generateUNP } from './utils.js';

export function renderPaymentsPage() {
  const details = document.querySelector('.details');
  const curUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const isAdmin = (curUser.role === 'admin');

  details.style.background = 'rgba(255,255,255,1)';
  details.innerHTML = `
    <h1>Платежи</h1>
    <div style="display:flex; flex-wrap:wrap; gap:10px;">
      <button id="createPayBtn" class="button">Создать платеж</button>
      <button id="exportCsvBtn" class="button">Экспорт CSV</button>

      <!-- ФИЛЬТР ПО СТАТУСУ (уже был) -->
      <select id="statusFilter" class="button">
        <option value="">Все статусы</option>
        <option value="Создан">Создан</option>
        <option value="Принят">Принят</option>
        <option value="В обработке">В обработке</option>
        <option value="Запрос документов">Запрос документов</option>
        <option value="Исполнен">Исполнен</option>
        <option value="Возвращен отправителю">Возвращен отправителю</option>
      </select>

      <!-- Поиск по получателю / поручению -->
      <input type="text" id="searchInput" class="button" 
             placeholder="Поиск (получатель / поручение)" 
             style="width:220px;">

      <!-- Сортировка (сумма, дата) -->
      <select id="sortSelect" class="button">
        <option value="">Без сортировки</option>
        <option value="date_desc">Дата (новее → старее)</option>
        <option value="date_asc">Дата (старее → новее)</option>
        <option value="amount_desc">Сумма (убывание)</option>
        <option value="amount_asc">Сумма (возрастание)</option>
      </select>
    </div>

    <div id="payFormDiv" style="display:none; margin-top:20px;">
      <h3 id="payFormTitle">Новый платеж</h3>
      <form id="payForm">
        <div class="form-row">
          <label>Назначение:</label>
          <input type="text" name="purpose" required placeholder="Напр.: Оплата по контракту #123">
        </div>
        <div class="form-row">
          <label>Контр/инвойс:</label>
          <input type="text" name="contractInvoice" placeholder="№ договора, № инвойса и т.д.">
        </div>
        <div class="form-row">
          <label>Номер поручения:</label>
          <input type="text" name="orderNumber" placeholder="Напр.: П-124">
        </div>
        <div class="form-row">
          <label>SWIFT:</label>
          <input type="text" name="swift" required placeholder="SWIFT (банка получателя)">
        </div>
        <div class="form-row">
          <label>Счёт получателя:</label>
          <input type="text" name="account" required placeholder="IBAN или счёт">
        </div>
        <div class="form-row">
          <label>Получатель:</label>
          <input type="text" name="receiverName" required placeholder="Company Inc. or Name">
        </div>
        <div class="form-row">
          <label>Адрес получателя:</label>
          <input type="text" name="receiverAddress" required placeholder="На англ. языке (транслит)">
        </div>
        <div class="form-row">
          <label>Страна получателя:</label>
          <input type="text" name="receiverCountry" required placeholder="Напр.: UAE, USA...">
        </div>
        <div class="form-row">
          <label>Сумма:</label>
          <input type="number" step="0.01" name="amount" required placeholder="Напр.: 1000.00">
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

        <!-- Новое поле: За что платеж (Тип) -->
        <div class="form-row">
          <label>Тип платежа:</label>
          <select name="paymentType">
            <option value="Товар">Товар</option>
            <option value="Услуга">Услуга</option>
            <option value="Долг">Долг</option>
            <option value="Другое">Другое</option>
          </select>
        </div>

        <div class="form-row">
          <label>Документы:</label>
          <input type="file" name="paymentDocs" multiple>
        </div>

        ${
          isAdmin
            ? `
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
        `
            : ''
        }

        <button type="submit" class="button">Сохранить</button>
        <button type="button" id="cancelEditBtn" class="button button-outline" style="display:none; margin-left:10px;">Отмена</button>
      </form>
    </div>

    <div id="paysList" style="margin-top:20px;"></div>
  `;

  // Все ссылки на элементы
  const createPayBtn  = details.querySelector('#createPayBtn');
  const exportCsvBtn  = details.querySelector('#exportCsvBtn');
  const statusFilter  = details.querySelector('#statusFilter');
  const searchInput   = details.querySelector('#searchInput');
  const sortSelect    = details.querySelector('#sortSelect');
  const payFormDiv    = details.querySelector('#payFormDiv');
  const payFormTitle  = details.querySelector('#payFormTitle');
  const payForm       = details.querySelector('#payForm');
  const cancelEditBtn = details.querySelector('#cancelEditBtn');
  const paysList      = details.querySelector('#paysList');

  let editingIndex = null;

  // Кнопка "Создать платёж"
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

  // При изменении фильтров / поиска / сортировки
  statusFilter.addEventListener('change', renderPaymentsList);
  searchInput.addEventListener('input', renderPaymentsList);
  sortSelect.addEventListener('change', renderPaymentsList);

  // Сохранение платежа
  payForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    let docs     = JSON.parse(localStorage.getItem('documents')) || [];
    let users    = JSON.parse(localStorage.getItem('users')) || [];

    const fd      = new FormData(payForm);
    const curUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    let feePercent= 0;

    if (isAdmin) {
      feePercent = 0; // или что-то другое, если нужно
    } else {
      const found = users.find(u => u.email === curUser.email);
      feePercent  = found ? found.feePercent || 0 : 0;
    }

    let payStatus = 'Создан';
    if (isAdmin) payStatus = fd.get('status') || 'Создан';

    // Собираем объект платежа
    const payObj = {
      id: (editingIndex===null) ? generatePaymentId() : '',
      purpose: fd.get('purpose'),
      contractInvoice: fd.get('contractInvoice') || '',
      orderNumber: fd.get('orderNumber') || '',
      swift: fd.get('swift'),
      account: fd.get('account'),
      receiverName: fd.get('receiverName'),
      receiverAddress: fd.get('receiverAddress'),
      receiverCountry: fd.get('receiverCountry'),
      amount: parseFloat(fd.get('amount')),
      currency: fd.get('currency'),
      // Новое поле:
      paymentType: fd.get('paymentType') || 'Другое',

      date: new Date().toLocaleString(),
      status: payStatus,
      docs: [],
      feePercent,
      ownerEmail: curUser.email
    };

    // Загрузка файлов (ваша логика)
    const fileList = fd.getAll('paymentDocs');
    function handleFile(i) {
      if (i >= fileList.length) {
        finalize();
        return;
      }
      const file = fileList[i];
      if (!(file instanceof File)) {
        handleFile(i+1);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataURL = ev.target.result;
        let docId   = Date.now() + '-' + i;
        let docName = `${payObj.id} от ${payObj.date} — ${file.name}`;
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

    function finalize() {
      let pays = JSON.parse(localStorage.getItem('payments')) || [];
      if (editingIndex === null) {
        pays.push(payObj);
        showToast(`Платёж ${payObj.id} создан!`, 'success');
      } else {
        // Редактирование
        pays.sort((a, b)=> new Date(b.date) - new Date(a.date));
        let oldId = pays[editingIndex].id;
        payObj.id = oldId;
        payObj.docs = [...pays[editingIndex].docs, ...payObj.docs];
        payObj.ownerEmail = pays[editingIndex].ownerEmail;
        pays[editingIndex] = payObj;
        showToast(`Платёж ${oldId} обновлён!`, 'success');

        // Исправляем linkedPaymentId в documents
        let allDocs = JSON.parse(localStorage.getItem('documents')) || [];
        for (let d of allDocs) {
          if (d.linkedPaymentId === '' && d.name.includes(payObj.date)) {
            d.linkedPaymentId = oldId;
          }
        }
        localStorage.setItem('documents', JSON.stringify(allDocs));
      }
      localStorage.setItem('payments', JSON.stringify(pays));
      payForm.reset();
      payFormDiv.style.display = 'none';
      editingIndex = null;
      renderPaymentsList();
    }
  });

  // Экспорт CSV
  exportCsvBtn.addEventListener('click', () => {
    let pays = JSON.parse(localStorage.getItem('payments')) || [];
    if (!pays.length) {
      showToast('Нет данных для экспорта!', 'info');
      return;
    }
    let csv = "data:text/csv;charset=utf-8,ID,Purpose,Contract,OrderNo,SWIFT,Account,Receiver,Amount,Currency,Status,feePercent,Date,paymentType\n";
    pays.forEach(p => {
      csv += `${p.id},${p.purpose},${p.contractInvoice},${p.orderNumber},${p.swift},${p.account},${p.receiverName},${p.amount},${p.currency},${p.status},${p.feePercent},${p.date},${p.paymentType||''}\n`;
    });
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', 'payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  function getStatusColor(st) {
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

  // Отображение списка
  function renderPaymentsList() {
    let pays = JSON.parse(localStorage.getItem('payments')) || [];
    if (curUser.role !== 'admin') {
      pays = pays.filter(x => x.ownerEmail === curUser.email);
    }

    // Фильтр по статусу
    const f = statusFilter.value;
    if (f) {
      pays = pays.filter(x => x.status === f);
    }

    // Поиск (получатель / поручение)
    const searchVal = (searchInput.value || '').toLowerCase();
    if (searchVal) {
      pays = pays.filter(p => {
        const rName = (p.receiverName || '').toLowerCase();
        const oNum  = (p.orderNumber  || '').toLowerCase();
        return (rName.includes(searchVal) || oNum.includes(searchVal));
      });
    }

    // Сортировка
    const sortVal = sortSelect.value;
    if (sortVal === 'date_desc') {
      pays.sort((a,b) => new Date(b.date) - new Date(a.date));
    } else if (sortVal === 'date_asc') {
      pays.sort((a,b) => new Date(a.date) - new Date(b.date));
    } else if (sortVal === 'amount_desc') {
      pays.sort((a,b) => b.amount - a.amount);
    } else if (sortVal === 'amount_asc') {
      pays.sort((a,b) => a.amount - b.amount);
    } else {
      // По умолчанию (дата_desc)
      pays.sort((a,b) => new Date(b.date) - new Date(a.date));
    }

    if (!pays.length) {
      paysList.innerHTML = '<p>Нет платежей.</p>';
      return;
    }

    let html = '';
    pays.forEach((p, index) => {
      html += `
        <div class="payment-bubble" style="background-color:${getStatusColor(p.status)};">
          <strong>${p.id}</strong> | <em>${p.date}</em><br>
          Назначение: ${p.purpose} (${p.amount} ${p.currency})<br>
          Контракт/инвойс: ${p.contractInvoice}<br>
          <strong>Номер поручения:</strong> ${p.orderNumber || '—'}<br>
          Получатель: ${p.receiverName}, ${p.receiverAddress}, ${p.receiverCountry}<br>
          SWIFT: ${p.swift}, Счёт: ${p.account}<br>
          feePercent: ${p.feePercent}%<br>
          <strong>Тип платежа:</strong> ${p.paymentType || 'Другое'}<br>
          Статус: ${p.status}
          <div style="margin-top:5px;">
            <button class="payEditBtn button button-sm" data-idx="${index}">Редактировать</button>
            <button class="payDelBtn button button-sm button-outline" data-idx="${index}">Удалить</button>
            <button class="payDocBtn button button-sm button-outline" data-idx="${index}">Поручение/Отчёт</button>
          </div>
        </div>
      `;
    });
    paysList.innerHTML = html;

    // Удаление
    paysList.querySelectorAll('.payDelBtn').forEach(btn => {
      btn.addEventListener('click', function() {
        let arr = JSON.parse(localStorage.getItem('payments')) || [];
        arr.sort((a,b) => new Date(b.date) - new Date(a.date));
        const i = +this.getAttribute('data-idx');
        arr.splice(i,1);
        localStorage.setItem('payments', JSON.stringify(arr));
        showToast('Платёж удалён!', 'info');
        renderPaymentsList();
      });
    });

    // Редактирование
    paysList.querySelectorAll('.payEditBtn').forEach(btn => {
      btn.addEventListener('click', function() {
        let arr = JSON.parse(localStorage.getItem('payments')) || [];
        arr.sort((a,b) => new Date(b.date) - new Date(a.date));
        editingIndex = +this.getAttribute('data-idx');
        const payObj = arr[editingIndex];
        payForm.reset();
        payFormTitle.textContent = `Редактировать ${payObj.id}`;
        cancelEditBtn.style.display = 'inline-block';
        payFormDiv.style.display   = 'block';

        payForm.elements['purpose'].value         = payObj.purpose;
        payForm.elements['contractInvoice'].value = payObj.contractInvoice;
        payForm.elements['orderNumber'].value     = payObj.orderNumber || '';
        payForm.elements['swift'].value           = payObj.swift;
        payForm.elements['account'].value         = payObj.account;
        payForm.elements['receiverName'].value    = payObj.receiverName;
        payForm.elements['receiverAddress'].value = payObj.receiverAddress;
        payForm.elements['receiverCountry'].value = payObj.receiverCountry;
        payForm.elements['amount'].value          = payObj.amount;
        payForm.elements['currency'].value        = payObj.currency;
        // загружаем paymentType:
        payForm.elements['paymentType'].value     = payObj.paymentType || 'Другое';

        if (isAdmin) {
          const sel = payForm.querySelector('select[name="status"]');
          if (sel) sel.value = payObj.status;
        }
      });
    });

    // Поручение / Отчёт PDF
    paysList.querySelectorAll('.payDocBtn').forEach(btn => {
      btn.addEventListener('click', function() {
        let arr = JSON.parse(localStorage.getItem('payments')) || [];
        arr.sort((a,b) => new Date(b.date) - new Date(a.date));
        const i = +this.getAttribute('data-idx');
        const payObj = arr[i];
        if (payObj.status === 'Исполнен') {
          showPdfAgentReport(payObj);
        } else if (payObj.status === 'Возвращен отправителю') {
          showPdfReturnRequest(payObj);
        } else {
          showPdfOrder(payObj);
        }
      });
    });
  }
  renderPaymentsList();

  // Вспомогательная функция генерации ID (6-значный УНП)
  function generatePaymentId(){
    const num = Math.floor(Math.random() * 1000000); // 0..999999
    const padded = num.toString().padStart(6,'0'); 
    return `УНП-${padded}`;
  }

  // PDF отчёт (Агент)
  async function showPdfAgentReport(payObj){
    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF();
    const totalFee  = (payObj.amount * (payObj.feePercent/100)).toFixed(2);

    let users = JSON.parse(localStorage.getItem('users'))||[];
    let user  = users.find(u => u.email === payObj.ownerEmail);
    let agrNo   = user ? user.agreementNo   : '';
    let agrDate = user ? user.agreementDate : '';

    doc.setFontSize(12);
    doc.text(`ОТЧЁТ АГЕНТА об исполнении поручения "${payObj.orderNumber}" (${payObj.id})`,10,20);
    if (agrNo || agrDate) {
      doc.text(`По договору № ${agrNo} от ${agrDate}`,10,30);
    }
    doc.text(`Дата платежа: ${payObj.date}`,10,40);

    let head = [['№','Сумма','Валюта','fee%','Итого']];
    let body = [[
      '1',
      payObj.amount,
      payObj.currency,
      `${payObj.feePercent}% => ${totalFee}`,
      `${(payObj.amount + +totalFee)} ${payObj.currency}`
    ]];
    doc.autoTable({ head, body, startY:50 });
    doc.text('Статус: Исполнен',10, doc.autoTable.previous.finalY+10);
    doc.text('Подпись агента: __________',10, doc.autoTable.previous.finalY+20);

    doc.save(`Отчет_${payObj.id}.pdf`);
  }

  // PDF возврат
  async function showPdfReturnRequest(payObj){
    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Заявление на возврат платежа "${payObj.orderNumber}" (${payObj.id})`,10,20);
    doc.text(`Сумма: ${payObj.amount} ${payObj.currency}`,10,30);
    doc.text(`Причина: ...`,10,40);
    doc.text(`Дата,Подпись`,10,60);
    doc.save(`Возврат_${payObj.id}.pdf`);
  }

  // Поручение
  async function showPdfOrder(payObj){
    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF();
    doc.setFontSize(12);

    let users = JSON.parse(localStorage.getItem('users'))||[];
    let user  = users.find(u => u.email === payObj.ownerEmail);
    let agrNo   = user ? user.agreementNo   : '';
    let agrDate = user ? user.agreementDate : '';
    const totalFee = (payObj.amount * (payObj.feePercent/100)).toFixed(2);

    doc.text(`Поручение № ${payObj.orderNumber} (ID: ${payObj.id}) от ${payObj.date}`,10,20);
    if (agrNo || agrDate){
      doc.text(`По договору № ${agrNo} от ${agrDate}`,10,30);
    }

    let head = [['№','Назначение','Сумма','Валюта','fee%','Итого']];
    let body = [[
      '1',
      payObj.purpose,
      payObj.amount,
      payObj.currency,
      `${payObj.feePercent}% => ${totalFee}`,
      `${(payObj.amount + +totalFee)} ${payObj.currency}`
    ]];
    doc.autoTable({ head, body, startY:40 });
    doc.text(`Получатель: ${payObj.receiverName}, ${payObj.receiverAddress}, ${payObj.receiverCountry}`,10, doc.autoTable.previous.finalY+10);
    doc.text(`SWIFT: ${payObj.swift}, Счёт: ${payObj.account}`,10, doc.autoTable.previous.finalY+20);
    doc.text(`Подпись агента: __________`,10, doc.autoTable.previous.finalY+40);

    doc.save(`Поручение_${payObj.id}.pdf`);
  }
}