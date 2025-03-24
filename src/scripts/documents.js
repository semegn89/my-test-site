// documents.js
import { showToast, showPreview } from './utils.js';

export function renderDocumentsPage(){
  const details=document.querySelector('.details');
  const currentUser=JSON.parse(localStorage.getItem('currentUser'))||{};
  const isAdmin=(currentUser.role==='admin');

  details.style.background='rgba(255,255,255,1)';

  details.innerHTML=`
    <h1>Документы</h1>
    <div style="margin-bottom:10px;">
      <label>Выберите УНП для загрузки:</label>
      <select id="paymentSelect" style="margin-left:5px;"></select>

      <!-- Выбор категории документа -->
      <select id="docCategory" class="button button-sm" style="margin-left:5px;">
        <option value="Другое">-- Категория --</option>
        <option value="Инвойс">Инвойс</option>
        <option value="Договор">Договор</option>
        <option value="Разрешение">Разрешение</option>
        <option value="Счёт">Счёт</option>
      </select>

      <input type="file" id="docFileInput" style="display:none;">
      <button id="chooseFileBtn" class="button button-sm" style="margin-left:5px;">Выбрать файл</button>
      <button id="uploadFileBtn" class="button button-sm" style="margin-left:5px;">Загрузить</button>
    </div>

    <!-- Простейшая индикация -->
    <div id="uploadStatus" style="color:blue;margin-bottom:10px;"></div>

    <div class="docs-container" id="docsContainer"></div>
  `;

  const paymentSelect  = details.querySelector('#paymentSelect');
  const docCategory    = details.querySelector('#docCategory');
  const docFileInput   = details.querySelector('#docFileInput');
  const chooseFileBtn  = details.querySelector('#chooseFileBtn');
  const uploadFileBtn  = details.querySelector('#uploadFileBtn');
  const docsContainer  = details.querySelector('#docsContainer');
  const uploadStatus   = details.querySelector('#uploadStatus');

  let payments=JSON.parse(localStorage.getItem('payments'))||[];
  if(!isAdmin){
    payments=payments.filter(p=>p.ownerEmail===currentUser.email);
  }
  payments.sort((a,b)=> new Date(b.date)- new Date(a.date));

  if(!payments.length){
    paymentSelect.innerHTML='<option value="">Нет платежей</option>';
  } else {
    paymentSelect.innerHTML='<option value="">-- Выберите УНП --</option>';
    payments.forEach(p=>{
      paymentSelect.innerHTML+=`<option value="${p.id}">${p.id} | ${p.purpose}</option>`;
    });
  }

  chooseFileBtn.addEventListener('click',()=>{
    docFileInput.click();
  });

  uploadFileBtn.addEventListener('click',()=>{
    const selectedUNP = paymentSelect.value;
    if(!selectedUNP){
      showToast('Сначала выберите УНП!','error');
      return;
    }
    const file = docFileInput.files[0];
    if(!file){
      showToast('Не выбран файл!','error');
      return;
    }
    const category = docCategory.value || 'Другое';

    // Показываем «индикатор»
    uploadStatus.textContent = `Загружаем файл "${file.name}"...`;

    let docs=JSON.parse(localStorage.getItem('documents'))||[];
    const docId=Date.now();

    const reader=new FileReader();
    reader.onload=function(e){
      // когда прочитали файл
      docs.push({
        id:docId,
        name:file.name,
        data:e.target.result,
        linkedPaymentId:selectedUNP,
        category: category  // <-- добавили
      });
      localStorage.setItem('documents', JSON.stringify(docs));

      showToast(`Файл "${file.name}" (${category}) привязан к ${selectedUNP}`,'success');
      uploadStatus.textContent = `Файл "${file.name}" загружен!`;
      docFileInput.value='';
      renderGroupedDocuments();
    };
    reader.readAsDataURL(file);
  });

  function renderGroupedDocuments(){
    docsContainer.innerHTML='';
    let docs=JSON.parse(localStorage.getItem('documents'))||[];
    let pays=JSON.parse(localStorage.getItem('payments'))||[];
    if(!isAdmin){
      pays=pays.filter(p=>p.ownerEmail===currentUser.email);
    }
    pays.sort((a,b)=> new Date(b.date)- new Date(a.date));

    pays.forEach(pay=>{
      const payDocs=docs.filter(d=> d.linkedPaymentId===pay.id);
      const cardDiv=document.createElement('div');
      cardDiv.classList.add('docs-card');
      cardDiv.innerHTML=`
        <h3>${pay.id} | ${pay.purpose}</h3>
        <div class="docs-list"></div>
      `;
      const docsList=cardDiv.querySelector('.docs-list');

      if(!payDocs.length){
        docsList.innerHTML='<p>Нет прикреплённых документов</p>';
      } else {
        let h='';
        payDocs.forEach(doc=>{
          h+=`
            <div class="payment-bubble">
              <strong>${doc.name}</strong> <em style="color:gray;">[${doc.category||'—'}]</em>
              <div style="margin-top:5px;">
                <button data-id="${doc.id}" class="preview-doc-btn button button-sm">Просмотр</button>
                <a href="${doc.data}" download="${doc.name}" class="button button-sm">Скачать</a>
                <button data-id="${doc.id}" class="delete-doc-btn button button-sm button-outline">Удалить</button>
              </div>
            </div>
          `;
        });
        docsList.innerHTML=h;
      }
      docsContainer.appendChild(cardDiv);
    });

    docsContainer.querySelectorAll('.preview-doc-btn').forEach(btn=>{
      btn.addEventListener('click',function(){
        const docId=this.getAttribute('data-id');
        openPreviewDoc(docId);
      });
    });
    docsContainer.querySelectorAll('.delete-doc-btn').forEach(btn=>{
      btn.addEventListener('click',function(){
        const docId=this.getAttribute('data-id');
        deleteDocument(docId);
      });
    });
  }
  function openPreviewDoc(docId){
    let docs=JSON.parse(localStorage.getItem('documents'))||[];
    const d=docs.find(x=> x.id==docId);
    if(!d)return;
    if(d.name.toLowerCase().endsWith('.pdf')){
      showPreview(`<iframe src="${d.data}" width="100%" height="600px"></iframe>`);
    } else if(/\.(png|jpg|jpeg)$/i.test(d.name)){
      showPreview(`<img src="${d.data}" style="max-width:100%;height:auto;" />`);
    } else {
      showPreview(`<p>Невозможно отобразить "${d.name}". Попробуйте скачать.</p>`);
    }
  }
  function deleteDocument(docId){
    let docs=JSON.parse(localStorage.getItem('documents'))||[];
    const idx=docs.findIndex(x=> x.id==docId);
    if(idx!==-1){
      docs.splice(idx,1);
      localStorage.setItem('documents', JSON.stringify(docs));
      showToast('Документ удалён!','info');
      renderGroupedDocuments();
    }
  }
  renderGroupedDocuments();
}