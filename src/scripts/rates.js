// rates.js
import { showToast } from './utils.js';

export function renderRatesPage(){
    let defaultRates={RUB:1, AED:22, USD:88, EUR:94, CNY:14, GBP:122};
    let rates=JSON.parse(localStorage.getItem('adminRates'))||defaultRates;

    const details=document.querySelector('.details');
    const currentUser=JSON.parse(localStorage.getItem('currentUser'))||{};
    const isAdmin=(currentUser.role==='admin');

    details.style.background='rgba(255,255,255,1)';

    let html=`
      <h1>Курсы валют</h1>
      <p>1 AED = ${rates.AED} RUB</p>
      <p>1 USD = ${rates.USD} RUB</p>
      <p>1 EUR = ${rates.EUR} RUB</p>
      <p>1 CNY = ${rates.CNY} RUB</p>
      <p>1 GBP = ${rates.GBP} RUB</p>
    `;
    if(isAdmin){
      html += `
        <h3>Изменить курсы</h3>
        <form id="ratesForm">
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
    }
    details.innerHTML=html;

    if(isAdmin){
      const ratesForm=details.querySelector('#ratesForm');
      ratesForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        const fd=new FormData(ratesForm);
        const newRates={
          RUB:1,
          AED:parseFloat(fd.get('AED'))||22,
          USD:parseFloat(fd.get('USD'))||88,
          EUR:parseFloat(fd.get('EUR'))||94,
          CNY:parseFloat(fd.get('CNY'))||14,
          GBP:parseFloat(fd.get('GBP'))||122
        };
        localStorage.setItem('adminRates', JSON.stringify(newRates));
        showToast('Курсы сохранены!','success');
        renderRatesPage();
      });
    }
  }