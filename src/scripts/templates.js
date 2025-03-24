// templates.js
import { showToast, showPreview } from './utils.js';

export function renderTemplatesPage(){
    const details=document.querySelector('.details');
    const currentUser=JSON.parse(localStorage.getItem('currentUser'))||{};
    const isAdmin=(currentUser.role==='admin');

    details.innerHTML=`
      <h1>Шаблоны документов</h1>
      <p>Ниже — список компаний/организаций (карточки). Нажмите, чтобы просмотреть/скачать их шаблоны.</p>
      ${
        isAdmin ? `<button id="addCompanyBtn" class="button" style="margin-bottom:10px;">Добавить новую «карточку»</button>` : ``
      }
      <div id="companiesContainer"></div>
    `;
    const addCompanyBtn=details.querySelector('#addCompanyBtn');
    const companiesContainer=details.querySelector('#companiesContainer');

    // Список компаний (карточек)
    let companies=JSON.parse(localStorage.getItem('templatesCompanies'))||[
      {id:'romashka', name:'ООО Ромашка'},
      {id:'vasilek', name:'ООО Василёк'}
    ];

    if(isAdmin && addCompanyBtn){
      addCompanyBtn.addEventListener('click',()=>{
        const name=prompt('Введите название новой компании (карточки), напр. ООО ЛЮТИК');
        if(!name)return;
        const cid = 'comp-'+Date.now();
        companies.push({id:cid, name});
        localStorage.setItem('templatesCompanies', JSON.stringify(companies));
        showToast(`Компания «${name}» добавлена!`,'success');
        renderCompanyCards();
      });
    }

    function renderCompanyCards(){
      companiesContainer.innerHTML='';
      if(!companies.length){
        companiesContainer.innerHTML='<p>Пока нет карточек компаний.</p>';
        return;
      }
      companies.forEach(comp=>{
        const card=document.createElement('div');
        card.classList.add('company-card');
        card.style.border='1px solid #ccc';
        card.style.borderRadius='8px';
        card.style.padding='10px';
        card.style.marginBottom='10px';
        card.style.display='flex';
        card.style.justifyContent='space-between';
        card.style.alignItems='center';

        card.innerHTML=`
          <div>
            <h3 style="margin:0;">${comp.name}</h3>
            <small style="color:#777;">ID: ${comp.id}</small>
          </div>
          <div>
            <button class="openCompanyBtn button button-sm" data-id="${comp.id}">Открыть</button>
            ${isAdmin ? `<button class="delCompanyBtn button button-sm button-outline" data-id="${comp.id}" style="margin-left:5px;">Удалить</button>` : ``}
          </div>
        `;
        companiesContainer.appendChild(card);
      });

      companiesContainer.querySelectorAll('.openCompanyBtn').forEach(btn=>{
        btn.addEventListener('click', function(){
          const cid = this.getAttribute('data-id');
          const found = companies.find(x => x.id === cid);
          if (!found) return;
          showCompanyTemplates(found.id, found.name);
        });
      });
      if(isAdmin){
        companiesContainer.querySelectorAll('.delCompanyBtn').forEach(btn=>{
          btn.addEventListener('click', function(){
            const cid = this.getAttribute('data-id');
            const idx = companies.findIndex(x => x.id===cid);
            if(idx!==-1){
              if(confirm('Удалить эту карточку компании?')){
                companies.splice(idx,1);
                localStorage.setItem('templatesCompanies', JSON.stringify(companies));
                renderCompanyCards();
              }
            }
          });
        });
      }
    }
    renderCompanyCards();

    function showCompanyTemplates(companyId, companyName){
      details.innerHTML=`
        <h1>Шаблоны для ${companyName}</h1>
        ${
          isAdmin? `<button id="addTmplBtn" class="button">Добавить шаблон</button>`:''
        }
        <div id="tmplList" style="margin-top:20px;"></div>
        <div id="tmplForm" style="display:none; margin-top:20px;">
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
      `;
      const tmplList=details.querySelector('#tmplList');
      const tmplForm=details.querySelector('#tmplForm');
      const newTemplateForm=details.querySelector('#newTemplateForm');
      const cancelTmpl=details.querySelector('#cancelTmpl');
      const addTmplBtn=details.querySelector('#addTmplBtn');

      let allTemplates=JSON.parse(localStorage.getItem('templates'))||{};
      if(!allTemplates[companyId]){
        allTemplates[companyId]=[];
      }

      function renderTmplList(){
        const arr=allTemplates[companyId];
        if(!arr.length){
          tmplList.innerHTML='<p>Нет шаблонов для данной компании.</p>';
          return;
        }
        let html='<ul>';
        arr.forEach(tmpl=>{
          html+=`
            <li style="margin-bottom:6px;">
              <strong>${tmpl.name}</strong> (${tmpl.fileName})
              <div>
                <button class="prevTmplBtn button button-sm" data-id="${tmpl.id}">Просмотр</button>
                <a href="${tmpl.data}" download="${tmpl.fileName}" class="button button-sm">Скачать</a>
                ${isAdmin? `<button class="delTmplBtn button button-sm button-outline" data-id="${tmpl.id}" style="margin-left:5px;">Удалить</button>`:''}
              </div>
            </li>
          `;
        });
        html+='</ul>';
        tmplList.innerHTML=html;

        tmplList.querySelectorAll('.prevTmplBtn').forEach(btn=>{
          btn.addEventListener('click',function(){
            const tid=+this.getAttribute('data-id');
            const arr=allTemplates[companyId];
            const found=arr.find(x=>x.id===tid);
            if(!found)return;
            if(found.fileName.toLowerCase().endsWith('.pdf')){
              showPreview(`<iframe src="${found.data}" width="100%" height="600px"></iframe>`);
            } else if(/\.(png|jpe?g)$/i.test(found.fileName)){
              showPreview(`<img src="${found.data}" style="max-width:100%;height:auto;" />`);
            } else {
              showPreview(`<p>Невозможно отобразить "${found.fileName}". Попробуйте скачать.</p>`);
            }
          });
        });
        tmplList.querySelectorAll('.delTmplBtn').forEach(btn=>{
          btn.addEventListener('click',function(){
            const tid=+this.getAttribute('data-id');
            const arr=allTemplates[companyId];
            const i=arr.findIndex(x=>x.id===tid);
            if(i!==-1){
              arr.splice(i,1);
              allTemplates[companyId]=arr;
              localStorage.setItem('templates', JSON.stringify(allTemplates));
              showToast('Шаблон удалён!','info');
              renderTmplList();
            }
          });
        });
      }
      renderTmplList();

      if(addTmplBtn){
        addTmplBtn.addEventListener('click',()=>{
          if(!isAdmin){
            showToast('Только админ может добавлять','error');
            return;
          }
          tmplForm.style.display='block';
        });
      }
      if(cancelTmpl){
        cancelTmpl.addEventListener('click',()=>{
          tmplForm.style.display='none';
          newTemplateForm.reset();
        });
      }
      if(newTemplateForm){
        newTemplateForm.addEventListener('submit',(e)=>{
          e.preventDefault();
          if(!isAdmin){
            showToast('Только админ может добавлять','error');
            return;
          }
          const fd=new FormData(newTemplateForm);
          const name=fd.get('name');
          const file=fd.get('file');
          if(!file){
            showToast('Не выбран файл','error');
            return;
          }
          const reader=new FileReader();
          reader.onload=function(ev){
            const dataURL=ev.target.result;
            const newTmpl={
              id:Date.now(),
              name,
              fileName:file.name,
              data:dataURL
            };
            allTemplates[companyId].push(newTmpl);
            localStorage.setItem('templates', JSON.stringify(allTemplates));
            showToast('Шаблон добавлен!','success');
            tmplForm.style.display='none';
            newTemplateForm.reset();
            renderTmplList();
          };
          reader.readAsDataURL(file);
        });
      }
    }
  }